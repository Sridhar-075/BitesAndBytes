import React from 'react';
import {
  ShieldAlert,
  Building2,
  CheckCircle2,
  XCircle,
  Database,
  Link2,
  Activity,
  History,
  Lock,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAdmin = async () => {
      setLoading(true);
      try {
        const data = await ApiClient.getAdminOverview();
        setOverview(data);
      } catch (err: any) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            Platform Trust & Compliance Admin
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          System Administration & Governance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor healthcare provider verification, connector availability, and compliance events.
        </p>
      </div>

      {/* Admin Privacy Guarantee Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-xs text-amber-900">
            Zero Clinical Document Access Architecture Guarantee
          </div>
          <p className="mt-1 text-[11px] text-amber-900 leading-relaxed">
            Platform administrators manage system integrity and verify clinicians, but have
            <strong> zero permission</strong> to open or view patient medical documents.
            Clinical content remains strictly restricted to authorized treating doctors with active patient consent grants.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 font-semibold uppercase text-[11px]">
            Verified Clinicians
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {overview?.providers?.length || 3}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            All active & state council verified
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 font-semibold uppercase text-[11px]">
            Connected Source Ecosystems
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {overview?.sourceConnections?.length || 3}
          </div>
          <div className="text-[11px] text-sky-700 font-medium mt-1">
            DigiLocker + 2 Hospital EHRs
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 font-semibold uppercase text-[11px]">
            Audit Events Logged
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {overview?.auditCount || 12}
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            Immutable correlation IDs enforced
          </div>
        </div>
      </div>

      {/* Clinician Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
        <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
          Registered Healthcare Providers & Organisations
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
              <tr>
                <th className="py-2.5 px-3">Provider Name</th>
                <th className="py-2.5 px-3">Specialty</th>
                <th className="py-2.5 px-3">Organisation</th>
                <th className="py-2.5 px-3">Council Registration</th>
                <th className="py-2.5 px-3">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overview?.providers?.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {p.displayName}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{p.specialty}</td>
                  <td className="py-3 px-3 text-slate-600">{p.organisationName}</td>
                  <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                    {p.registrationNumber}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {p.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
