import React from 'react';
import {
  FileCheck2,
  Eye,
  ShieldAlert,
  Building2,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';
import { SourceBadge } from '../components/SourceBadge.js';

interface ProviderApprovedDocsProps {
  onAccessDocument?: (docId: string) => void;
}

export const ProviderApprovedDocs: React.FC<ProviderApprovedDocsProps> = ({
  onAccessDocument,
}) => {
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [viewingDocId, setViewingDocId] = React.useState<string | null>(null);
  const [clinicalData, setClinicalData] = React.useState<any | null>(null);
  const [accessError, setAccessError] = React.useState<string | null>(null);
  const [evaluating, setEvaluating] = React.useState(false);

  const fetchApproved = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getPermissions();
      setPermissions(data || []);
    } catch (err: any) {
      console.error('Error fetching approved documents:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchApproved();
  }, []);

  const handleTestAccess = async (docId: string, docTitle: string) => {
    setEvaluating(true);
    setViewingDocId(docId);
    setAccessError(null);
    setClinicalData(null);

    try {
      const res = await ApiClient.viewDocument(docId);
      setClinicalData(res);
    } catch (err: any) {
      setAccessError(err.message || 'Access Denied by Permission Decision Engine');
    } finally {
      setEvaluating(false);
    }
  };

  const activeGrants = permissions.filter((p) => p.status === 'ACTIVE');

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Approved Platform Documents
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review patient-uploaded records with active consent grants verified by the permission decision engine.
        </p>
      </div>

      {/* Active Grants List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Verifying authorization grants...</div>
        ) : activeGrants.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
            <Lock className="w-8 h-8 text-slate-300 mx-auto mb-1" />
            <p className="font-semibold text-slate-700">No active platform document grants.</p>
            <p className="text-[11px] text-slate-400">
              Submit an access request or wait for the patient to approve outstanding requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGrants.map((grant) => (
              <div key={grant.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Consent Grant: {grant.id}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                        ACTIVE GRANT
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Purpose: {grant.purpose}
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-[11px] text-slate-500">
                    <div>Valid Until: {new Date(grant.validUntil).toLocaleDateString()}</div>
                    <div className="text-slate-400">Enforced by Server Rule Engine</div>
                  </div>
                </div>

                {/* Documents inside this grant */}
                <div className="space-y-2">
                  <div className="font-semibold text-slate-700">Authorized Documents:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {grant.documents?.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="font-semibold text-slate-900 truncate">
                            {doc.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Platform Encrypted Vault · View Action Allowed
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            onAccessDocument
                              ? onAccessDocument(doc.id)
                              : handleTestAccess(doc.id, doc.title)
                          }
                          disabled={evaluating}
                          className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Access Document Itself</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Viewer & Real-Time Decision Engine Output */}
      {viewingDocId && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Live Document Access Evaluation
              </h3>
            </div>
            <button
              onClick={() => {
                setViewingDocId(null);
                setClinicalData(null);
                setAccessError(null);
              }}
              className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
            >
              Close Viewer
            </button>
          </div>

          {evaluating ? (
            <div className="p-8 text-center text-slate-400">
              Evaluating server-side permission grant...
            </div>
          ) : accessError ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>HTTP 403 Forbidden: Server Access Denied</span>
              </div>
              <p className="text-xs">{accessError}</p>
              <p className="text-[11px] text-rose-700/80">
                Audit event ACCESS_DENIED was recorded with actor and timestamp.
              </p>
            </div>
          ) : clinicalData ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Grant Verified: Authorised via {clinicalData.authorisedVia}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 font-mono">
                  Accessed: {new Date(clinicalData.accessedAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/40">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Document Title & Summary
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {clinicalData.title}
                  </h4>
                  <p className="text-slate-700 mt-1 leading-relaxed">
                    {clinicalData.simulatedContent?.summary}
                  </p>
                </div>

                {clinicalData.simulatedContent?.findings && (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                      Clinical Findings
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      {clinicalData.simulatedContent.findings.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {clinicalData.simulatedContent?.clinicalNotes && (
                  <div className="p-3 bg-white rounded border border-slate-200">
                    <span className="font-bold text-slate-900">Impression: </span>
                    <span className="text-slate-800">{clinicalData.simulatedContent.clinicalNotes}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
