import express, { Request, Response, NextFunction } from 'express';
import { db } from '../db/store.js';
import { CatalogueService } from '../services/catalogue.service.js';
import { ConsentService } from '../services/consent.service.js';
import { PermissionDecisionService } from '../services/decision.service.js';
import { AuditService } from '../services/audit.service.js';
import { DigiLockerMockConnector } from '../services/connectors/digilocker.connector.js';
import { HospitalMockConnector } from '../services/connectors/hospital.connector.js';
import { SecurityTestsService } from '../services/security-tests.service.js';

export const apiRouter = express.Router();

// Helper middleware for mock session user (defaults to Priya Sharma if not passed)
function getCurrentUser(req: Request) {
  const userId = (req.headers['x-user-id'] as string) || 'usr-patient-1';
  const user = db.users.get(userId) || db.users.get('usr-patient-1')!;
  return user;
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  let patientProfile = null;
  let providerProfile = null;
  let organisation = null;

  if (user.role === 'PATIENT') {
    patientProfile = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || null;
  } else if (user.role === 'PROVIDER') {
    providerProfile = Array.from(db.providerProfiles.values()).find((p) => p.userId === user.id) || null;
    if (providerProfile) {
      organisation = db.organisations.get(providerProfile.organisationId) || null;
    }
  }

  res.json({
    user,
    patientProfile,
    providerProfile,
    organisation,
    availableAccounts: Array.from(db.users.values()).map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
    })),
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.lastLoginAt = new Date().toISOString();
  AuditService.log({
    actorUserId: user.id,
    actorName: user.displayName,
    actorRole: user.role,
    eventType: 'LOGIN',
    outcome: 'SUCCESS',
    safeMetadata: { email: user.email },
  });

  res.json({ success: true, user });
});

// -------------------------------------------------------------
// PATIENT DASHBOARD & PROFILE
// -------------------------------------------------------------
apiRouter.get('/patient/dashboard', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  const docs = Array.from(db.documents.values()).filter((d) => d.patientId === patient.id && !d.deletedAt);
  const totalRecords = docs.length;
  const platformUploadsCount = docs.filter((d) => d.storageLocation === 'PLATFORM').length;
  const externalReferencesCount = docs.filter((d) => d.storageLocation === 'EXTERNAL').length;

  const connectedSources = Array.from(db.sourceConnections.values()).filter(
    (c) => c.patientId === patient.id && c.connectionStatus === 'CONNECTED'
  ).length;

  const pendingRequests = Array.from(db.accessRequests.values()).filter(
    (r) => r.patientId === patient.id && r.requestStatus === 'PENDING_PATIENT_APPROVAL'
  ).length;

  const activeGrantsCount = Array.from(db.consentGrants.values()).filter(
    (g) => g.patientId === patient.id && g.status === 'ACTIVE'
  ).length;

  const confirmedExternalCount = Array.from(db.externalWorkflows.values()).filter(
    (w) => w.patientId === patient.id && w.status === 'CONFIRMED'
  ).length;

  // Recent 5 documents
  const recentDocs = CatalogueService.getDocuments({
    patientId: patient.id,
    page: 1,
    pageSize: 6,
  }).items;

  // Recent 6 audit activities
  const recentActivities = AuditService.getEvents({
    patientId: patient.id,
    limit: 6,
  });

  res.json({
    metrics: {
      totalRecords,
      platformUploadsCount,
      externalReferencesCount,
      connectedSources,
      pendingRequests,
      activeShares: activeGrantsCount + confirmedExternalCount,
      activePlatformGrants: activeGrantsCount,
      confirmedExternalShares: confirmedExternalCount,
    },
    patient,
    recentDocs,
    recentActivities,
  });
});

apiRouter.get('/patient/profile', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1');
  res.json({ patient });
});

// -------------------------------------------------------------
// DOCUMENT CATALOGUE
// -------------------------------------------------------------
apiRouter.get('/documents', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  const { sourceType, documentType, searchQuery, availabilityStatus, page, pageSize } = req.query;

  const result = CatalogueService.getDocuments({
    patientId: patient.id,
    sourceType: sourceType as any,
    documentType: documentType as any,
    searchQuery: searchQuery as string,
    availabilityStatus: availabilityStatus as any,
    page: page ? parseInt(page as string, 10) : 1,
    pageSize: pageSize ? parseInt(pageSize as string, 10) : 20,
  });

  res.json(result);
});

