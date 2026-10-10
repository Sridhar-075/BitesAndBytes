import React from 'react';
import {
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SourceBadge } from '../components/SourceBadge.js';
import { ApiClient } from '../services/api.js';

interface PatientRequestsProps {
  onReviewRequest: (request: any) => void;
  onRefresh: () => void;
}

export const PatientRequests: React.FC<PatientRequestsProps> = ({
  onReviewRequest,
  onRefresh,
}) => {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getAccessRequests();
      setRequests(data || []);
    } catch (err: any) {
      console.error('Error fetching access requests:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const pendingRequests = requests.filter((r) => r.requestStatus === 'PENDING_PATIENT_APPROVAL');
  const pastRequests = requests.filter((r) => r.requestStatus !== 'PENDING_PATIENT_APPROVAL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Sharing Requests & Consent Decisions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review treatment-related record access requests submitted by verified healthcare providers.
        </p>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Awaiting Your Decision ({pendingRequests.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
            Loading pending requests...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No pending access requests.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              You have decided all outstanding provider sharing requests.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-amber-200/80 shadow-xs p-5 space-y-4 hover:border-amber-300 transition-colors"
              >
                {/* Doctor & Clinic Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                      Dr
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {req.providerName}
                        </span>
                        <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-semibold">
                          Verified Provider
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {req.providerSpecialty} · {req.organisationName}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs">
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Pending Your Consent
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Received {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Stated Purpose */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800">Stated Purpose: </span>
                  <span className="text-slate-700">{req.purpose}</span>
                  {req.reason && (
                    <div className="mt-1 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-600">Clinical Reasoning: </span>
                      {req.reason}
                    </div>
                  )}
                </div>

                {/* Requested Documents Breakdown */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    Requested Documents ({req.items?.length || 0}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {req.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-medium text-slate-900 truncate">
                            {item.documentTitle}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.issuerName}
                          </div>
                        </div>
                        <SourceBadge
                          sourceType={item.sourceType}
                          storageLocation={item.storageLocation}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Requested Duration: 14 days · You can approve or exclude each document individually
                  </span>

                  <button
                    onClick={() => onReviewRequest(req)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Review & Decide Permissions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Decided Requests */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Past Consent Decisions ({pastRequests.length})
        </h2>

        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {pastRequests.map((req) => (
            <div key={req.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">
                    {req.providerName} ({req.organisationName})
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      req.requestStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : req.requestStatus === 'PARTIALLY_APPROVED'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {req.requestStatus.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-slate-500">
                  Purpose: {req.purpose}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Decided: {req.patientDecidedAt ? new Date(req.patientDecidedAt).toLocaleDateString() : 'Decided'} · {req.items?.length} documents evaluated
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onReviewRequest(req)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
