import { db } from '../db/store.js';
import { AuditService } from './audit.service.js';
import {
  MedicalDocument,
  SourceType,
  DocumentType,
  AvailabilityStatus,
} from '../types.js';

export class CatalogueService {
  static getDocuments(params: {
    patientId: string;
    sourceType?: SourceType;
    documentType?: DocumentType;
    searchQuery?: string;
    availabilityStatus?: AvailabilityStatus;
    page?: number;
    pageSize?: number;
  }) {
    const {
      patientId,
      sourceType,
      documentType,
      searchQuery,
      availabilityStatus,
      page = 1,
      pageSize = 20,
    } = params;

    let items = Array.from(db.documents.values()).filter((doc) => {
      if (doc.patientId !== patientId) return false;
      if (doc.deletedAt) return false;
      if (sourceType && doc.sourceType !== sourceType) return false;
      if (documentType && doc.documentType !== documentType) return false;
      if (availabilityStatus && doc.availabilityStatus !== availabilityStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesIssuer = doc.issuerName.toLowerCase().includes(q);
        const matchesCategory = doc.documentType.toLowerCase().includes(q);
        if (!matchesTitle && !matchesIssuer && !matchesCategory) return false;
      }
      return true;
    });

    // Sort newest record date first
    items.sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());

    const total = items.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    // Attach active sharing metadata for frontend display
    const enriched = paginatedItems.map((doc) => {
      // Check active consent grants
      const activeGrant = Array.from(db.consentGrants.values()).find(
        (g) =>
          g.patientId === patientId &&
          g.status === 'ACTIVE' &&
          g.items.some((i) => i.documentId === doc.id)
      );

      // Check external workflow
      const externalWf = Array.from(db.externalWorkflows.values()).find(
        (wf) => wf.documentId === doc.id && wf.patientId === patientId
      );

      let sharingStatus: 'NOT_SHARED' | 'SHARED' | 'EXTERNAL_PENDING' | 'REVOKED' = 'NOT_SHARED';
      let activeRecipientName: string | undefined;

      if (doc.storageLocation === 'PLATFORM') {
        if (activeGrant) {
          sharingStatus = 'SHARED';
          const p = db.providerProfiles.get(activeGrant.granteeProviderId);
          activeRecipientName = p?.displayName;
        }
      } else {
        if (externalWf) {
          if (externalWf.status === 'CONFIRMED') {
            sharingStatus = 'SHARED';
          } else if (
            externalWf.status === 'PENDING_EXTERNAL_CONFIRMATION' ||
            externalWf.status === 'PENDING_PATIENT_ACTION'
          ) {
            sharingStatus = 'EXTERNAL_PENDING';
          } else if (externalWf.status === 'REVOKED') {
            sharingStatus = 'REVOKED';
          }
          const p = db.providerProfiles.get(externalWf.recipientProviderId);
          activeRecipientName = p?.displayName;
        }
      }

      // Safe representation - NEVER exposes internalStorageKey
      return {
        id: doc.id,
        patientId: doc.patientId,
        sourceType: doc.sourceType,
        storageLocation: doc.storageLocation,
        documentType: doc.documentType,
        title: doc.title,
        issuerName: doc.issuerName,
        recordDate: doc.recordDate,
        sourceDocumentReference: doc.sourceDocumentReference,
        availabilityStatus: doc.availabilityStatus,
        metadata: doc.metadata,
        fileMimeType: doc.fileMimeType,
        fileSizeBytes: doc.fileSizeBytes,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        sharingStatus,
        activeRecipientName,
        externalWorkflowStatus: externalWf?.status,
        hasSimulationContent: !!doc.simulatedContent,
      };
    });

