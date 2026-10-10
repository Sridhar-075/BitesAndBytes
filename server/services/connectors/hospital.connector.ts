import { db } from '../../db/store.js';
import { AuditService } from '../audit.service.js';

export class HospitalMockConnector {
  /**
   * Simulates external provider/hospital confirmation of a pending sharing workflow
   */
  static mockConfirm(workflowId: string, actorUserId: string) {
    const wf = db.externalWorkflows.get(workflowId);
    if (!wf) {
      throw new Error('External workflow not found');
    }

    if (wf.status !== 'PENDING_EXTERNAL_CONFIRMATION' && wf.status !== 'PENDING_PATIENT_ACTION') {
      throw new Error(`Cannot confirm workflow in status: ${wf.status}`);
    }

    wf.status = 'CONFIRMED';
    wf.confirmedAt = new Date().toISOString();
    wf.lastCheckedAt = new Date().toISOString();
    wf.note = 'Simulated confirmation: External healthcare system verified authorization token and confirmed record sharing availability.';

    const doc = db.documents.get(wf.documentId);
    const provider = db.providerProfiles.get(wf.recipientProviderId);

    AuditService.log({
      actorUserId,
      actorName: 'Hospital EHR Gateway (Mock Adapter)',
      actorRole: 'SYSTEM',
      eventType: 'EXTERNAL_SHARING_CONFIRMED',
      patientId: wf.patientId,
      documentId: wf.documentId,
      documentTitle: doc?.title,
      externalWorkflowId: wf.id,
      sourceType: wf.sourceType,
      outcome: 'SUCCESS',
      safeMetadata: {
        confirmedAt: wf.confirmedAt,
        recipient: provider?.displayName,
        sourceType: wf.sourceType,
      },
    });

    return wf;
  }

  /**
   * Simulates external provider/hospital denial or rejection of external sharing
   */
  static mockDeny(workflowId: string, reason: string, actorUserId: string) {
    const wf = db.externalWorkflows.get(workflowId);
    if (!wf) {
      throw new Error('External workflow not found');
    }

    wf.status = 'DENIED';
    wf.lastCheckedAt = new Date().toISOString();
    wf.errorCode = 'SOURCE_AUTH_REJECTED';
    wf.note = `External source denied request: ${reason || 'Patient credential mismatch at external portal'}`;

    const doc = db.documents.get(wf.documentId);

    AuditService.log({
      actorUserId,
      actorName: 'Hospital EHR Gateway (Mock Adapter)',
      actorRole: 'SYSTEM',
      eventType: 'EXTERNAL_SHARING_DENIED',
      patientId: wf.patientId,
      documentId: wf.documentId,
      documentTitle: doc?.title,
      externalWorkflowId: wf.id,
      sourceType: wf.sourceType,
      outcome: 'DENIED',
      safeMetadata: { reason: wf.note },
    });

    return wf;
  }

  /**
   * Simulates external hospital confirming revocation
   */
  static mockRevocationConfirm(workflowId: string, actorUserId: string) {
    const wf = db.externalWorkflows.get(workflowId);
    if (!wf) {
      throw new Error('External workflow not found');
    }

    wf.status = 'REVOKED';
    wf.revokedAt = new Date().toISOString();
    wf.lastCheckedAt = new Date().toISOString();
    wf.note = 'External provider acknowledged consent withdrawal and terminated remote access session.';

    const doc = db.documents.get(wf.documentId);

    AuditService.log({
      actorUserId,
      actorName: 'Hospital EHR Gateway (Mock Adapter)',
      actorRole: 'SYSTEM',
      eventType: 'EXTERNAL_REVOCATION_CONFIRMED',
      patientId: wf.patientId,
      documentId: wf.documentId,
      documentTitle: doc?.title,
      externalWorkflowId: wf.id,
      sourceType: wf.sourceType,
      outcome: 'SUCCESS',
      safeMetadata: { revokedAt: wf.revokedAt },
    });

    return wf;
  }
}
