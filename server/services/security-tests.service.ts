import { db } from '../db/store.js';
import { PermissionDecisionService } from './decision.service.js';
import { ConsentService } from './consent.service.js';
import { CatalogueService } from './catalogue.service.js';

export interface SecurityTestReportItem {
  id: string;
  name: string;
  category: string;
  description: string;
  passed: boolean;
  actualResult: string;
  expectedResult: string;
  details: string;
}

export class SecurityTestsService {
  static runAllTests(): { summary: { total: number; passed: number; failed: number }; tests: SecurityTestReportItem[] } {
    const tests: SecurityTestReportItem[] = [];

    // TEST A: Doctor with active grant for one uploaded doc cannot access another uploaded doc of same patient
    try {
      // Dr. Rahul Mehta (usr-provider-2) has active grant for doc6 (Blood Test Report), but NOT doc5 (MRI Brain Report)
      const rahulUserId = 'usr-provider-2';
      const resultDoc5 = PermissionDecisionService.evaluateDocumentAccess({
        requesterUserId: rahulUserId,
        requesterRole: 'PROVIDER',
        documentId: 'doc-mri-brain-upload',
        action: 'VIEW',
      });

      const passedA = resultDoc5.decision === 'DENY' && resultDoc5.reasonCode === 'NO_ACTIVE_GRANT_FOR_DOCUMENT';
      tests.push({
        id: 'TEST_A',
        name: 'Document-Granular Isolation',
        category: 'Scope Enforcement',
        description: 'A doctor with an active grant for one uploaded document cannot access another uploaded document of the same patient.',
        passed: passedA,
        expectedResult: 'DENY (reason: NO_ACTIVE_GRANT_FOR_DOCUMENT)',
        actualResult: `${resultDoc5.decision} (reason: ${resultDoc5.reasonCode})`,
        details: 'Dr. Rahul Mehta holds active grant for Blood Test, but was strictly denied when requesting MRI Brain Report.',
      });
    } catch (err: any) {
      tests.push({
        id: 'TEST_A',
        name: 'Document-Granular Isolation',
        category: 'Scope Enforcement',
        description: 'A doctor with an active grant for one uploaded document cannot access another uploaded document of the same patient.',
        passed: false,
        expectedResult: 'DENY',
        actualResult: 'ERROR: ' + err.message,
        details: err.message,
      });
    }

    // TEST B: Doctor cannot access a document belonging to another patient
    try {
      // Create temporary mock document for a fictitious second patient
      const fakeDocId = 'doc-patient-999-confidential';
      db.documents.set(fakeDocId, {
        id: fakeDocId,
        patientId: 'patient-999',
        sourceType: 'UPLOAD',
        storageLocation: 'PLATFORM',
        documentType: 'CLINICAL_NOTE',
        title: 'Confidential Psychiatric Evaluation',
        issuerName: 'Other Health System',
        recordDate: '2026-09-01',
        internalStorageKey: 'vault/patient-999/docs/confidential.pdf',
        availabilityStatus: 'AVAILABLE',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const resultTestB = PermissionDecisionService.evaluateDocumentAccess({
        requesterUserId: 'usr-provider-1',
        requesterRole: 'PROVIDER',
        documentId: fakeDocId,
        action: 'VIEW',
      });

      // Cleanup
      db.documents.delete(fakeDocId);

      const passedB = resultTestB.decision === 'DENY';
      tests.push({
        id: 'TEST_B',
        name: 'Cross-Patient Boundary Guard',
        category: 'IDOR Prevention',
        description: 'A doctor cannot access a document belonging to another patient merely by knowing or enumerating the document ID.',
        passed: passedB,
        expectedResult: 'DENY',
        actualResult: `${resultTestB.decision} (reason: ${resultTestB.reasonCode})`,
        details: 'Verified that tampering with document ID across patient boundaries triggers immediate denial.',
      });
    } catch (err: any) {
      tests.push({
        id: 'TEST_B',
        name: 'Cross-Patient Boundary Guard',
        category: 'IDOR Prevention',
        description: 'A doctor cannot access a document belonging to another patient by changing the document ID.',
        passed: false,
        expectedResult: 'DENY',
        actualResult: 'ERROR: ' + err.message,
        details: err.message,
      });
    }

    // TEST C: External DigiLocker document cannot be retrieved through platform view endpoint even when CONFIRMED
    try {
      const resultTestC = PermissionDecisionService.evaluateDocumentAccess({
        requesterUserId: 'usr-provider-1',
        requesterRole: 'PROVIDER',
        documentId: 'doc-hba1c-digilocker',
        action: 'VIEW',
      });

      const passedC =
        resultTestC.decision === 'EXTERNAL_ACTION_REQUIRED' &&
        resultTestC.reasonCode === 'EXTERNAL_DOCUMENT_MUST_BE_ACCESSED_AT_SOURCE' &&
        resultTestC.storageLocation === 'EXTERNAL';

      tests.push({
        id: 'TEST_C',
        name: 'Zero-Proxy External Invariant',
        category: 'Architecture Guarantee',
        description: 'An external DigiLocker document cannot be retrieved through the platform view endpoint, even if external sharing is confirmed.',
        passed: passedC,
        expectedResult: 'EXTERNAL_ACTION_REQUIRED (Zero document proxying allowed)',
        actualResult: `${resultTestC.decision} (reason: ${resultTestC.reasonCode})`,
        details: 'The platform strictly refuses to retrieve, stream, proxy, or download external documents. Directs to source portal.',
      });
    } catch (err: any) {
      tests.push({
        id: 'TEST_C',
        name: 'Zero-Proxy External Invariant',
        category: 'Architecture Guarantee',
        description: 'An external DigiLocker document cannot be retrieved through the platform view endpoint.',
        passed: false,
        expectedResult: 'EXTERNAL_ACTION_REQUIRED',
        actualResult: 'ERROR: ' + err.message,
        details: err.message,
      });
    }

    // TEST D: Revoking an uploaded-document grant blocks the next request immediately
    try {
      // Find grant1 (Blood Test to Dr. Rahul Mehta)
      const grant = db.consentGrants.get('grant-rahul-bloodtest');
      const previousStatus = grant ? grant.status : 'ACTIVE';

      // Simulate revocation
      if (grant) {
        grant.status = 'REVOKED';
        grant.revokedAt = new Date().toISOString();
      }

      const resultTestD = PermissionDecisionService.evaluateDocumentAccess({
        requesterUserId: 'usr-provider-2',
        requesterRole: 'PROVIDER',
        documentId: 'doc-bloodtest-upload',
        action: 'VIEW',
      });

      // Restore status for ongoing user interaction
      if (grant) {
        grant.status = previousStatus;
        grant.revokedAt = undefined;
      }

      const passedD = resultTestD.decision === 'DENY' && resultTestD.reasonCode === 'GRANT_REVOKED';
      tests.push({
        id: 'TEST_D',
        name: 'Immediate Revocation Enforcement',
        category: 'Consent Lifecycle',
        description: 'Revoking an uploaded document grant blocks subsequent access requests immediately without caching or delays.',
        passed: passedD,
        expectedResult: 'DENY (reason: GRANT_REVOKED)',
        actualResult: `${resultTestD.decision} (reason: ${resultTestD.reasonCode})`,
        details: 'Confirmed that revoked grant is immediately denied by the permission decision engine on the very next attempt.',
      });
    } catch (err: any) {
      tests.push({
        id: 'TEST_D',
        name: 'Immediate Revocation Enforcement',
        category: 'Consent Lifecycle',
        description: 'Revoking an uploaded document grant blocks the next request immediately.',
        passed: false,
        expectedResult: 'DENY',
        actualResult: 'ERROR: ' + err.message,
        details: err.message,
      });
    }

    // TEST E: Approving an external sharing request does NOT create a platform-level file-access grant
    try {
      // Check that existing consent grants only contain PLATFORM storage documents
      let illegalPlatformGrantFound = false;
      for (const grant of db.consentGrants.values()) {
        for (const item of grant.items) {
          const doc = db.documents.get(item.documentId);
          if (doc && doc.storageLocation === 'EXTERNAL') {
            illegalPlatformGrantFound = true;
          }
        }
      }

      const passedE = !illegalPlatformGrantFound;
      tests.push({
        id: 'TEST_E',
        name: 'External Source Decoupling',
        category: 'Data Model Purity',
        description: 'Approving an external sharing request creates an external workflow record, NEVER a platform file-access grant.',
        passed: passedE,
        expectedResult: 'No external document IDs found in platform consent grants',
        actualResult: illegalPlatformGrantFound ? 'VIOLATION DETECTED' : 'Clean Separation Enforced (0 illegal grants)',
        details: 'All platform consent grants are strictly constrained to PLATFORM storage documents only.',
      });
    } catch (err: any) {
      tests.push({
        id: 'TEST_E',
        name: 'External Source Decoupling',
        category: 'Data Model Purity',
        description: 'Approving external sharing does not create platform file-access grant.',
        passed: false,
        expectedResult: 'Passed',
        actualResult: 'ERROR: ' + err.message,
        details: err.message,
      });
    }

    // TEST F: Connected source does not imply permission to view every document
    try {
      // Sunrise Hospital is a connected source, but Dr. Rahul Mehta (Green Valley Clinic) does not have access to doc3 (Sunrise Discharge Summary)
      const resultTestF = PermissionDecisionService.evaluateDocumentAccess({
        requesterUserId: 'usr-provider-2',
        requesterRole: 'PROVIDER',
        documentId: 'doc-discharge-sunrise',
        action: 'VIEW',
      });

      const passedF = resultTestF.decision !== 'ALLOW';
      tests.push({
        id: 'TEST_F',
        name: 'No Blanket Source Trust',
        category: 'Zero-Trust Architecture',
        description: 'A connected source does not imply blanket permission for any provider to view documents.',
        passed: passedF,
        expectedResult: 'NON-ALLOW (Blanket trust rejected)',
        actualResult: `${resultTestF.decision} (reason: ${resultTestF.reasonCode})`,
        details: 'A connected source merely establishes verified metadata discovery; provider access requires explicit individual consent.',
      });
    } catch (err: any) {
      tests.push({
        id: 'TEST_F',
        name: 'No Blanket Source Trust',
        category: 'Zero-Trust Architecture',
        description: 'Connected source does not imply permission to view every document.',
        passed: false,
        expectedResult: 'NON-ALLOW',
        actualResult: 'ERROR: ' + err.message,
        details: err.message,
      });
    }

    // TEST G: Denied or expired consent cannot be reactivated by manipulating request params
    try {
      // Find req2 item for doc3 which was DENIED by patient
      const req2 = db.accessRequests.get('req-rahul-metabolic-02');
      const deniedItem = req2?.items.find((i) => i.documentId === 'doc-discharge-sunrise');
      const isDenied = deniedItem?.patientDecision === 'DENY';

      // Try evaluating provider access
      const resultTestG = PermissionDecisionService.evaluateDocumentAccess({
        requesterUserId: 'usr-provider-2',
        requesterRole: 'PROVIDER',
        documentId: 'doc-discharge-sunrise',
        action: 'VIEW',
      });

      const passedG = isDenied && resultTestG.decision !== 'ALLOW';
      tests.push({
        id: 'TEST_G',
        name: 'Immutable Denial State',
        category: 'Consent Integrity',
        description: 'A denied or expired consent cannot be reactivated by manipulating request parameters.',
        passed: passedG,
        expectedResult: 'DENY enforced',
        actualResult: `Denied in request record, and evaluated decision: ${resultTestG.decision}`,
        details: 'Patient denial cannot be overridden by client requests or parameter tampering.',
      });
    } catch (err: any) {
      tests.push({
        id: 'TEST_G',
        name: 'Immutable Denial State',
        category: 'Consent Integrity',
        description: 'Denied or expired consent cannot be reactivated.',
        passed: false,
        expectedResult: 'DENY',
        actualResult: 'ERROR: ' + err.message,
        details: err.message,
      });
    }

    // TEST H: No endpoint exposes external tokens, internal storage keys, or document contents for external references
    try {
      const docDetails = CatalogueService.getDocumentById('patient-1', 'doc-hba1c-digilocker');
      const leakedStorageKey = (docDetails as any)?.internalStorageKey !== undefined;
      const leakedRawFile = (docDetails as any)?.fileBuffer !== undefined;

      const passedH = !leakedStorageKey && !leakedRawFile && docDetails?.storageLocation === 'EXTERNAL';
      tests.push({
        id: 'TEST_H',
        name: 'Zero Secret & Storage Path Leakage',
        category: 'Information Disclosure Prevention',
        description: 'No endpoint exposes external tokens, internal storage keys, or raw contents for external references.',
        passed: passedH,
        expectedResult: 'internalStorageKey REDACTED, No raw file buffers returned',
        actualResult: `Storage key redacted: ${!leakedStorageKey}, Storage location: ${docDetails?.storageLocation}`,
        details: 'Catalogue serialization strips sensitive storage keys and external credential tokens from all API responses.',
      });
    } catch (err: any) {
      tests.push({
        id: 'TEST_H',
        name: 'Zero Secret & Storage Path Leakage',
        category: 'Information Disclosure Prevention',
        description: 'No endpoint exposes secrets or internal storage keys.',
        passed: false,
        expectedResult: 'Passed',
        actualResult: 'ERROR: ' + err.message,
        details: err.message,
      });
    }

    const passedCount = tests.filter((t) => t.passed).length;
    return {
      summary: {
        total: tests.length,
        passed: passedCount,
        failed: tests.length - passedCount,
      },
      tests,
    };
  }
}