apiRouter.get('/documents/:documentId', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  const doc = CatalogueService.getDocumentById(patient.id, req.params.documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json(doc);
});

apiRouter.post('/documents/external-reference', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  const { sourceType, documentType, title, issuerName, recordDate, sourceDocumentReference, sourceConnectionId, metadata, externalPortalUrl } = req.body;

  if (!title || !issuerName || !recordDate || !sourceDocumentReference || !sourceType) {
    return res.status(400).json({ error: 'Missing required metadata fields for external reference' });
  }

  const mergedMetadata = {
    ...(metadata || {}),
    ...(externalPortalUrl ? { externalPortalUrl } : {}),
  };

  const newDoc = CatalogueService.addExternalReference({
    patientId: patient.id,
    sourceType,
    documentType: documentType || 'LAB_REPORT',
    title,
    issuerName,
    recordDate,
    sourceDocumentReference,
    sourceConnectionId,
    metadata: mergedMetadata,
    actorUserId: user.id,
  });

  res.status(201).json(newDoc);
});

apiRouter.post('/documents/upload', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  const { title, documentType, issuerName, recordDate, simulatedContent, fileMimeType, fileSizeBytes, metadata, externalPortalUrl } = req.body;

  if (!title || !issuerName || !recordDate) {
    return res.status(400).json({ error: 'Missing required fields for document upload' });
  }

  const mergedMetadata = {
    ...(metadata || {}),
    ...(externalPortalUrl ? { externalPortalUrl } : {}),
  };

  const newDoc = CatalogueService.uploadDocument({
    patientId: patient.id,
    documentType: documentType || 'IMAGING_REPORT',
    title,
    issuerName,
    recordDate,
    fileMimeType: fileMimeType || 'application/pdf',
    fileSizeBytes: fileSizeBytes || 2400000,
    metadata: mergedMetadata,
    simulatedContent,
    actorUserId: user.id,
  });

  res.status(201).json(newDoc);
});

