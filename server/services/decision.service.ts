import { db } from '../db/store.js';
import { AuditService } from './audit.service.js';
import { DecisionOutcome, PermittedAction, UserRole } from '../types.js';

export interface EvaluationResult {
  decision: DecisionOutcome;
  reasonCode: string;
  message: string;
  documentTitle?: string;
  storageLocation?: 'EXTERNAL' | 'PLATFORM';
  sourceType?: string;
  consentGrantId?: string;
  externalWorkflowStatus?: string;
  externalPortalUrl?: string;
}

export class PermissionDecisionService {
  /**
   * Evaluates access to a medical document.
   * Deny-by-default architecture.
   */
  static evaluateDocumentAccess(params: {
    requesterUserId: string;
    requesterRole: UserRole;
    documentId: string;
    action: PermittedAction;
    purpose?: string;
  }): EvaluationResult {
    const { requesterUserId, requesterRole, documentId, action } = params;

    const user = db.users.get(requesterUserId);
    if (!user) {
      return {
        decision: 'DENY',
        reasonCode: 'UNAUTHENTICATED_OR_UNKNOWN_USER',
        message: 'Requester user profile was not found.',
      };
    }

    const document = db.documents.get(documentId);
    if (!document || document.deletedAt || document.availabilityStatus === 'DELETED') {
      return {
        decision: 'DENY',
        reasonCode: 'DOCUMENT_NOT_FOUND',
        message: 'The requested document does not exist or has been removed.',
      };
    }

    // Check if requester is the patient who owns the document
    const patientProfile = Array.from(db.patientProfiles.values()).find(
      (p) => p.userId === requesterUserId
    );
    const isOwnerPatient = patientProfile && patientProfile.id === document.patientId;

    // RULE 1: EXTERNAL DOCUMENTS CAN NEVER BE RETRIEVED OR STREAMED BY THIS PLATFORM
    if (document.storageLocation === 'EXTERNAL') {
      // Find if there is an active external workflow
      const externalWf = Array.from(db.externalWorkflows.values()).find(
        (wf) => wf.documentId === document.id && wf.patientId === document.patientId
      );

      AuditService.log({
        actorUserId: requesterUserId,
        actorName: user.displayName,
        actorRole: requesterRole,
        eventType: 'ACCESS_DENIED',
        patientId: document.patientId,
        documentId: document.id,
        documentTitle: document.title,
        sourceType: document.sourceType,
        outcome: 'DENIED',
        reasonCode: 'EXTERNAL_DOCUMENT_CANNOT_BE_SERVED',
        safeMetadata: {
          storageLocation: 'EXTERNAL',
          attemptedAction: action,
          sourceType: document.sourceType,
          workflowStatus: externalWf?.status || 'NO_WORKFLOW',
        },
      });

      return {
        decision: 'EXTERNAL_ACTION_REQUIRED',
        reasonCode: 'EXTERNAL_DOCUMENT_MUST_BE_ACCESSED_AT_SOURCE',
        message:
          `This document is stored at an external source (${document.sourceType === 'DIGILOCKER' ? 'DigiLocker' : 'Hospital EHR'}). ` +
          `Continuum Health stores only verified references and permitted metadata. Direct retrieval or file download is forbidden. ` +
          `Please proceed through the verified source authorization portal.`,
        documentTitle: document.title,
        storageLocation: 'EXTERNAL',
        sourceType: document.sourceType,
        externalWorkflowStatus: externalWf?.status,
        externalPortalUrl: document.metadata.externalPortalUrl,
      };
    }

    // RULE 2: If requester is the owning patient viewing their own uploaded document
    if (isOwnerPatient && requesterRole === 'PATIENT') {
      AuditService.log({
        actorUserId: requesterUserId,
        actorName: user.displayName,
        actorRole: 'PATIENT',
        eventType: 'DOCUMENT_VIEWED',
        patientId: document.patientId,
        documentId: document.id,
        documentTitle: document.title,
        sourceType: 'UPLOAD',
        outcome: 'SUCCESS',
        safeMetadata: { accessType: 'PATIENT_OWNER_VIEW', action },
      });

      return {
        decision: 'ALLOW',
        reasonCode: 'PATIENT_OWNER_ACCESS',
        message: 'Access permitted for owning patient.',
        documentTitle: document.title,
        storageLocation: 'PLATFORM',
        sourceType: 'UPLOAD',
      };
    }

    // RULE 3: Requester is a Healthcare Provider
    if (requesterRole === 'PROVIDER') {
      const providerProfile = Array.from(db.providerProfiles.values()).find(
        (pr) => pr.userId === requesterUserId
      );

      if (!providerProfile) {
        AuditService.log({
          actorUserId: requesterUserId,
          actorName: user.displayName,
          actorRole: 'PROVIDER',
          eventType: 'ACCESS_DENIED',
          patientId: document.patientId,
          documentId: document.id,
          documentTitle: document.title,
          outcome: 'DENIED',
          reasonCode: 'PROVIDER_PROFILE_NOT_FOUND',
        });

        return {
          decision: 'DENY',
          reasonCode: 'PROVIDER_PROFILE_NOT_FOUND',
          message: 'Healthcare provider profile is incomplete or unverified.',
        };
      }

      if (providerProfile.verificationStatus !== 'VERIFIED') {
        AuditService.log({
          actorUserId: requesterUserId,
          actorName: user.displayName,
          actorRole: 'PROVIDER',
          eventType: 'ACCESS_DENIED',
          patientId: document.patientId,
          documentId: document.id,
          documentTitle: document.title,
          outcome: 'DENIED',
          reasonCode: 'PROVIDER_NOT_VERIFIED',
        });

        return {
          decision: 'DENY',
          reasonCode: 'PROVIDER_NOT_VERIFIED',
          message: 'Access denied: Provider verification is pending or rejected.',
        };
      }

      // Check active consent grants for this specific provider and document
      const now = new Date().toISOString();
      const matchingGrant = Array.from(db.consentGrants.values()).find((grant) => {
        if (grant.patientId !== document.patientId) return false;
        if (grant.granteeProviderId !== providerProfile.id) return false;

        // Check if grant item includes this exact document
        const hasDoc = grant.items.some(
          (item) => item.documentId === document.id && item.permittedActions.includes(action)
        );
        return hasDoc;
      });

      if (!matchingGrant) {
        AuditService.log({
          actorUserId: requesterUserId,
          actorName: user.displayName,
          actorRole: 'PROVIDER',
          eventType: 'ACCESS_DENIED',
          patientId: document.patientId,
          documentId: document.id,
          documentTitle: document.title,
          outcome: 'DENIED',
          reasonCode: 'NO_ACTIVE_GRANT_FOR_DOCUMENT',
          safeMetadata: { providerName: providerProfile.displayName, action },
        });

        return {
          decision: 'DENY',
          reasonCode: 'NO_ACTIVE_GRANT_FOR_DOCUMENT',
          message: `Access denied: No active consent grant authorizes Dr. ${providerProfile.displayName} to view this uploaded document.`,
        };
      }

      if (matchingGrant.status === 'REVOKED') {
        AuditService.log({
          actorUserId: requesterUserId,
          actorName: user.displayName,
          actorRole: 'PROVIDER',
          eventType: 'ACCESS_DENIED',
          patientId: document.patientId,
          documentId: document.id,
          documentTitle: document.title,
          consentGrantId: matchingGrant.id,
          outcome: 'DENIED',
          reasonCode: 'GRANT_REVOKED',
          safeMetadata: { revokedAt: matchingGrant.revokedAt },
        });

        return {
          decision: 'DENY',
          reasonCode: 'GRANT_REVOKED',
          message: 'Access denied: The patient has revoked access to this document.',
        };
      }

      if (matchingGrant.status === 'EXPIRED' || matchingGrant.validUntil < now) {
        AuditService.log({
          actorUserId: requesterUserId,
          actorName: user.displayName,
          actorRole: 'PROVIDER',
          eventType: 'ACCESS_DENIED',
          patientId: document.patientId,
          documentId: document.id,
          documentTitle: document.title,
          consentGrantId: matchingGrant.id,
          outcome: 'DENIED',
          reasonCode: 'GRANT_EXPIRED',
          safeMetadata: { validUntil: matchingGrant.validUntil },
        });

        return {
          decision: 'DENY',
          reasonCode: 'GRANT_EXPIRED',
          message: 'Access denied: The consent grant validity period has expired.',
        };
      }

      if (matchingGrant.status !== 'ACTIVE') {
        AuditService.log({
          actorUserId: requesterUserId,
          actorName: user.displayName,
          actorRole: 'PROVIDER',
          eventType: 'ACCESS_DENIED',
          patientId: document.patientId,
          documentId: document.id,
          documentTitle: document.title,
          outcome: 'DENIED',
          reasonCode: `GRANT_STATUS_${matchingGrant.status}`,
        });

        return {
          decision: 'DENY',
          reasonCode: 'GRANT_INACTIVE',
          message: `Access denied: Grant status is currently ${matchingGrant.status}.`,
        };
      }

      // Successful verification
      AuditService.log({
        actorUserId: requesterUserId,
        actorName: user.displayName,
        actorRole: 'PROVIDER',
        eventType: 'DOCUMENT_VIEWED',
        patientId: document.patientId,
        documentId: document.id,
        documentTitle: document.title,
        consentGrantId: matchingGrant.id,
        outcome: 'SUCCESS',
        safeMetadata: {
          providerName: providerProfile.displayName,
          purpose: matchingGrant.purpose,
          action,
        },
      });

      return {
        decision: 'ALLOW',
        reasonCode: 'ACTIVE_CONSENT_GRANT_VERIFIED',
        message: 'Authorised via active patient consent grant.',
        documentTitle: document.title,
        storageLocation: 'PLATFORM',
        sourceType: 'UPLOAD',
        consentGrantId: matchingGrant.id,
      };
    }

    // Default deny for administrators or unknown roles (admins cannot read medical files)
    AuditService.log({
      actorUserId: requesterUserId,
      actorName: user.displayName,
      actorRole: requesterRole,
      eventType: 'ACCESS_DENIED',
      patientId: document.patientId,
      documentId: document.id,
      documentTitle: document.title,
      outcome: 'DENIED',
      reasonCode: 'ROLE_NOT_AUTHORIZED_FOR_CLINICAL_CONTENT',
      safeMetadata: { requesterRole },
    });

    return {
      decision: 'DENY',
      reasonCode: 'ROLE_NOT_AUTHORIZED_FOR_CLINICAL_CONTENT',
      message: 'Administrators and unprivileged roles do not have clinical document viewing access.',
    };
  }
}