    return {
      items: enriched,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  static getDocumentById(patientId: string, documentId: string) {
    const doc = db.documents.get(documentId);
    if (!doc || doc.patientId !== patientId || doc.deletedAt) {
      return null;
    }

    const activeGrant = Array.from(db.consentGrants.values()).find(
      (g) =>
        g.patientId === patientId &&
        g.status === 'ACTIVE' &&
        g.items.some((i) => i.documentId === doc.id)
    );

    const externalWf = Array.from(db.externalWorkflows.values()).find(
      (wf) => wf.documentId === doc.id && wf.patientId === patientId
    );

    return {
      ...doc,
      internalStorageKey: undefined, // REDACTED for security
      activeGrant: activeGrant
        ? {
            id: activeGrant.id,
            status: activeGrant.status,
            validUntil: activeGrant.validUntil,
            grantee: db.providerProfiles.get(activeGrant.granteeProviderId)?.displayName,
          }
        : null,
      externalWorkflow: externalWf || null,
    };
  }

  static addExternalReference(params: {
    patientId: string;
    sourceType: 'DIGILOCKER' | 'HOSPITAL' | 'LABORATORY' | 'OTHER';
    documentType: DocumentType;
    title: string;
    issuerName: string;
    recordDate: string;
    sourceDocumentReference: string;
    sourceConnectionId?: string;
    metadata?: Record<string, any>;
    actorUserId: string;
  }) {
    const {
      patientId,
      sourceType,
      documentType,
      title,
      issuerName,
      recordDate,
      sourceDocumentReference,
      sourceConnectionId,
      metadata = {},
      actorUserId,
    } = params;

    const id = `doc-ext-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newDoc: MedicalDocument = {
      id,
      patientId,
      sourceType,
      storageLocation: 'EXTERNAL', // MANDATORY
      documentType,
      title,
      issuerName,
      recordDate,
      sourceConnectionId,
      sourceDocumentReference,
      internalStorageKey: undefined, // FORBIDDEN FOR EXTERNAL
      availabilityStatus: 'AVAILABLE',
      metadata: {
        ...metadata,
        externalDirectUrlPermitted: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.documents.set(id, newDoc);

    const actor = db.users.get(actorUserId);
    AuditService.log({
      actorUserId,
      actorName: actor?.displayName || 'Patient',
      actorRole: 'PATIENT',
      eventType: 'RECORD_LINKED',
      patientId,
      documentId: id,
      documentTitle: title,
      sourceType,
      outcome: 'SUCCESS',
      safeMetadata: {
        issuerName,
        sourceDocumentReference,
        storageLocation: 'EXTERNAL',
      },
    });

    return newDoc;
  }

  static uploadDocument(params: {
    patientId: string;
    documentType: DocumentType;
    title: string;
    issuerName: string;
    recordDate: string;
    fileMimeType: string;
    fileSizeBytes: number;
    metadata?: Record<string, any>;
    simulatedContent?: {
      summary: string;
      findings?: string[];
      clinicalNotes?: string;
    };
    actorUserId: string;
  }) {
    const {
      patientId,
      documentType,
      title,
      issuerName,
      recordDate,
      fileMimeType,
      fileSizeBytes,
      metadata = {},
      simulatedContent,
      actorUserId,
    } = params;

    const id = `doc-up-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const storageKey = `vault/${patientId}/docs/${id}.pdf`;

    const newDoc: MedicalDocument = {
      id,
      patientId,
      sourceType: 'UPLOAD',
      storageLocation: 'PLATFORM', // MANDATORY
      documentType,
      title,
      issuerName,
      recordDate,
      internalStorageKey: storageKey,
      fileMimeType: fileMimeType || 'application/pdf',
      fileSizeBytes: fileSizeBytes || 1024000,
      availabilityStatus: 'AVAILABLE',
      metadata: {
        ...metadata,
        confidentiality: 'RESTRICTED',
      },
      simulatedContent: simulatedContent || {
        summary: `Patient uploaded document: ${title}`,
        findings: ['Diagnostic findings provided directly from accredited healthcare laboratory scan.'],
        clinicalNotes: 'Verified patient upload to encrypted platform vault.',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.documents.set(id, newDoc);

    const actor = db.users.get(actorUserId);
    AuditService.log({
      actorUserId,
      actorName: actor?.displayName || 'Patient',
      actorRole: 'PATIENT',
      eventType: 'DOCUMENT_UPLOADED',
      patientId,
      documentId: id,
      documentTitle: title,
      sourceType: 'UPLOAD',
      outcome: 'SUCCESS',
      safeMetadata: {
        storageLocation: 'PLATFORM',
        fileSizeBytes: newDoc.fileSizeBytes,
        fileMimeType: newDoc.fileMimeType,
      },
    });

    return newDoc;
  }

  static deleteDocument(patientId: string, documentId: string, actorUserId: string) {
    const doc = db.documents.get(documentId);
    if (!doc || doc.patientId !== patientId) {
      throw new Error('Document not found or access denied');
    }

    doc.availabilityStatus = 'DELETED';
    doc.deletedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();

    const actor = db.users.get(actorUserId);
    AuditService.log({
      actorUserId,
      actorName: actor?.displayName || 'User',
      actorRole: 'PATIENT',
      eventType: 'ADMIN_ACTION',
      patientId,
      documentId,
      documentTitle: doc.title,
      outcome: 'SUCCESS',
      safeMetadata: { action: 'DELETE_DOCUMENT', previousStorage: doc.storageLocation },
    });

    return true;
  }
}
