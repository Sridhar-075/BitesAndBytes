import React from 'react';
import {
  Stethoscope,
  Clock,
  FileCheck2,
  ExternalLink,
  Plus,
  ArrowRight,
  ShieldAlert,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';
import { SourceBadge } from '../components/SourceBadge.js';

interface ProviderDashboardProps {
  currentProvider: any;
  organisation: any;
  onNavigateToTab: (tab: string) => void;
  onOpenCreateRequest: () => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  currentProvider,
  organisation,
  onNavigateToTab,
  onOpenCreateRequest,
}) => {
  const [requests, setRequests] = React.useState<any[]>([]);
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [workflows, setWorkflows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      try {
        const [reqs, perms, wfs] = await Promise.all([
          ApiClient.getAccessRequests(),
          ApiClient.getPermissions(),
          ApiClient.getExternalSharingWorkflows(),
        ]);
        setRequests(reqs || []);
        setPermissions(perms || []);
        setWorkflows(wfs || []);
      } catch (err: any) {
        console.error('Error fetching provider dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviderData();
  }, []);

  const pendingRequestsCount = requests.filter((r) => r.requestStatus === 'PENDING_PATIENT_APPROVAL').length;
  const activePlatformGrantsCount = permissions.filter((p) => p.status === 'ACTIVE').length;
  const externalPendingCount = workflows.filter((w) => w.status === 'PENDING_EXTERNAL_CONFIRMATION').length;
  const externalConfirmedCount = workflows.filter((w) => w.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Portal — {currentProvider?.displayName || 'Doctor Portal'}
            </h1>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Clinician
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentProvider?.specialty || 'Physician'} · {organisation?.name || 'Healthcare Facility'}
          </p>
        </div>

        <button
          onClick={onOpenCreateRequest}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Patient Access Request</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Patient Requests */}
        <div
          onClick={() => onNavigateToTab('provider-requests')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {pendingRequestsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">awaiting patient</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Awaiting Priya Sharma's consent
          </div>
        </div>

        {/* Card 2: Approved Platform Documents */}
        <div
          onClick={() => onNavigateToTab('provider-approved')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Approved Vault Docs
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {activePlatformGrantsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">active grants</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Authorized for clinical review
          </div>
        </div>

        {/* Card 3: External Sharing Pending */}
        <div
          onClick={() => onNavigateToTab('provider-external')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              External Coordination
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {externalPendingCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">pending release</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Awaiting source release token
          </div>
        </div>

        {/* Card 4: Confirmed External Shares */}
        <div
          onClick={() => onNavigateToTab('provider-external')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              External Confirmed
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {externalConfirmedCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">confirmed</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Available at hospital portal
          </div>
        </div>
      </div>

      {/* Access Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Your Patient Access Requests
            </h2>
            <p className="text-xs text-slate-500">
              Track real-time patient consent and external source coordination status
            </p>
          </div>
          <button
            onClick={onOpenCreateRequest}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Create New Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {requests.map((req) => (
            <div key={req.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{req.patientName || 'Priya Sharma'}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      req.requestStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : req.requestStatus === 'PENDING_PATIENT_APPROVAL'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : req.requestStatus === 'PARTIALLY_APPROVED'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {req.requestStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-slate-600">
                  Purpose: {req.purpose}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Requested {req.items?.length} documents · Valid until{' '}
                  {new Date(req.requestedExpiryAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {req.requestStatus === 'APPROVED' || req.requestStatus === 'PARTIALLY_APPROVED' ? (
                  <button
                    onClick={() => onNavigateToTab('provider-approved')}
                    className="px-3 py-1.5 bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200 rounded font-semibold text-xs cursor-pointer"
                  >
                    View Approved Files
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Awaiting Patient Review
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
