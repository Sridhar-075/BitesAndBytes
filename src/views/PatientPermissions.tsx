import React from 'react';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  PowerOff,
} from 'lucide-react';
import { SourceBadge } from '../components/SourceBadge.js';
import { ApiClient } from '../services/api.js';

interface PatientPermissionsProps {
  onRefresh: () => void;
}

export const PatientPermissions: React.FC<PatientPermissionsProps> = ({ onRefresh }) => {
  const [grants, setGrants] = React.useState<any[]>([]);
  const [workflows, setWorkflows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [grantsData, wfData] = await Promise.all([
        ApiClient.getPermissions(),
        ApiClient.getExternalSharingWorkflows(),
      ]);
      setGrants(grantsData || []);
      setWorkflows(wfData || []);
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleRevokePlatformGrant = async (grantId: string, doctorName: string) => {
    if (
      !confirm(
        `Are you sure you want to revoke platform access for ${doctorName}? Future access attempts by this provider will be immediately blocked by the permission decision engine.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await ApiClient.revokePermission(grantId);
      await fetchData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error revoking permission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeExternalWorkflow = async (workflowId: string) => {
    if (
      !confirm(
        'Initiate external revocation with the original healthcare institution? External status will update to REVOCATION_PENDING.'
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await ApiClient.revokeExternalSharing(workflowId);
      await fetchData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error revoking external workflow');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Access & Permissions Control
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect, audit, and instantly revoke active sharing grants and external provider authorisations.
        </p>
      </div>

      {/* SECTION 1: Platform-Uploaded Active Grants */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Platform Vault Permissions ({grants.length})
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Governs uploaded files stored in your private vault. Revocation takes effect immediately on the server.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading grants...</div>
          ) : grants.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No platform vault grants currently active.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Recipient Doctor</th>
                    <th className="py-3 px-4">Organisation</th>
                    <th className="py-3 px-4">Documents Covered</th>
                    <th className="py-3 px-4">Stated Purpose</th>
                    <th className="py-3 px-4">Valid Until</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grants.map((grant) => (
                    <tr key={grant.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {grant.granteeName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {grant.organisationName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {grant.documents?.map((d: any) => (
                            <div key={d.id} className="font-medium text-slate-800 text-[11px]">
                              {d.title}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {grant.purpose}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {new Date(grant.validUntil).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            grant.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {grant.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {grant.status === 'ACTIVE' ? (
                          <button
                            onClick={() =>
                              handleRevokePlatformGrant(grant.id, grant.granteeName)
                            }
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Revoke Grant
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Revoked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: External Sharing Workflows */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-700" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            External Sharing Workflows ({workflows.length})
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Tracks external sharing authorisations for records held at DigiLocker or Hospital EHRs.
          The platform coordinates these workflows without holding file contents.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {workflows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No external sharing workflows recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-4">External Source</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">External Status</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Source Coordination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workflows.map((wf) => (
                    <tr key={wf.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {wf.documentTitle}
                      </td>
                      <td className="py-3.5 px-4">
                        <SourceBadge
                          sourceType={wf.sourceType}
                          storageLocation="EXTERNAL"
                          compact
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{wf.recipientName}</div>
                        <div className="text-[11px] text-slate-400">{wf.organisationName}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            wf.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : wf.status === 'PENDING_EXTERNAL_CONFIRMATION'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : wf.status === 'REVOCATION_PENDING'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {wf.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500 max-w-xs truncate">
                        {wf.note || 'No notes'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {wf.status === 'CONFIRMED' ? (
                          <button
                            onClick={() => handleRevokeExternalWorkflow(wf.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Initiate Revocation
                          </button>
                        ) : wf.status === 'REVOCATION_PENDING' ? (
                          <span className="text-[11px] text-purple-700 font-medium">
                            Revocation Pending Source
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
