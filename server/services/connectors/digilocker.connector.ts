import { db } from '../../db/store.js';
import { AuditService } from '../audit.service.js';
import { SourceConnection } from '../../types.js';

export interface DiscoveredDigiLockerRecord {
  id: string;
  title: string;
  documentType: 'VACCINATION_RECORD' | 'LAB_REPORT' | 'PRESCRIPTION' | 'OTHER';
  issuerName: string;
  recordDate: string;
  sourceDocumentReference: string;
  category: string;
}

export class DigiLockerMockConnector {
  /**
   * Generates a mock OAuth authorization session
   */
  static startAuth(patientId: string) {
    const stateToken = `dl-auth-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return {
      authUrl: `https://digilocker.gov.in/mock-oauth/authorize?client_id=continuum_health&response_type=code&state=${stateToken}&scope=read_issued_metadata`,
      stateToken,
      expiresAt,
      notice:
        'Continuum Health is initiating a read-only metadata link with DigiLocker. ' +
        'Our platform stores ONLY document references and permitted metadata. No document contents are ever retrieved or duplicated.',
    };
  }

  /**
   * Simulates completion of DigiLocker authorization with discovery of permitted records
   */
  static mockComplete(patientId: string, stateToken: string, actorUserId: string) {
    let conn = Array.from(db.sourceConnections.values()).find(
      (c) => c.patientId === patientId && c.sourceType === 'DIGILOCKER'
    );

    if (!conn) {
      conn = {
        id: `conn-digilocker-${Date.now()}`,
        patientId,
        sourceType: 'DIGILOCKER',
        providerName: 'DigiLocker National Locker',
        connectionStatus: 'CONNECTED',
        authorisationStatus: 'AUTHORISED',
        supportedCapabilities: ['METADATA_DISCOVERY', 'REFERENCE_LINKING', 'ISSUER_VERIFICATION'],
        externalReference: `DL-SESSION-${stateToken.slice(-6)}`,
        lastCheckedAt: new Date().toISOString(),
        connectedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
      db.sourceConnections.set(conn.id, conn);
    } else {
      conn.connectionStatus = 'CONNECTED';
      conn.authorisationStatus = 'AUTHORISED';
      conn.lastCheckedAt = new Date().toISOString();
      conn.disconnectedAt = undefined;
    }

    AuditService.log({
      actorUserId,
      actorName: 'Priya Sharma',
      actorRole: 'PATIENT',
      eventType: 'SOURCE_CONNECTED',
      patientId,
      sourceType: 'DIGILOCKER',
      outcome: 'SUCCESS',
      safeMetadata: {
        connectionId: conn.id,
        status: 'CONNECTED',
        method: 'MOCK_DIGILOCKER_CONSENT',
      },
    });

    // Discovered mock records available to link
    const discoverableRecords: DiscoveredDigiLockerRecord[] = [
      {
        id: 'dl-disc-01',
        title: 'Universal Immunization / COVID-19 Final Certificate',
        documentType: 'VACCINATION_RECORD',
        issuerName: 'Ministry of Health & Family Welfare (CoWIN)',
        recordDate: '2025-11-20',
        sourceDocumentReference: 'COWIN-CERT-90412-IN',
        category: 'Immunization',
      },
      {
        id: 'dl-disc-02',
        title: 'Comprehensive Lipid & Cholesterol Panel',
        documentType: 'LAB_REPORT',
        issuerName: 'Thyrocare Technologies Limited (DigiLocker Issuer #THY-88)',
        recordDate: '2026-05-18',
        sourceDocumentReference: 'DL-DOC-2026-LIPID-11029',
        category: 'Pathology & Biochemistry',
      },
      {
        id: 'dl-disc-03',
        title: 'Eye Examination & Vision Refraction Prescription',
        documentType: 'PRESCRIPTION',
        issuerName: 'Sankara Eye Foundation (Issuer #SEF-102)',
        recordDate: '2026-04-12',
        sourceDocumentReference: 'DL-DOC-2026-EYE-88201',
        category: 'Ophthalmology',
      },
    ];

    return {
      connection: conn,
      discoverableRecords,
      message: 'DigiLocker connected successfully. You may select which document references to link to your catalogue.',
    };
  }

  /**
   * Disconnects DigiLocker
   */
  static disconnect(patientId: string, actorUserId: string) {
    const conn = Array.from(db.sourceConnections.values()).find(
      (c) => c.patientId === patientId && c.sourceType === 'DIGILOCKER'
    );
    if (!conn) {
      throw new Error('DigiLocker connection not found');
    }

    conn.connectionStatus = 'DISCONNECTED';
    conn.authorisationStatus = 'REVOKED';
    conn.disconnectedAt = new Date().toISOString();

    AuditService.log({
      actorUserId,
      actorName: 'Priya Sharma',
      actorRole: 'PATIENT',
      eventType: 'SOURCE_DISCONNECTED',
      patientId,
      sourceType: 'DIGILOCKER',
      outcome: 'SUCCESS',
      safeMetadata: {
        connectionId: conn.id,
        disconnectedAt: conn.disconnectedAt,
      },
    });

    return conn;
  }
}
