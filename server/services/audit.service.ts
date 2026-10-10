import { db } from '../db/store.js';
import { AuditEvent, AuditEventType, UserRole, SourceType } from '../types.js';

export class AuditService {
  static log(params: {
    actorUserId?: string;
    actorName: string;
    actorRole: UserRole | 'SYSTEM';
    eventType: AuditEventType;
    patientId?: string;
    documentId?: string;
    documentTitle?: string;
    accessRequestId?: string;
    consentGrantId?: string;
    externalWorkflowId?: string;
    sourceType?: SourceType;
    outcome: 'SUCCESS' | 'DENIED' | 'PENDING' | 'ERROR';
    reasonCode?: string;
    correlationId?: string;
    safeMetadata?: Record<string, any>;
  }): AuditEvent {
    const correlationId = params.correlationId || `corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const event: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorUserId: params.actorUserId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      eventType: params.eventType,
      patientId: params.patientId,
      documentId: params.documentId,
      documentTitle: params.documentTitle,
      accessRequestId: params.accessRequestId,
      consentGrantId: params.consentGrantId,
      externalWorkflowId: params.externalWorkflowId,
      sourceType: params.sourceType,
      outcome: params.outcome,
      reasonCode: params.reasonCode,
      correlationId,
      occurredAt: new Date().toISOString(),
      safeMetadata: params.safeMetadata || {},
    };

    // Prepend to show latest first
    db.auditEvents.unshift(event);
    return event;
  }

  static getEvents(filter?: {
    patientId?: string;
    actorUserId?: string;
    documentId?: string;
    eventType?: AuditEventType;
    limit?: number;
  }): AuditEvent[] {
    let list = [...db.auditEvents];
    if (filter?.patientId) {
      list = list.filter((e) => e.patientId === filter.patientId);
    }
    if (filter?.actorUserId) {
      list = list.filter((e) => e.actorUserId === filter.actorUserId);
    }
    if (filter?.documentId) {
      list = list.filter((e) => e.documentId === filter.documentId);
    }
    if (filter?.eventType) {
      list = list.filter((e) => e.eventType === filter.eventType);
    }
    if (filter?.limit) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }
}
