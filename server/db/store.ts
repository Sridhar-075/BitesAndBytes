import {
  User,
  PatientProfile,
  Organisation,
  ProviderProfile,
  SourceConnection,
  MedicalDocument,
  AccessRequest,
  ConsentGrant,
  ExternalSharingWorkflow,
  AuditEvent,
} from '../types.js';

export class DatabaseStore {
  users: Map<string, User> = new Map();
  patientProfiles: Map<string, PatientProfile> = new Map();
  organisations: Map<string, Organisation> = new Map();
  providerProfiles: Map<string, ProviderProfile> = new Map();
  sourceConnections: Map<string, SourceConnection> = new Map();
  documents: Map<string, MedicalDocument> = new Map();
  accessRequests: Map<string, AccessRequest> = new Map();
  consentGrants: Map<string, ConsentGrant> = new Map();
  externalWorkflows: Map<string, ExternalSharingWorkflow> = new Map();
  auditEvents: AuditEvent[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    this.users.clear();
    this.patientProfiles.clear();
    this.organisations.clear();
    this.providerProfiles.clear();
    this.sourceConnections.clear();
    this.documents.clear();
    this.accessRequests.clear();
    this.consentGrants.clear();
    this.externalWorkflows.clear();
    this.auditEvents = [];

    // 1. Users
    const priyaUser: User = {
      id: 'usr-patient-1',
      email: 'priya.sharma@example.com',
      role: 'PATIENT',
      displayName: 'Priya Sharma',
      accountStatus: 'ACTIVE',
      createdAt: '2026-01-10T08:30:00Z',
      updatedAt: '2026-10-09T09:15:00Z',
      lastLoginAt: '2026-10-10T03:15:00Z',
    };
    this.users.set(priyaUser.id, priyaUser);

    const ananyaUser: User = {
      id: 'usr-provider-1',
      email: 'dr.ananya.sharma@sunrisemedical.org',
      role: 'PROVIDER',
      displayName: 'Dr. Ananya Sharma',
      accountStatus: 'ACTIVE',
      createdAt: '2025-11-05T10:00:00Z',
      updatedAt: '2026-10-08T11:00:00Z',
      lastLoginAt: '2026-10-10T02:45:00Z',
    };
    this.users.set(ananyaUser.id, ananyaUser);

    const rahulUser: User = {
      id: 'usr-provider-2',
      email: 'dr.rahul.mehta@greenvalleyclinic.org',
      role: 'PROVIDER',
      displayName: 'Dr. Rahul Mehta',
      accountStatus: 'ACTIVE',
      createdAt: '2025-12-01T14:20:00Z',
      updatedAt: '2026-10-05T09:00:00Z',
      lastLoginAt: '2026-10-09T16:30:00Z',
    };
    this.users.set(rahulUser.id, rahulUser);

    const nehaUser: User = {
      id: 'usr-provider-3',
      email: 'dr.neha.iyer@citydiagnostics.in',
      role: 'PROVIDER',
      displayName: 'Dr. Neha Iyer',
      accountStatus: 'ACTIVE',
      createdAt: '2026-02-15T09:00:00Z',
      updatedAt: '2026-09-30T10:00:00Z',
      lastLoginAt: '2026-10-08T14:15:00Z',
    };
    this.users.set(nehaUser.id, nehaUser);

    const adminUser: User = {
      id: 'usr-admin-1',
      email: 'admin@continuumhealth.in',
      role: 'PLATFORM_ADMIN',
      displayName: 'System Administrator (Trust & Compliance)',
      accountStatus: 'ACTIVE',
      createdAt: '2025-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
      lastLoginAt: '2026-10-10T01:00:00Z',
    };
    this.users.set(adminUser.id, adminUser);

    // 2. Patient Profile
    const priyaProfile: PatientProfile = {
      id: 'patient-1',
      userId: priyaUser.id,
      displayName: 'Priya Sharma',
      dateOfBirth: '1992-05-14',
      gender: 'Female',
      bloodGroup: 'B+',
      contactNumber: '+91 98765 43210',
      city: 'Bengaluru, India',
      emergencyContact: 'Rajesh Sharma (+91 98765 12345)',
      createdAt: '2026-01-10T08:30:00Z',
      updatedAt: '2026-10-09T09:15:00Z',
    };
    this.patientProfiles.set(priyaProfile.id, priyaProfile);

    // 3. Organisations
    const sunriseOrg: Organisation = {
      id: 'org-sunrise',
      name: 'Sunrise Medical Centre',
      organisationType: 'HOSPITAL',
      verificationStatus: 'VERIFIED',
      city: 'Bengaluru',
      address: 'Plot 42, Outer Ring Road, Bellandur, Bengaluru 560103',
      contactEmail: 'records@sunrisemedical.org',
      createdAt: '2025-10-15T00:00:00Z',
    };
    this.organisations.set(sunriseOrg.id, sunriseOrg);

    const greenValleyOrg: Organisation = {
      id: 'org-greenvalley',
      name: 'Green Valley Clinic',
      organisationType: 'CLINIC',
      verificationStatus: 'VERIFIED',
      city: 'Bengaluru',
      address: '14, 5th Main, Indiranagar, Bengaluru 560038',
      contactEmail: 'helpdesk@greenvalleyclinic.org',
      createdAt: '2025-11-01T00:00:00Z',
    };
    this.organisations.set(greenValleyOrg.id, greenValleyOrg);

    const cityDiagOrg: Organisation = {
      id: 'org-citydiag',
      name: 'City Diagnostic Centre',
      organisationType: 'DIAGNOSTIC_CENTRE',
      verificationStatus: 'VERIFIED',
      city: 'Bengaluru',
      address: '88, Koramangala 4th Block, Bengaluru 560034',
      contactEmail: 'reports@citydiagnostics.in',
      createdAt: '2025-12-10T00:00:00Z',
    };
    this.organisations.set(cityDiagOrg.id, cityDiagOrg);

    // 4. Provider Profiles
    const ananyaProfile: ProviderProfile = {
      id: 'provider-1',
      userId: ananyaUser.id,
      organisationId: sunriseOrg.id,
      displayName: 'Dr. Ananya Sharma',
      specialty: 'Endocrinology & Internal Medicine',
      registrationNumber: 'KMC-2014-98431',
      verificationStatus: 'VERIFIED',
      createdAt: '2025-11-05T10:00:00Z',
    };
    this.providerProfiles.set(ananyaProfile.id, ananyaProfile);

    const rahulProfile: ProviderProfile = {
      id: 'provider-2',
      userId: rahulUser.id,
      organisationId: greenValleyOrg.id,
      displayName: 'Dr. Rahul Mehta',
      specialty: 'Family Medicine & Diabetology',
      registrationNumber: 'KMC-2011-44120',
      verificationStatus: 'VERIFIED',
      createdAt: '2025-12-01T14:20:00Z',
    };
    this.providerProfiles.set(rahulProfile.id, rahulProfile);

    const nehaProfile: ProviderProfile = {
      id: 'provider-3',
      userId: nehaUser.id,
      organisationId: cityDiagOrg.id,
      displayName: 'Dr. Neha Iyer',
      specialty: 'Diagnostic Radiology & Pathology',
      registrationNumber: 'KMC-2017-77209',
      verificationStatus: 'VERIFIED',
      createdAt: '2026-02-15T09:00:00Z',
    };
    this.providerProfiles.set(nehaProfile.id, nehaProfile);

    // 5. Source Connections
    const digiLockerConn: SourceConnection = {
      id: 'conn-digilocker-1',
      patientId: 'patient-1',
      sourceType: 'DIGILOCKER',
      providerName: 'DigiLocker National Locker',
      connectionStatus: 'CONNECTED',
      authorisationStatus: 'AUTHORISED',
      supportedCapabilities: ['METADATA_DISCOVERY', 'REFERENCE_LINKING', 'ISSUER_VERIFICATION'],
      externalReference: 'DL-MOCK-SESSION-9921',
      lastCheckedAt: '2026-10-10T01:10:00Z',
      connectedAt: '2026-02-01T11:20:00Z',
      expiresAt: '2027-02-01T11:20:00Z',
    };
    this.sourceConnections.set(digiLockerConn.id, digiLockerConn);

    const sunriseHospitalConn: SourceConnection = {
      id: 'conn-sunrise-1',
      patientId: 'patient-1',
      sourceType: 'HOSPITAL',
      providerName: 'Sunrise Medical Centre (EHR)',
      connectionStatus: 'CONNECTED',
      authorisationStatus: 'AUTHORISED',
      supportedCapabilities: ['REFERENCE_LINKING', 'DISCHARGE_METADATA', 'EPISODE_SHARING_COORDINATION'],
      externalReference: 'SMC-PAT-88194',
      lastCheckedAt: '2026-10-09T18:00:00Z',
      connectedAt: '2026-03-12T14:45:00Z',
    };
    this.sourceConnections.set(sunriseHospitalConn.id, sunriseHospitalConn);

    const greenValleyConn: SourceConnection = {
      id: 'conn-greenvalley-1',
      patientId: 'patient-1',
      sourceType: 'HOSPITAL',
      providerName: 'Green Valley Clinic (OPD)',
      connectionStatus: 'CONNECTED',
      authorisationStatus: 'AUTHORISED',
      supportedCapabilities: ['PRESCRIPTION_METADATA', 'CLINIC_VISIT_REFERENCE'],
      externalReference: 'GVC-REC-33219',
      lastCheckedAt: '2026-10-08T09:30:00Z',
      connectedAt: '2026-04-18T10:00:00Z',
    };
    this.sourceConnections.set(greenValleyConn.id, greenValleyConn);

    // 6. Documents (6 Documents matching Section 14)
    // Document 1: HbA1c Laboratory Report (DigiLocker external reference)
    const doc1: MedicalDocument = {
      id: 'doc-hba1c-digilocker',
      patientId: 'patient-1',
      sourceType: 'DIGILOCKER',
      storageLocation: 'EXTERNAL',
      documentType: 'LAB_REPORT',
      title: 'HbA1c Glycated Hemoglobin Report',
      issuerName: 'National Diagnostics Network (DigiLocker Issuer #ND-89)',
      recordDate: '2026-09-15',
      sourceConnectionId: digiLockerConn.id,
      sourceDocumentReference: 'DL-DOC-2026-HBA1C-99120',
      availabilityStatus: 'AVAILABLE',
      metadata: {
        department: 'Clinical Biochemistry',
        diagnosticCode: 'LOINC 4548-4',
        sampleType: 'Whole Blood (EDTA)',
        externalDirectUrlPermitted: false,
        externalPortalUrl: 'https://digilocker.gov.in/mock-portal/issued-docs/DL-DOC-2026-HBA1C-99120',
        notes: 'Document content is stored exclusively in DigiLocker. Platform stores only reference and verified metadata.',
      },
      createdAt: '2026-09-16T04:20:00Z',
      updatedAt: '2026-09-16T04:20:00Z',
    };
    this.documents.set(doc1.id, doc1);

    // Document 2: Thyroid Function Test (DigiLocker external reference)
    const doc2: MedicalDocument = {
      id: 'doc-thyroid-digilocker',
      patientId: 'patient-1',
      sourceType: 'DIGILOCKER',
      storageLocation: 'EXTERNAL',
      documentType: 'LAB_REPORT',
      title: 'Thyroid Function Test Panel (TSH, FT3, FT4)',
      issuerName: 'City PathLabs Central (DigiLocker Issuer #CP-402)',
      recordDate: '2026-07-20',
      sourceConnectionId: digiLockerConn.id,
      sourceDocumentReference: 'DL-DOC-2026-TFT-44109',
      availabilityStatus: 'AVAILABLE',
      metadata: {
        department: 'Endocrinology / Diagnostics',
        diagnosticCode: 'LOINC 3016-3',
        sampleType: 'Serum',
        externalDirectUrlPermitted: false,
        externalPortalUrl: 'https://digilocker.gov.in/mock-portal/issued-docs/DL-DOC-2026-TFT-44109',
        notes: 'External record stored in DigiLocker. Access coordination required through DigiLocker authorization API.',
      },
      createdAt: '2026-07-21T09:10:00Z',
      updatedAt: '2026-07-21T09:10:00Z',
    };
    this.documents.set(doc2.id, doc2);

    // Document 3: Discharge Summary (Sunrise Hospital external reference)
    const doc3: MedicalDocument = {
      id: 'doc-discharge-sunrise',
      patientId: 'patient-1',
      sourceType: 'HOSPITAL',
      storageLocation: 'EXTERNAL',
      documentType: 'DISCHARGE_SUMMARY',
      title: 'Inpatient Discharge Summary — Acute Gastroenteritis',
      issuerName: 'Sunrise Medical Centre',
      recordDate: '2026-06-10',
      sourceConnectionId: sunriseHospitalConn.id,
      sourceDocumentReference: 'SMC-IPD-DISCH-2026-00412',
      availabilityStatus: 'AVAILABLE',
      metadata: {
        department: 'Internal Medicine / Inpatient Ward 4B',
        doctorName: 'Dr. Vivek Kulkarni, MD',
        diagnosticCode: 'ICD-10 A09',
        confidentiality: 'RESTRICTED',
        externalDirectUrlPermitted: false,
        externalPortalUrl: 'https://records.sunrisemedical.org/patient/episodes/2026-00412',
        notes: 'Hospital records remain in Sunrise Hospital EHR. Subject to Sunrise EHR release authorization.',
      },
      createdAt: '2026-06-11T12:00:00Z',
      updatedAt: '2026-06-11T12:00:00Z',
    };
    this.documents.set(doc3.id, doc3);

    // Document 4: Prescription (Green Valley Clinic external reference)
    const doc4: MedicalDocument = {
      id: 'doc-prescription-greenvalley',
      patientId: 'patient-1',
      sourceType: 'HOSPITAL',
      storageLocation: 'EXTERNAL',
      documentType: 'PRESCRIPTION',
      title: 'Outpatient Prescription & Treatment Protocol',
      issuerName: 'Green Valley Clinic',
      recordDate: '2026-09-02',
      sourceConnectionId: greenValleyConn.id,
      sourceDocumentReference: 'GVC-RX-2026-90412',
      availabilityStatus: 'AVAILABLE',
      metadata: {
        department: 'Primary Care / OPD',
        doctorName: 'Dr. Rahul Mehta',
        diagnosticCode: 'Type 2 Diabetes Mellitus & Mild Hypertension',
        externalDirectUrlPermitted: false,
        externalPortalUrl: 'https://greenvalleyclinic.org/rx/verify/90412',
        notes: 'Held by clinic EHR. Clinic requires patient token confirmation before transmitting to third parties.',
      },
      createdAt: '2026-09-02T16:30:00Z',
      updatedAt: '2026-09-02T16:30:00Z',
    };
    this.documents.set(doc4.id, doc4);

    // Document 5: MRI Brain Report (Platform Upload)
    const doc5: MedicalDocument = {
      id: 'doc-mri-brain-upload',
      patientId: 'patient-1',
      sourceType: 'UPLOAD',
      storageLocation: 'PLATFORM',
      documentType: 'IMAGING_REPORT',
      title: 'MRI Brain Contrast & Angiography Study',
      issuerName: 'Apex Diagnostic Imaging Centre (Patient Upload)',
      recordDate: '2026-08-14',
      internalStorageKey: 'vault/patient-1/docs/mri-brain-20260814.pdf',
      fileMimeType: 'application/pdf',
      fileSizeBytes: 4284500, // ~4.1 MB
      availabilityStatus: 'AVAILABLE',
      metadata: {
        department: 'Neuroradiology',
        doctorName: 'Dr. S. K. Nambiar (Reporting Radiologist)',
        diagnosticCode: 'CPT 70553 / ICD-10 R51',
        confidentiality: 'RESTRICTED',
        notes: 'Patient uploaded scan report. Stored encrypted on platform storage. Access subject to platform consent grants.',
      },
      simulatedContent: {
        summary: '3.0T MRI Brain with contrast and 3D TOF MR Angiography. Evaluated for recurrent tension-type versus vascular cephalalgia.',
        findings: [
          'Ventricular system, basal cisterns, and cerebral sulci show normal morphology and caliber.',
          'No acute territorial cortical infarction, intracranial haemorrhage, or space-occupying lesion.',
          'T2/FLAIR demonstrates a few tiny non-specific subcortical white matter hyperintensities, stable with age.',
          'Post-contrast: No abnormal meningeal or parenchymal enhancement.',
          'Intracranial arterial flow voids in Circle of Willis are patent without flow-limiting stenosis or aneurysm.',
        ],
        clinicalNotes: 'Impression: Normal study. No intracranial mass lesion, acute infarct, or major vascular abnormality. Correlate clinically with headache diary.',
      },
      createdAt: '2026-08-15T11:45:00Z',
      updatedAt: '2026-08-15T11:45:00Z',
    };
    this.documents.set(doc5.id, doc5);

    // Document 6: Blood Test Report (Platform Upload)
    const doc6: MedicalDocument = {
      id: 'doc-bloodtest-upload',
      patientId: 'patient-1',
      sourceType: 'UPLOAD',
      storageLocation: 'PLATFORM',
      documentType: 'LAB_REPORT',
      title: 'Comprehensive Hemogram & Metabolic Panel',
      issuerName: 'Metro Health Diagnostics (Patient Upload)',
      recordDate: '2026-10-01',
      internalStorageKey: 'vault/patient-1/docs/hemogram-20261001.pdf',
      fileMimeType: 'application/pdf',
      fileSizeBytes: 1845200, // ~1.8 MB
      availabilityStatus: 'AVAILABLE',
      metadata: {
        department: 'Hematology & Clinical Chemistry',
        doctorName: 'Dr. Priya Sundaram (Pathologist)',
        diagnosticCode: 'CBC / CMP-14',
        sampleType: 'Whole Blood & Serum',
        notes: 'Patient uploaded document stored in private encrypted platform vault.',
      },
      simulatedContent: {
        summary: 'Automated Hemogram 5-part differential and routine metabolic chemistry profile.',
        findings: [
          'Hemoglobin: 13.8 g/dL (Normal: 12.0 - 15.5 g/dL)',
          'Platelet Count: 245,000 /mcL (Normal: 150,000 - 450,000 /mcL)',
          'Total Leukocyte Count (WBC): 6,800 /mcL (Normal: 4,500 - 11,000 /mcL)',
          'Fasting Plasma Glucose: 104 mg/dL (Borderline / Impaired fasting glucose: 100 - 125 mg/dL)',
          'Serum Creatinine: 0.82 mg/dL (Normal: 0.60 - 1.10 mg/dL)',
          'Serum Bilirubin Total: 0.7 mg/dL (Normal: 0.2 - 1.2 mg/dL)',
          'ALT (SGPT): 24 U/L, AST (SGOT): 21 U/L (Normal)',
        ],
        clinicalNotes: 'Impression: Routine hemogram within normal physiological limits. Fasting glucose is slightly elevated at 104 mg/dL; recommend dietary lifestyle modifications and HbA1c review.',
      },
      createdAt: '2026-10-02T08:15:00Z',
      updatedAt: '2026-10-02T08:15:00Z',
    };
    this.documents.set(doc6.id, doc6);

    // 7. Access Requests
    // Request 1: Dr. Ananya Sharma -> Priya Sharma (PENDING_PATIENT_APPROVAL)
    // Requesting HbA1c (DigiLocker) and MRI Brain Report (Upload)
    const req1: AccessRequest = {
      id: 'req-ananya-diabetes-01',
      patientId: 'patient-1',
      requestingProviderId: ananyaProfile.id,
      organisationId: sunriseOrg.id,
      purpose: 'Ongoing diabetes management and neurological assessment of headache episodes',
      reason: 'Evaluate glycemic trend alongside recent cranial imaging before initiating pharmacological adjustments',
      requestedStartAt: '2026-10-10T00:00:00Z',
      requestedExpiryAt: '2026-10-24T23:59:59Z', // 14 days
      requestStatus: 'PENDING_PATIENT_APPROVAL',
      items: [
        {
          id: 'req-item-1',
          accessRequestId: 'req-ananya-diabetes-01',
          documentId: doc1.id, // HbA1c (DigiLocker)
          requestedActions: ['VIEW'],
          patientDecision: 'PENDING',
          sourceWorkflowStatus: 'NOT_STARTED',
        },
        {
          id: 'req-item-2',
          accessRequestId: 'req-ananya-diabetes-01',
          documentId: doc5.id, // MRI Brain (Platform Upload)
          requestedActions: ['VIEW', 'DOWNLOAD'],
          patientDecision: 'PENDING',
          sourceWorkflowStatus: 'NOT_REQUIRED',
        },
      ],
      createdAt: '2026-10-09T14:30:00Z',
      updatedAt: '2026-10-09T14:30:00Z',
    };
    this.accessRequests.set(req1.id, req1);

    // Request 2: Dr. Rahul Mehta -> Priya Sharma (PARTIALLY_APPROVED)
    // Requesting Prescription & Blood Test Report
    const req2: AccessRequest = {
      id: 'req-rahul-metabolic-02',
      patientId: 'patient-1',
      requestingProviderId: rahulProfile.id,
      organisationId: greenValleyOrg.id,
      purpose: 'Routine cardio-metabolic health check & medication reconciliation',
      reason: 'Review latest hemogram and prior outpatient prescription to renew diabetes medication',
      requestedStartAt: '2026-10-04T00:00:00Z',
      requestedExpiryAt: '2026-10-18T23:59:59Z',
      requestStatus: 'PARTIALLY_APPROVED',
      patientDecidedAt: '2026-10-05T09:20:00Z',
      items: [
        {
          id: 'req-item-21',
          accessRequestId: 'req-rahul-metabolic-02',
          documentId: doc6.id, // Blood Test (Platform Upload) - APPROVED
          requestedActions: ['VIEW'],
          patientDecision: 'APPROVE',
          sourceWorkflowStatus: 'NOT_REQUIRED',
          decidedAt: '2026-10-05T09:20:00Z',
        },
        {
          id: 'req-item-22',
          accessRequestId: 'req-rahul-metabolic-02',
          documentId: doc4.id, // Prescription (Green Valley EHR) - APPROVED FOR EXTERNAL
          requestedActions: ['VIEW'],
          patientDecision: 'APPROVE',
          sourceWorkflowStatus: 'CONFIRMED',
          decidedAt: '2026-10-05T09:20:00Z',
        },
        {
          id: 'req-item-23',
          accessRequestId: 'req-rahul-metabolic-02',
          documentId: doc3.id, // Discharge summary - DENIED by Priya
          requestedActions: ['VIEW'],
          patientDecision: 'DENY',
          sourceWorkflowStatus: 'DENIED',
          decidedAt: '2026-10-05T09:20:00Z',
        },
      ],
      createdAt: '2026-10-04T10:15:00Z',
      updatedAt: '2026-10-05T09:20:00Z',
    };
    this.accessRequests.set(req2.id, req2);

    // 8. Consent Grants
    // Grant created for Dr. Ananya Sharma for MRI Brain Report
    const grantAnanya: ConsentGrant = {
      id: 'grant-ananya-mribrain',
      patientId: 'patient-1',
      granteeProviderId: ananyaProfile.id,
      organisationId: sunriseOrg.id,
      purpose: 'Neurological evaluation of headache episodes & treatment planning',
      validFrom: '2026-10-09T14:30:00Z',
      validUntil: '2026-10-23T23:59:59Z',
      status: 'ACTIVE',
      grantedAt: '2026-10-09T15:00:00Z',
      createdFromAccessRequestId: req1.id,
      items: [
        {
          id: 'grant-item-ananya-1',
          consentGrantId: 'grant-ananya-mribrain',
          documentId: doc5.id, // MRI Brain Contrast & Angiography Study
          permittedActions: ['VIEW', 'DOWNLOAD'],
        },
      ],
    };
    this.consentGrants.set(grantAnanya.id, grantAnanya);

    // Grant created from req2 for Blood Test Report to Dr. Rahul Mehta
    const grant1: ConsentGrant = {
      id: 'grant-rahul-bloodtest',
      patientId: 'patient-1',
      granteeProviderId: rahulProfile.id,
      organisationId: greenValleyOrg.id,
      purpose: 'Routine cardio-metabolic health check & medication reconciliation',
      validFrom: '2026-10-05T09:20:00Z',
      validUntil: '2026-10-19T23:59:59Z',
      status: 'ACTIVE',
      grantedAt: '2026-10-05T09:20:00Z',
      createdFromAccessRequestId: req2.id,
      items: [
        {
          id: 'grant-item-1',
          consentGrantId: 'grant-rahul-bloodtest',
          documentId: doc6.id, // ONLY Blood Test Report
          permittedActions: ['VIEW'],
        },
      ],
    };
    this.consentGrants.set(grant1.id, grant1);

    // 9. External Sharing Workflows
    // Workflow 1: Prescription sharing with Green Valley (CONFIRMED)
    const wf1: ExternalSharingWorkflow = {
      id: 'wf-prescription-greenvalley',
      patientId: 'patient-1',
      documentId: doc4.id,
      recipientProviderId: rahulProfile.id,
      recipientOrganisationId: greenValleyOrg.id,
      sourceType: 'HOSPITAL',
      sourceWorkflowReference: 'GVC-EXT-SHARE-8821',
      purpose: 'Routine cardio-metabolic health check',
      status: 'CONFIRMED',
      initiatedAt: '2026-10-05T09:20:00Z',
      confirmedAt: '2026-10-05T09:22:15Z',
      expiresAt: '2026-10-19T23:59:59Z',
      lastCheckedAt: '2026-10-09T12:00:00Z',
      note: 'Green Valley Clinic EHR verified patient one-time consent token and confirmed external access availability.',
    };
    this.externalWorkflows.set(wf1.id, wf1);

    // Workflow 2: Discharge summary sharing with Dr. Ananya (Awaiting External Confirmation)
    const wf2: ExternalSharingWorkflow = {
      id: 'wf-discharge-sunrise',
      patientId: 'patient-1',
      documentId: doc3.id,
      recipientProviderId: ananyaProfile.id,
      recipientOrganisationId: sunriseOrg.id,
      sourceType: 'HOSPITAL',
      sourceWorkflowReference: 'SMC-EXT-REL-4412',
      purpose: 'Comprehensive medical history review',
      status: 'PENDING_EXTERNAL_CONFIRMATION',
      initiatedAt: '2026-10-08T15:00:00Z',
      expiresAt: '2026-10-22T23:59:59Z',
      lastCheckedAt: '2026-10-09T18:00:00Z',
      note: 'Awaiting Sunrise Hospital Medical Records Department release confirmation.',
    };
    this.externalWorkflows.set(wf2.id, wf2);

    // 10. Audit Events (Chronological, realistic history)
    this.auditEvents = [
      {
        id: 'aud-001',
        actorUserId: priyaUser.id,
        actorName: 'Priya Sharma',
        actorRole: 'PATIENT',
        eventType: 'LOGIN',
        patientId: 'patient-1',
        outcome: 'SUCCESS',
        correlationId: 'corr-init-01',
        occurredAt: '2026-02-01T11:15:00Z',
        safeMetadata: { ipMasked: '103.21.***.***', userAgent: 'Chrome 124 / macOS' },
      },
      {
        id: 'aud-002',
        actorUserId: priyaUser.id,
        actorName: 'Priya Sharma',
        actorRole: 'PATIENT',
        eventType: 'SOURCE_CONNECTED',
        patientId: 'patient-1',
        sourceType: 'DIGILOCKER',
        outcome: 'SUCCESS',
        correlationId: 'corr-dl-link',
        occurredAt: '2026-02-01T11:20:00Z',
        safeMetadata: { sourceName: 'DigiLocker National Locker', permittedScopes: ['METADATA_DISCOVERY', 'REFERENCE_LINKING'] },
      },
      {
        id: 'aud-003',
        actorUserId: priyaUser.id,
        actorName: 'Priya Sharma',
        actorRole: 'PATIENT',
        eventType: 'RECORD_LINKED',
        patientId: 'patient-1',
        documentId: doc1.id,
        documentTitle: doc1.title,
        sourceType: 'DIGILOCKER',
        outcome: 'SUCCESS',
        correlationId: 'corr-dl-hba1c',
        occurredAt: '2026-09-16T04:20:00Z',
        safeMetadata: { storageLocation: 'EXTERNAL', reference: doc1.sourceDocumentReference },
      },
      {
        id: 'aud-004',
        actorUserId: priyaUser.id,
        actorName: 'Priya Sharma',
        actorRole: 'PATIENT',
        eventType: 'DOCUMENT_UPLOADED',
        patientId: 'patient-1',
        documentId: doc5.id,
        documentTitle: doc5.title,
        sourceType: 'UPLOAD',
        outcome: 'SUCCESS',
        correlationId: 'corr-mri-up',
        occurredAt: '2026-08-15T11:45:00Z',
        safeMetadata: { storageLocation: 'PLATFORM', fileSizeBytes: doc5.fileSizeBytes, mimeType: doc5.fileMimeType },
      },
      {
        id: 'aud-005',
        actorUserId: rahulUser.id,
        actorName: 'Dr. Rahul Mehta',
        actorRole: 'PROVIDER',
        eventType: 'ACCESS_REQUEST_CREATED',
        patientId: 'patient-1',
        accessRequestId: req2.id,
        outcome: 'SUCCESS',
        correlationId: 'corr-req-rahul',
        occurredAt: '2026-10-04T10:15:00Z',
        safeMetadata: { purpose: req2.purpose, requestedCount: 3, organisation: greenValleyOrg.name },
      },
      {
        id: 'aud-006',
        actorUserId: priyaUser.id,
        actorName: 'Priya Sharma',
        actorRole: 'PATIENT',
        eventType: 'ACCESS_REQUEST_DECIDED',
        patientId: 'patient-1',
        accessRequestId: req2.id,
        outcome: 'SUCCESS',
        correlationId: 'corr-dec-rahul',
        occurredAt: '2026-10-05T09:20:00Z',
        safeMetadata: {
          decisionSummary: 'Approved Blood Test (Platform) & Prescription (External); Denied Discharge Summary',
          approvedCount: 2,
          deniedCount: 1,
        },
      },
      {
        id: 'aud-007',
        actorUserId: priyaUser.id,
        actorName: 'Priya Sharma',
        actorRole: 'PATIENT',
        eventType: 'PLATFORM_GRANT_CREATED',
        patientId: 'patient-1',
        consentGrantId: grant1.id,
        documentId: doc6.id,
        documentTitle: doc6.title,
        outcome: 'SUCCESS',
        correlationId: 'corr-grant-bloodtest',
        occurredAt: '2026-10-05T09:20:00Z',
        safeMetadata: { grantee: 'Dr. Rahul Mehta', validUntil: grant1.validUntil, scope: 'VIEW_ONLY' },
      },
      {
        id: 'aud-008',
        actorUserId: rahulUser.id,
        actorName: 'Dr. Rahul Mehta',
        actorRole: 'PROVIDER',
        eventType: 'DOCUMENT_VIEWED',
        patientId: 'patient-1',
        documentId: doc6.id,
        documentTitle: doc6.title,
        consentGrantId: grant1.id,
        outcome: 'SUCCESS',
        correlationId: 'corr-view-bloodtest',
        occurredAt: '2026-10-05T14:10:00Z',
        safeMetadata: { requesterRole: 'PROVIDER', grantStatus: 'ACTIVE', action: 'VIEW' },
      },
      {
        id: 'aud-009',
        actorUserId: ananyaUser.id,
        actorName: 'Dr. Ananya Sharma',
        actorRole: 'PROVIDER',
        eventType: 'ACCESS_REQUEST_CREATED',
        patientId: 'patient-1',
        accessRequestId: req1.id,
        outcome: 'SUCCESS',
        correlationId: 'corr-req-ananya',
        occurredAt: '2026-10-09T14:30:00Z',
        safeMetadata: { purpose: req1.purpose, requestedCount: 2, organisation: sunriseOrg.name },
      },
      {
        id: 'aud-010',
        actorUserId: priyaUser.id,
        actorName: 'Priya Sharma',
        actorRole: 'PATIENT',
        eventType: 'LOGIN',
        patientId: 'patient-1',
        outcome: 'SUCCESS',
        correlationId: 'corr-login-priya',
        occurredAt: '2026-10-10T03:15:00Z',
        safeMetadata: { sessionActive: true },
      },
    ];
  }
}

// Global database singleton
export const db = new DatabaseStore();
