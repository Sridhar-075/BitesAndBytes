export type UserRole = 'PATIENT' | 'PROVIDER' | 'ORGANISATION_ADMIN' | 'PLATFORM_ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export type SourceType = 'DIGILOCKER' | 'HOSPITAL' | 'LABORATORY' | 'UPLOAD' | 'OTHER';

export type StorageLocation = 'EXTERNAL' | 'PLATFORM';

export type DocumentType =
  | 'PRESCRIPTION'
  | 'LAB_REPORT'
  | 'IMAGING_REPORT'
  | 'DISCHARGE_SUMMARY'
  | 'DIAGNOSIS'
  | 'CLINICAL_NOTE'
  | 'VACCINATION_RECORD'
  | 'OTHER';

export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'DELETED';

export type SharingStatus = 'NOT_SHARED' | 'SHARED' | 'EXTERNAL_PENDING' | 'REVOKED';

export type AccessRequestStatus =
  | 'DRAFT'
  | 'PENDING_PATIENT_APPROVAL'
  | 'PARTIALLY_APPROVED'
  | 'APPROVED'
  | 'DENIED'
  | 'EXPIRED'
  | 'CANCELLED';

export type DocumentDecision = 'PENDING' | 'APPROVE' | 'DENY';

export type SourceWorkflowStatus =
  | 'NOT_REQUIRED'
  | 'NOT_STARTED'
  | 'PENDING_PATIENT_ACTION'
  | 'PENDING_EXTERNAL_CONFIRMATION'
  | 'CONFIRMED'
  | 'DENIED'
  | 'EXPIRED'
  | 'REVOCATION_PENDING'
  | 'REVOKED'
  | 'FAILED'
  | 'ACTION_REQUIRED_AT_SOURCE';

export type ConsentGrantStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'SUSPENDED';

export type PermittedAction = 'VIEW' | 'DOWNLOAD';

export type AuditEventType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'SOURCE_CONNECTED'
  | 'SOURCE_DISCONNECTED'
  | 'RECORD_LINKED'
  | 'DOCUMENT_UPLOADED'
  | 'ACCESS_REQUEST_CREATED'
  | 'ACCESS_REQUEST_DECIDED'
  | 'PLATFORM_GRANT_CREATED'
  | 'DOCUMENT_VIEWED'
  | 'ACCESS_DENIED'
  | 'GRANT_REVOKED'
  | 'EXTERNAL_SHARING_INITIATED'
  | 'EXTERNAL_SHARING_CONFIRMED'
  | 'EXTERNAL_SHARING_DENIED'
  | 'EXTERNAL_REVOCATION_INITIATED'
  | 'EXTERNAL_REVOCATION_CONFIRMED'
  | 'ADMIN_ACTION';

export type DecisionOutcome = 'ALLOW' | 'DENY' | 'EXTERNAL_ACTION_REQUIRED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  displayName: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  contactNumber?: string;
  city?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organisation {
  id: string;
  name: string;
  organisationType: 'HOSPITAL' | 'CLINIC' | 'DIAGNOSTIC_CENTRE';
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  city: string;
  address: string;
  contactEmail: string;
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  organisationId: string;
  displayName: string;
  specialty: string;
  registrationNumber: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface SourceConnection {
  id: string;
  patientId: string;
  sourceType: SourceType;
  providerName: string;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ACTION_REQUIRED' | 'PENDING_AUTH';
  authorisationStatus: 'AUTHORISED' | 'PENDING' | 'EXPIRED' | 'REVOKED';
  supportedCapabilities: string[];
  externalReference?: string;
  lastCheckedAt: string;
  connectedAt: string;
  expiresAt?: string;
  disconnectedAt?: string;
  errorCode?: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  sourceType: SourceType;
  storageLocation: StorageLocation;
  documentType: DocumentType;
  title: string;
  issuerName: string;
  recordDate: string;
  sourceConnectionId?: string;
  sourceDocumentReference?: string;
  internalStorageKey?: string;
  fileMimeType?: string;
  fileSizeBytes?: number;
  availabilityStatus: AvailabilityStatus;
  metadata: {
    department?: string;
    doctorName?: string;
    diagnosticCode?: string;
    sampleType?: string;
    confidentiality?: 'STANDARD' | 'RESTRICTED';
    notes?: string;
    externalDirectUrlPermitted?: boolean;
    externalPortalUrl?: string;
  };
  simulatedContent?: {
    summary: string;
    findings?: string[];
    medications?: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
    vitals?: Record<string, string>;
    clinicalNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AccessRequestItem {
  id: string;
  accessRequestId: string;
  documentId: string;
  requestedActions: PermittedAction[];
  patientDecision: DocumentDecision;
  sourceWorkflowStatus: SourceWorkflowStatus;
  decidedAt?: string;
}

export interface AccessRequest {
  id: string;
  patientId: string;
  requestingProviderId: string;
  organisationId: string;
  purpose: string;
  reason: string;
  requestedStartAt: string;
  requestedExpiryAt: string;
  requestStatus: AccessRequestStatus;
  items: AccessRequestItem[];
  patientDecidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentGrantItem {
  id: string;
  consentGrantId: string;
  documentId: string;
  permittedActions: PermittedAction[];
}

export interface ConsentGrant {
  id: string;
  patientId: string;
  granteeProviderId: string;
  organisationId: string;
  purpose: string;
  validFrom: string;
  validUntil: string;
  status: ConsentGrantStatus;
  grantedAt: string;
  revokedAt?: string;
  createdFromAccessRequestId?: string;
  items: ConsentGrantItem[];
}

export interface ExternalSharingWorkflow {
  id: string;
  patientId: string;
  documentId: string;
  recipientProviderId: string;
  recipientOrganisationId: string;
  sourceType: SourceType;
  sourceWorkflowReference?: string;
  purpose: string;
  status: SourceWorkflowStatus;
  initiatedAt: string;
  confirmedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  lastCheckedAt: string;
  errorCode?: string;
  note?: string;
}

export interface AuditEvent {
  id: string;
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
  correlationId: string;
  occurredAt: string;
  safeMetadata: Record<string, any>;
}
