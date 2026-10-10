import React from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { SourceBadge } from './SourceBadge.js';
import { ApiClient } from '../services/api.js';

interface ReviewConsentModalProps {
  request: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewConsentModal: React.FC<ReviewConsentModalProps> = ({
  request,
  onClose,
  onSuccess,
}) => {
  // Decision map: docId -> boolean (true = APPROVE, false = DENY)
  const [decisions, setDecisions] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    request.items?.forEach((item: any) => {
      // Default to true so patient can uncheck
      initial[item.documentId] = true;
    });
    return initial;
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resultSummary, setResultSummary] = React.useState<any | null>(null);

  const toggleDecision = (docId: string) => {
    setDecisions((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);

    const payload = Object.entries(decisions).map(([documentId, isApproved]) => ({
      documentId,
      decision: (isApproved ? 'APPROVE' : 'DENY') as 'APPROVE' | 'DENY',
    }));

    try {
      const res = await ApiClient.decideAccessRequest(request.id, payload);
      setResultSummary(res);
    } catch (err: any) {
      setError(err.message || 'Failed to submit consent decision');
      setSubmitting(false);
    }
  };

  const approvedItems = request.items?.filter((i: any) => decisions[i.documentId]);
  const deniedItems = request.items?.filter((i: any) => !decisions[i.documentId]);
  const approvedPlatform = approvedItems.filter((i: any) => i.storageLocation === 'PLATFORM');
  const approvedExternal = approvedItems.filter((i: any) => i.storageLocation === 'EXTERNAL');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Consent Decision
              </span>
              <span className="text-xs text-slate-500">
                Request ID: <span className="font-mono">{request.id.slice(0, 14)}...</span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Review Healthcare Provider Access Request
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
              {error}
            </div>
          )}

          {resultSummary ? (
            /* Outcome Screen */
            <div className="space-y-4 py-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Consent Decision Recorded Successfully</span>
                </div>
                <p className="mt-1 text-xs text-emerald-900 leading-relaxed">
                  Your granular preferences have been cryptographically recorded into the audit trail.
                  Independent actions were applied based on document storage location:
                </p>
              </div>

              {/* Breakdown of Platform vs External Outcomes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-lg">
                  <div className="font-semibold text-teal-950 flex items-center gap-1.5 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>Platform Stored Records ({resultSummary.approvedPlatformDocIds?.length || 0})</span>
                  </div>
                  <p className="text-[11px] text-teal-900 leading-relaxed">
                    Platform-level access grant created. Dr. {request.providerName} can now view these
                    files through server-side verified authorization checks.
                  </p>
                </div>

                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-lg">
                  <div className="font-semibold text-sky-950 flex items-center gap-1.5 mb-1.5">
                    <Database className="w-4 h-4 text-sky-700" />
                    <span>External Source Records ({resultSummary.approvedExternalDocIds?.length || 0})</span>
                  </div>
                  <p className="text-[11px] text-sky-900 leading-relaxed">
                    External sharing intent logged. The platform did NOT grant direct file access.
                    Awaiting source confirmation from DigiLocker or Hospital EHR.
                  </p>
                </div>
              </div>

              <div className="pt-3 text-center">
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Doctor & Request Overview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {request.providerName}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {request.providerSpecialty} · {request.organisationName}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">Valid Until:</span>{' '}
                    {new Date(request.requestedExpiryAt).toLocaleDateString()} (14 days)
                  </div>
                </div>

                <div className="pt-1">
                  <span className="font-semibold text-slate-800">Stated Clinical Purpose: </span>
                  <span className="text-slate-700">{request.purpose}</span>
                </div>
                {request.reason && (
                  <div className="text-slate-600 text-[11px]">
                    <span className="font-medium">Clinical Rationale: </span>
                    {request.reason}
                  </div>
                )}
              </div>

              {/* Document-by-Document Selective Consent Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    Select Documents to Approve or Exclude
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {approvedItems?.length || 0} of {request.items?.length} selected
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 overflow-hidden bg-white">
                  {request.items?.map((item: any) => {
                    const isChecked = !!decisions[item.documentId];
                    const isExternal = item.storageLocation === 'EXTERNAL';

                    return (
                      <div
                        key={item.id}
                        className={`p-3 sm:p-3.5 flex items-start gap-3 transition-colors ${
                          isChecked ? 'bg-white' : 'bg-slate-50/60 opacity-75'
                        }`}
                      >
                        <input
                          type="checkbox"
                          id={`check-${item.documentId}`}
                          checked={isChecked}
                          onChange={() => toggleDecision(item.documentId)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <label
                          htmlFor={`check-${item.documentId}`}
                          className="flex-1 cursor-pointer select-none"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-900 text-xs">
                              {item.documentTitle}
                            </span>
                            <SourceBadge
                              sourceType={item.sourceType}
                              storageLocation={item.storageLocation}
                              compact
                            />
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>Issuer: {item.issuerName}</span>
                            <span>Date: {item.recordDate}</span>
                            <span>Action: View Only</span>
                          </div>

                          {/* Distinctive rule explanation per record */}
                          <div className="mt-1.5 text-[11px]">
                            {isExternal ? (
                              <span className="text-indigo-800 bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100">
                                Requires source authorisation step via {item.sourceType === 'DIGILOCKER' ? 'DigiLocker' : 'Hospital EHR'}
                              </span>
                            ) : (
                              <span className="text-teal-800 bg-teal-50/60 px-2 py-0.5 rounded border border-teal-100">
                                Stored in Continuum Vault · Direct grant granted upon approval
                              </span>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consent Summary Box */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-950 text-xs">
                <div className="font-semibold flex items-center gap-1.5 mb-1">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Important Consent Architecture Summary</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
                  <li>
                    <strong>Platform uploads ({approvedPlatform.length}):</strong> Will be granted
                    directly to Dr. {request.providerName} for the 14-day validity window.
                  </li>
                  <li>
                    <strong>External records ({approvedExternal.length}):</strong> Approving does
                    NOT automatically give the doctor direct access. Our platform coordinates
                    sharing through the source hospital or DigiLocker gateway.
                  </li>
                  <li>
                    You can revoke access to any document at any time from the Access & Permissions tab.
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      // Reject all
                      const allFalse: Record<string, boolean> = {};
                      request.items?.forEach((i: any) => (allFalse[i.documentId] = false));
                      setDecisions(allFalse);
                    }}
                    className="px-3 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg font-medium transition-colors"
                  >
                    Decline All
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleConfirm}
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Recording Decision...' : 'Confirm Selected Permissions'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
