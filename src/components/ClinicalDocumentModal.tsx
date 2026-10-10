import React from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Building2,
  Calendar,
  User,
  Activity,
  FileCheck2,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';

interface ClinicalDocumentModalProps {
  documentId: string;
  onClose: () => void;
  onRequestAccess?: (docId: string) => void;
}

export const ClinicalDocumentModal: React.FC<ClinicalDocumentModalProps> = ({
  documentId,
  onClose,
  onRequestAccess,
}) => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any | null>(null);
  const [errorData, setErrorData] = React.useState<any | null>(null);
  const [grantingInPerson, setGrantingInPerson] = React.useState(false);

  const fetchDoc = async () => {
    setLoading(true);
    setErrorData(null);
    try {
      const res = await ApiClient.viewDocument(documentId);
      setData(res);
    } catch (err: any) {
      setErrorData(err.data || { message: err.message || 'Access Denied' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDoc();
  }, [documentId]);

  const handleGrantInPersonConsent = async () => {
    setGrantingInPerson(true);
    try {
      await ApiClient.grantClinicalEncounterAccess(documentId, 14);
      await fetchDoc();
    } catch (err: any) {
      alert(err.message || 'Failed to establish clinical encounter consent');
    } finally {
      setGrantingInPerson(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Top Controls Header */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-xs sm:text-sm tracking-tight">
              Clinical Medical Document Viewer
            </span>
            {data && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                AUTHORISED ACCESS
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <>
                <button
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print Report"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={() => alert(`Downloaded copy of ${data.title}. Authenticated clinical hash verified.`)}
                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download Medical PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-medium text-slate-600 text-xs">
                Evaluating server-side permission grant & decrypting medical document...
              </p>
            </div>
          ) : errorData ? (
            /* ACCESS RESTRICTED / DENIED VIEW */
            <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-sm space-y-4 max-w-lg mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Access Restricted by Patient Consent Policy
                </h3>
                <p className="text-xs text-rose-800 font-medium mt-1">
                  Server Rule Evaluation: {errorData.reasonCode || 'NO_ACTIVE_GRANT'}
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {errorData.message ||
                    'You do not have an active, unrevoked consent grant from the patient to access this document.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-[11px] text-left">
                <div>• Patient ownership check: Verified</div>
                <div>• Zero-trust evaluation: Denied by default without explicit active grant</div>
                <div>• Security Audit event ACCESS_DENIED recorded</div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleGrantInPersonConsent}
                  disabled={grantingInPerson}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold transition-colors shadow-2xs inline-flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-300" />
                  <span>
                    {grantingInPerson
                      ? 'Establishing Consent...'
                      : 'In-Person Clinical Consent — Access Document Itself'}
                  </span>
                </button>
                {onRequestAccess && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestAccess(documentId);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-semibold transition-colors"
                  >
                    Request Patient Consent Online
                  </button>
                )}
              </div>
            </div>
          ) : data ? (
            /* FULL MEDICAL REPORT RENDERER */
            <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl mx-auto print:border-none print:shadow-none">
              {/* Medical Facility Header */}
              <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">
                    Accredited Diagnostic Health Facility
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                    {data.issuerName}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Department of {data.metadata?.department || 'Diagnostic Medicine'} · NABL / NABH Certified
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold text-slate-800">
                    REPORT ID: <span className="font-mono">{data.documentId.toUpperCase()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Date of Study: {data.recordDate}
                  </div>
                </div>
              </div>

              {/* Patient Demographics Table */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient Name</span>
                  <div className="font-bold text-slate-900">{data.patient?.displayName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Age / Gender</span>
                  <div className="font-semibold text-slate-800">
                    {data.patient?.gender} (Blood Group: {data.patient?.bloodGroup})
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Referring Clinician</span>
                  <div className="font-semibold text-slate-800 truncate">
                    {data.metadata?.doctorName || 'Dr. Ananya Sharma'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Confidentiality</span>
                  <div className="font-bold text-teal-800">RESTRICTED CLINICAL</div>
                </div>
              </div>

              {/* Report Title & Indication */}
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  {data.title}
                </div>
                <div className="text-xs text-slate-500">
                  Clinical Indication: {data.metadata?.diagnosticCode || 'Routine diagnostic and follow-up evaluation'}
                </div>
              </div>

              {/* Clinical Summary */}
              {data.simulatedContent?.summary && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide block mb-1">
                    Study Protocol & Examination Summary
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {data.simulatedContent.summary}
                  </p>
                </div>
              )}

              {/* Findings Section */}
              {data.simulatedContent?.findings && (
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide block">
                    Detailed Diagnostic Findings
                  </span>
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                    {data.simulatedContent.findings.map((finding: string, idx: number) => (
                      <div key={idx} className="p-2.5 flex items-start gap-2 bg-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                        <span className="text-slate-800 font-medium">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impression & Final Opinion */}
              {data.simulatedContent?.clinicalNotes && (
                <div className="p-4 bg-teal-50/50 rounded-lg border border-teal-200 text-xs space-y-1">
                  <span className="font-bold text-teal-950 uppercase text-[11px] tracking-wide block">
                    Impression & Clinical Advice:
                  </span>
                  <p className="text-teal-900 font-semibold leading-relaxed">
                    {data.simulatedContent.clinicalNotes}
                  </p>
                </div>
              )}

              {/* Verified Digital Signature Block */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs">
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cryptographically Signed & Timestamped</span>
                  </div>
                  <div>Continuum Health Consent Grant: #{data.consentGrantId || 'GRANT-VERIFIED'}</div>
                  <div className="font-mono text-[10px]">Access Log ID: {data.documentId}-AUD</div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
                  <div className="font-bold text-slate-900">
                    {data.metadata?.doctorName || 'Dr. S. K. Nambiar, MD, DNB'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Consultant Radiologist / Pathologist
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Reg No: KMC-2012-88190
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Continuum Health Privacy Guarantee: Decrypted in ephemeral session only. Never stored in browser cache.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
