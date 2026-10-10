import { db } from '../db/store.js';
import { AuditService } from './audit.service.js';
import {
  AccessRequest,
  AccessRequestItem,
  AccessRequestStatus,
  ConsentGrant,
  ConsentGrantItem,
  DocumentDecision,
  ExternalSharingWorkflow,
  PermittedAction,
  SourceWorkflowStatus,
} from '../types.js';

export interface DecisionPayloadItem {
  documentId: string;
  decision: 'APPROVE' | 'DENY';
}

export class ConsentService {
  /**
   * Healthcare provider creates an access request for a patient
   */
  static createAccessRequest(params: {
    requestingProviderId: string;
    patientId: string;
    documentIds: string[];
    purpose: string;
    reason: string;
    requestedDurationDays?: number;
    actorUserId: string;
  }): AccessRequest {
    const {
      requestingProviderId,
      patientId,
      documentIds,
      purpose,
      reason,
      requestedDurationDays = 14,
      actorUserId,
    } = params;

    const provider = db.providerProfiles.get(requestingProviderId);
    if (!provider) {
      throw new Error('Provider not found');
    }
    const patient = db.patientProfiles.get(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    const startAt = new Date();
    const expiryAt = new Date();
    expiryAt.setDate(startAt.getDate() + requestedDurationDays);

    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Build items
    const items: AccessRequestItem[] = documentIds.map((docId) => {
      const doc = db.documents.get(docId);
      if (!doc || doc.patientId !== patientId) {
        throw new Error(`Invalid document ID: ${docId}`);
      }
      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        accessRequestId: requestId,
        documentId: docId,
        requestedActions: ['VIEW'] as PermittedAction[],
        patientDecision: 'PENDING' as DocumentDecision,
        sourceWorkflowStatus:
          doc.storageLocation === 'PLATFORM'
            ? ('NOT_REQUIRED' as SourceWorkflowStatus)
            : ('NOT_STARTED' as SourceWorkflowStatus),
      };
    });

    const request: AccessRequest = {
      id: requestId,
      patientId,
      requestingProviderId,
      organisationId: provider.organisationId,
      purpose,
      reason,
      requestedStartAt: startAt.toISOString(),
      requestedExpiryAt: expiryAt.toISOString(),
      requestStatus: 'PENDING_PATIENT_APPROVAL',
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.accessRequests.set(requestId, request);

    AuditService.log({
      actorUserId,
      actorName: provider.displayName,
      actorRole: 'PROVIDER',
      eventType: 'ACCESS_REQUEST_CREATED',
      patientId,
      accessRequestId: requestId,
      outcome: 'SUCCESS',
      safeMetadata: {
        providerName: provider.displayName,
        purpose,
        documentCount: documentIds.length,
      },
    });

    return request;
  }

  /**
   * Patient reviews and submits selective decisions for an access request
   */
  static processConsentDecision(params: {
    accessRequestId: string;
    patientId: string;
    decisions: DecisionPayloadItem[];
    actorUserId: string;
  }) {
    const { accessRequestId, patientId, decisions, actorUserId } = params;

    const request = db.accessRequests.get(accessRequestId);
    if (!request || request.patientId !== patientId) {
      throw new Error('Access request not found or not owned by patient');
    }

    if (request.requestStatus !== 'PENDING_PATIENT_APPROVAL') {
      throw new Error(`Request is already in status: ${request.requestStatus}`);
    }

    const provider = db.providerProfiles.get(request.requestingProviderId);
    if (!provider) {
      throw new Error('Associated provider profile missing');
    }

    let approvedPlatformDocIds: string[] = [];
    let approvedExternalDocIds: string[] = [];
    let deniedCount = 0;

    // Map decisions to items
    const decisionMap = new Map(decisions.map((d) => [d.documentId, d.decision]));

    for (const item of request.items) {
      const decision = decisionMap.get(item.documentId) || 'DENY';
      const doc = db.documents.get(item.documentId);
      if (!doc) continue;

      item.patientDecision = decision;
      item.decidedAt = new Date().toISOString();

      if (decision === 'APPROVE') {
        if (doc.storageLocation === 'PLATFORM') {
          approvedPlatformDocIds.push(doc.id);
          item.sourceWorkflowStatus = 'NOT_REQUIRED';
        } else {
          // EXTERNAL RECORD
          approvedExternalDocIds.push(doc.id);
          item.sourceWorkflowStatus = 'PENDING_EXTERNAL_CONFIRMATION';

          // Create or update external sharing workflow
          const wfId = `wf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const wf: ExternalSharingWorkflow = {
            id: wfId,
            patientId,
            documentId: doc.id,
            recipientProviderId: provider.id,
            recipientOrganisationId: provider.organisationId,
            sourceType: doc.sourceType,
            purpose: request.purpose,
            status: 'PENDING_EXTERNAL_CONFIRMATION',
            initiatedAt: new Date().toISOString(),
            expiresAt: request.requestedExpiryAt,
            lastCheckedAt: new Date().toISOString(),
            note: `Consent recorded by patient. Awaiting verification from ${doc.sourceType === 'DIGILOCKER' ? 'DigiLocker authorization gateway' : doc.issuerName}.`,
          };
          db.externalWorkflows.set(wfId, wf);

          AuditService.log({
            actorUserId,
            actorName: 'Patient Consent Gateway',
            actorRole: 'PATIENT',
            eventType: 'EXTERNAL_SHARING_INITIATED',
            patientId,
            documentId: doc.id,
            documentTitle: doc.title,
            externalWorkflowId: wfId,
            sourceType: doc.sourceType,
            outcome: 'PENDING',
            safeMetadata: {
              sourceType: doc.sourceType,
              status: 'PENDING_EXTERNAL_CONFIRMATION',
              recipient: provider.displayName,
            },
          });
        }
      } else {
        deniedCount++;
        item.sourceWorkflowStatus = 'DENIED';
      }
    }

    // Determine overall request status
    const totalApproved = approvedPlatformDocIds.length + approvedExternalDocIds.length;
    let newStatus: AccessRequestStatus = 'DENIED';
    if (totalApproved > 0 && deniedCount > 0) {
      newStatus = 'PARTIALLY_APPROVED';
    } else if (totalApproved > 0 && deniedCount === 0) {
      newStatus = 'APPROVED';
    }

    request.requestStatus = newStatus;
    request.patientDecidedAt = new Date().toISOString();
    request.updatedAt = new Date().toISOString();

    // If any PLATFORM documents were approved, create a Platform Consent Grant
    let createdGrant: ConsentGrant | null = null;
    if (approvedPlatformDocIds.length > 0) {
      const grantId = `grant-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      createdGrant = {
        id: grantId,
        patientId,
        granteeProviderId: provider.id,
        organisationId: provider.organisationId,
        purpose: request.purpose,
        validFrom: new Date().toISOString(),
        validUntil: request.requestedExpiryAt,
        status: 'ACTIVE',
        grantedAt: new Date().toISOString(),
        createdFromAccessRequestId: request.id,
        items: approvedPlatformDocIds.map((docId) => ({
          id: `gitem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          consentGrantId: grantId,
          documentId: docId,
          permittedActions: ['VIEW'] as PermittedAction[],
        })),
      };
      db.consentGrants.set(grantId, createdGrant);

      AuditService.log({
        actorUserId,
        actorName: 'Patient Consent Gateway',
        actorRole: 'PATIENT',
        eventType: 'PLATFORM_GRANT_CREATED',
        patientId,
        consentGrantId: grantId,
        outcome: 'SUCCESS',
        safeMetadata: {
          granteeProvider: provider.displayName,
          approvedPlatformDocs: approvedPlatformDocIds.length,
          validUntil: request.requestedExpiryAt,
        },
      });
    }

    AuditService.log({
      actorUserId,
      actorName: 'Patient Consent Gateway',
      actorRole: 'PATIENT',
      eventType: 'ACCESS_REQUEST_DECIDED',
      patientId,
      accessRequestId: request.id,
      outcome: 'SUCCESS',
      safeMetadata: {
        requestStatus: newStatus,
        approvedPlatformCount: approvedPlatformDocIds.length,
        approvedExternalCount: approvedExternalDocIds.length,
        deniedCount,
      },
    });

    return {
      request,
      createdGrant,
      approvedPlatformDocIds,
      approvedExternalDocIds,
    };
  }

  /**
   * Revoke a platform consent grant (immediately cuts off doctor access)
   */
  static revokeConsentGrant(grantId: string, patientId: string, actorUserId: string) {
    const grant = db.consentGrants.get(grantId);
    if (!grant || grant.patientId !== patientId) {
      throw new Error('Consent grant not found or not owned by patient');
    }

    grant.status = 'REVOKED';
    grant.revokedAt = new Date().toISOString();

    const provider = db.providerProfiles.get(grant.granteeProviderId);

    AuditService.log({
      actorUserId,
      actorName: 'Patient Consent Gateway',
      actorRole: 'PATIENT',
      eventType: 'GRANT_REVOKED',
      patientId,
      consentGrantId: grant.id,
      outcome: 'SUCCESS',
      safeMetadata: {
        grantee: provider?.displayName,
        revokedAt: grant.revokedAt,
        affectedDocuments: grant.items.map((i) => i.documentId),
      },
    });

    return grant;
  }

  /**
   * Revoke external workflow
   */
  static revokeExternalWorkflow(workflowId: string, patientId: string, actorUserId: string) {
    const wf = db.externalWorkflows.get(workflowId);
    if (!wf || wf.patientId !== patientId) {
      throw new Error('External workflow not found or not owned by patient');
    }

    // Set status to REVOCATION_PENDING (simulating external protocol coordination)
    wf.status = 'REVOCATION_PENDING';
    wf.lastCheckedAt = new Date().toISOString();

    AuditService.log({
      actorUserId,
      actorName: 'Patient Consent Gateway',
      actorRole: 'PATIENT',
      eventType: 'EXTERNAL_REVOCATION_INITIATED',
      patientId,
      externalWorkflowId: wf.id,
      documentId: wf.documentId,
      sourceType: wf.sourceType,
      outcome: 'PENDING',
      safeMetadata: {
        status: 'REVOCATION_PENDING',
        note: 'External revocation initiated with provider source.',
      },
    });

    return wf;
  }
}