apiRouter.delete('/documents/:documentId', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  try {
    CatalogueService.deleteDocument(patient.id, req.params.documentId, user.id);
    res.json({ success: true, message: 'Document marked as deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DOCUMENT VIEW ENDPOINT (Enforcing strict PermissionDecisionService rules)
apiRouter.get('/documents/:documentId/view', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const doc = db.documents.get(req.params.documentId);

  const evaluation = PermissionDecisionService.evaluateDocumentAccess({
    requesterUserId: user.id,
    requesterRole: user.role,
    documentId: req.params.documentId,
    action: 'VIEW',
  });

  if (evaluation.decision === 'EXTERNAL_ACTION_REQUIRED') {
    return res.status(403).json({
      error: 'EXTERNAL_DOCUMENT_ACCESS_RESTRICTED',
      decision: evaluation.decision,
      reasonCode: evaluation.reasonCode,
      message: evaluation.message,
      storageLocation: evaluation.storageLocation,
      sourceType: evaluation.sourceType,
      documentTitle: doc?.title,
      issuerName: doc?.issuerName,
      recordDate: doc?.recordDate,
      sourceDocumentReference: doc?.sourceDocumentReference,
      externalPortalUrl: doc?.metadata?.externalPortalUrl || evaluation.externalPortalUrl || 'https://records.sunrisemedical.org',
      externalWorkflowStatus: evaluation.externalWorkflowStatus,
    });
  }

  if (evaluation.decision === 'DENY') {
    return res.status(403).json({
      error: 'ACCESS_DENIED',
      decision: evaluation.decision,
      reasonCode: evaluation.reasonCode,
      message: evaluation.message,
      documentTitle: doc?.title,
    });
  }

  // ALLOWED: Return document clinical simulated payload with patient profile demographics
  const foundDoc = doc!;
  const patient = db.patientProfiles.get(foundDoc.patientId);

  res.json({
    success: true,
    documentId: foundDoc.id,
    title: foundDoc.title,
    documentType: foundDoc.documentType,
    recordDate: foundDoc.recordDate,
    issuerName: foundDoc.issuerName,
    storageLocation: foundDoc.storageLocation,
    fileMimeType: foundDoc.fileMimeType,
    fileSizeBytes: foundDoc.fileSizeBytes,
    metadata: foundDoc.metadata,
    simulatedContent: foundDoc.simulatedContent,
    patient: {
      displayName: patient?.displayName || 'Priya Sharma',
      dateOfBirth: patient?.dateOfBirth || '1992-05-14',
      gender: patient?.gender || 'Female',
      bloodGroup: patient?.bloodGroup || 'B+',
      contactNumber: patient?.contactNumber || '+91 98765 43210',
      city: patient?.city || 'Bengaluru, India',
    },
    authorisedVia: evaluation.reasonCode,
    consentGrantId: evaluation.consentGrantId,
    accessedAt: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// SOURCE CONNECTIONS
// -------------------------------------------------------------
apiRouter.get('/source-connections', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  const connections = Array.from(db.sourceConnections.values()).filter((c) => c.patientId === patient.id);

  // Attach record count for each connection
  const enriched = connections.map((conn) => {
    const linkedRecordsCount = Array.from(db.documents.values()).filter(
      (d) => d.patientId === patient.id && d.sourceConnectionId === conn.id && !d.deletedAt
    ).length;
    return {
      ...conn,
      linkedRecordsCount,
    };
  });

  res.json(enriched);
});

apiRouter.post('/source-connections/digilocker/start', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  const authData = DigiLockerMockConnector.startAuth(patient.id);
  res.json(authData);
});

apiRouter.post('/source-connections/digilocker/mock-complete', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;
  const { stateToken } = req.body;

  const result = DigiLockerMockConnector.mockComplete(patient.id, stateToken || 'mock-state', user.id);
  res.json(result);
});

apiRouter.post('/source-connections/:connectionId/disconnect', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  try {
    const conn = DigiLockerMockConnector.disconnect(patient.id, user.id);
    res.json({ success: true, connection: conn });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ACCESS REQUESTS & PATIENT SHARING
// -------------------------------------------------------------
apiRouter.get('/access-requests', (req: Request, res: Response) => {
  const user = getCurrentUser(req);

  let requests = Array.from(db.accessRequests.values());

  if (user.role === 'PATIENT') {
    const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;
    requests = requests.filter((r) => r.patientId === patient.id);
  } else if (user.role === 'PROVIDER') {
    const provider = Array.from(db.providerProfiles.values()).find((p) => p.userId === user.id);
    if (provider) {
      requests = requests.filter((r) => r.requestingProviderId === provider.id);
    }
  }

  // Sort newest first
  requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Enrich with doctor and organisation names and documents details
  const enriched = requests.map((req) => {
    const provider = db.providerProfiles.get(req.requestingProviderId);
    const org = db.organisations.get(req.organisationId);
    const patient = db.patientProfiles.get(req.patientId);

    const enrichedItems = req.items.map((item) => {
      const doc = db.documents.get(item.documentId);
      return {
        ...item,
        documentTitle: doc?.title || 'Unknown Document',
        documentType: doc?.documentType,
        sourceType: doc?.sourceType,
        storageLocation: doc?.storageLocation,
        issuerName: doc?.issuerName,
        recordDate: doc?.recordDate,
      };
    });

    return {
      ...req,
      providerName: provider?.displayName,
      providerSpecialty: provider?.specialty,
      organisationName: org?.name,
      patientName: patient?.displayName,
      items: enrichedItems,
    };
  });

  res.json(enriched);
});

apiRouter.get('/access-requests/:requestId', (req: Request, res: Response) => {
  const request = db.accessRequests.get(req.params.requestId);
  if (!request) {
    return res.status(404).json({ error: 'Access request not found' });
  }

  const provider = db.providerProfiles.get(request.requestingProviderId);
  const org = db.organisations.get(request.organisationId);
  const patient = db.patientProfiles.get(request.patientId);

  const enrichedItems = request.items.map((item) => {
    const doc = db.documents.get(item.documentId);
    return {
      ...item,
      documentTitle: doc?.title || 'Unknown Document',
      documentType: doc?.documentType,
      sourceType: doc?.sourceType,
      storageLocation: doc?.storageLocation,
      issuerName: doc?.issuerName,
      recordDate: doc?.recordDate,
    };
  });

  res.json({
    ...request,
    providerName: provider?.displayName,
    providerSpecialty: provider?.specialty,
    organisationName: org?.name,
    patientName: patient?.displayName,
    items: enrichedItems,
  });
});

apiRouter.post('/access-requests', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'PROVIDER') {
    return res.status(403).json({ error: 'Only healthcare providers can create access requests' });
  }

  const provider = Array.from(db.providerProfiles.values()).find((p) => p.userId === user.id);
  if (!provider) {
    return res.status(400).json({ error: 'Provider profile not found' });
  }

  const { patientId, documentIds, purpose, reason, requestedDurationDays } = req.body;
  if (!patientId || !documentIds || !documentIds.length || !purpose || !reason) {
    return res.status(400).json({ error: 'Missing required request parameters' });
  }

  try {
    const request = ConsentService.createAccessRequest({
      requestingProviderId: provider.id,
      patientId,
      documentIds,
      purpose,
      reason,
      requestedDurationDays: requestedDurationDays || 14,
      actorUserId: user.id,
    });

    res.status(201).json(request);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/access-requests/:requestId/decision', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  const { decisions } = req.body;
  if (!decisions || !Array.isArray(decisions)) {
    return res.status(400).json({ error: 'Decisions array is required' });
  }

  try {
    const result = ConsentService.processConsentDecision({
      accessRequestId: req.params.requestId,
      patientId: patient.id,
      decisions,
      actorUserId: user.id,
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// PERMISSION & CONSENT GRANTS
// -------------------------------------------------------------
apiRouter.get('/permissions', (req: Request, res: Response) => {
  const user = getCurrentUser(req);

  let grants = Array.from(db.consentGrants.values());
  if (user.role === 'PATIENT') {
    const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;
    grants = grants.filter((g) => g.patientId === patient.id);
  } else if (user.role === 'PROVIDER') {
    const provider = Array.from(db.providerProfiles.values()).find((p) => p.userId === user.id);
    if (provider) {
      grants = grants.filter((g) => g.granteeProviderId === provider.id);
    }
  }

  const enriched = grants.map((g) => {
    const provider = db.providerProfiles.get(g.granteeProviderId);
    const org = db.organisations.get(g.organisationId);
    const docs = g.items.map((i) => {
      const d = db.documents.get(i.documentId);
      return {
        id: i.documentId,
        title: d?.title || 'Document',
        documentType: d?.documentType,
        sourceType: d?.sourceType,
        storageLocation: d?.storageLocation,
      };
    });

    return {
      ...g,
      granteeName: provider?.displayName,
      granteeSpecialty: provider?.specialty,
      organisationName: org?.name,
      documents: docs,
    };
  });

  res.json(enriched);
});

apiRouter.post('/clinical/instant-access', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'PROVIDER') {
    return res.status(403).json({ error: 'Only healthcare providers can request clinical encounter access' });
  }

  const provider = Array.from(db.providerProfiles.values()).find((p) => p.userId === user.id);
  if (!provider) {
    return res.status(400).json({ error: 'Provider profile not found' });
  }

  const { documentId, purpose = 'In-Person Consultation & Immediate Clinical Review', durationDays = 7 } = req.body;
  const doc = db.documents.get(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const validUntil = new Date(Date.now() + durationDays * 86400000).toISOString();
  const grantId = `grant-clinical-${Date.now()}`;
  const grant = {
    id: grantId,
    patientId: doc.patientId,
    granteeProviderId: provider.id,
    organisationId: provider.organisationId,
    purpose,
    validFrom: new Date().toISOString(),
    validUntil,
    status: 'ACTIVE' as const,
    grantedAt: new Date().toISOString(),
    items: [
      {
        id: `item-${Date.now()}`,
        consentGrantId: grantId,
        documentId: doc.id,
        permittedActions: ['VIEW' as const, 'DOWNLOAD' as const],
      },
    ],
  };

  db.consentGrants.set(grantId, grant);

  AuditService.log({
    actorUserId: user.id,
    actorName: user.displayName,
    actorRole: 'PROVIDER',
    eventType: 'PLATFORM_GRANT_CREATED',
    patientId: doc.patientId,
    documentId: doc.id,
    documentTitle: doc.title,
    consentGrantId: grantId,
    outcome: 'SUCCESS',
    safeMetadata: { accessType: 'CLINICAL_ENCOUNTER_CONSENT', providerName: provider.displayName },
  });

  res.json({ success: true, grant });
});

apiRouter.post('/permissions/:grantId/revoke', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;

  try {
    const grant = ConsentService.revokeConsentGrant(req.params.grantId, patient.id, user.id);
    res.json({ success: true, grant });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// EXTERNAL SHARING WORKFLOWS
// -------------------------------------------------------------
apiRouter.get('/external-sharing', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  let workflows = Array.from(db.externalWorkflows.values());

  if (user.role === 'PATIENT') {
    const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;
    workflows = workflows.filter((w) => w.patientId === patient.id);
  }

  const enriched = workflows.map((wf) => {
    const doc = db.documents.get(wf.documentId);
    const provider = db.providerProfiles.get(wf.recipientProviderId);
    const org = db.organisations.get(wf.recipientOrganisationId);

    return {
      ...wf,
      documentTitle: doc?.title,
      documentType: doc?.documentType,
      issuerName: doc?.issuerName,
      recipientName: provider?.displayName,
      recipientSpecialty: provider?.specialty,
      organisationName: org?.name,
    };
  });

  res.json(enriched);
});

apiRouter.post('/external-sharing/:workflowId/mock-confirm', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  try {
    const wf = HospitalMockConnector.mockConfirm(req.params.workflowId, user.id);
    res.json({ success: true, workflow: wf });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/external-sharing/:workflowId/mock-deny', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { reason } = req.body;
  try {
    const wf = HospitalMockConnector.mockDeny(req.params.workflowId, reason, user.id);
    res.json({ success: true, workflow: wf });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/external-sharing/:workflowId/revoke', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;
  try {
    const wf = ConsentService.revokeExternalWorkflow(req.params.workflowId, patient.id, user.id);
    res.json({ success: true, workflow: wf });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/external-sharing/:workflowId/mock-revocation-confirm', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  try {
    const wf = HospitalMockConnector.mockRevocationConfirm(req.params.workflowId, user.id);
    res.json({ success: true, workflow: wf });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// AUDIT LOG
// -------------------------------------------------------------
apiRouter.get('/audit-events', (req: Request, res: Response) => {
  const user = getCurrentUser(req);

  let events = AuditService.getEvents();
  if (user.role === 'PATIENT') {
    const patient = Array.from(db.patientProfiles.values()).find((p) => p.userId === user.id) || db.patientProfiles.get('patient-1')!;
    events = events.filter((e) => e.patientId === patient.id || e.actorUserId === user.id);
  } else if (user.role === 'PROVIDER') {
    events = events.filter((e) => e.actorUserId === user.id || e.safeMetadata?.grantee === user.displayName);
  }
  // PLATFORM_ADMIN sees all events

  res.json(events);
});

// -------------------------------------------------------------
// AUTOMATED SECURITY TEST SUITE (Section 15: Tests A-H)
// -------------------------------------------------------------
apiRouter.post('/security-tests/run', (req: Request, res: Response) => {
  const report = SecurityTestsService.runAllTests();
  res.json(report);
});

// -------------------------------------------------------------
// ADMIN & DEMO RESET
// -------------------------------------------------------------
apiRouter.get('/admin/overview', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'PLATFORM_ADMIN') {
    return res.status(403).json({ error: 'Platform admin privileges required' });
  }

  const providers = Array.from(db.providerProfiles.values()).map((p) => {
    const org = db.organisations.get(p.organisationId);
    const u = db.users.get(p.userId);
    return {
      ...p,
      email: u?.email,
      organisationName: org?.name,
    };
  });

  const sourceConnections = Array.from(db.sourceConnections.values());
  const auditCount = db.auditEvents.length;

  res.json({
    providers,
    organisations: Array.from(db.organisations.values()),
    sourceConnections,
    auditCount,
    totalDocuments: db.documents.size,
  });
});

apiRouter.post('/admin/reset-demo', (req: Request, res: Response) => {
  db.seed();
  res.json({ success: true, message: 'Database reset to initial demo seed state' });
});
