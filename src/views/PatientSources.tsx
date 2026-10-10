import React from 'react';
import {
  Database,
  Building2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  PowerOff,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';

interface PatientSourcesProps {
  onOpenDigiLockerModal: () => void;
  onOpenUploadModal: () => void;
  onRefresh: () => void;
}

export const PatientSources: React.FC<PatientSourcesProps> = ({
  onOpenDigiLockerModal,
  onOpenUploadModal,
  onRefresh,
}) => {
  const [connections, setConnections] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.getSourceConnections();
      setConnections(data || []);
    } catch (err: any) {
      console.error('Error fetching source connections:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchConnections();
  }, []);

  const handleDisconnect = async (connId: string) => {
    if (!confirm('Are you sure you want to disconnect this source? Existing linked references will remain catalogued but no future synchronisations will occur.')) {
      return;
    }
    setActionLoading(true);
    try {
      await ApiClient.disconnectSource(connId);
      await fetchConnections();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error disconnecting source');
    } finally {
      setActionLoading(false);
    }
  };

  const digiLockerConn = connections.find((c) => c.sourceType === 'DIGILOCKER');
  const hospitalConns = connections.filter((c) => c.sourceType === 'HOSPITAL' || c.sourceType === 'LABORATORY');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Connected Sources
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage integrations with national lockers, hospital EHRs, and private diagnostic vaults.
        </p>
      </div>

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: DigiLocker National Locker */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    DigiLocker National Locker
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Government of India Digital Document Locker
                  </p>
                </div>
              </div>

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  digiLockerConn?.connectionStatus === 'CONNECTED'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {digiLockerConn?.connectionStatus === 'CONNECTED' ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Link supported health documents from your DigiLocker account. Continuum Health
              retains permitted document references and verified metadata only.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Linked Document References:</span>
                <span className="font-bold text-slate-800">
                  {digiLockerConn?.linkedRecordsCount || 2} records
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Discovery Sync:</span>
                <span className="font-medium text-slate-700">
                  {digiLockerConn ? new Date(digiLockerConn.lastCheckedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Supported Capabilities:</span>
                <span className="text-slate-700 text-[11px]">Metadata Discovery, Reference Verification</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            {digiLockerConn?.connectionStatus === 'CONNECTED' ? (
              <>
                <button
                  onClick={() => handleDisconnect(digiLockerConn.id)}
                  disabled={actionLoading}
                  className="text-xs text-rose-700 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Disconnect
                </button>
                <button
                  onClick={onOpenDigiLockerModal}
                  className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Discover & Link Records
                </button>
              </>
            ) : (
              <button
                onClick={onOpenDigiLockerModal}
                className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Connect DigiLocker
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Manual Uploads Storage Vault */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Platform Storage Vault
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Patient-Uploaded Encrypted Storage
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active Vault
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Files uploaded directly by you (PDF scans, lab results, MRI reports) are encrypted
              and stored on this platform. Access is released only when server-side checks verify your active consent.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Stored Files:</span>
                <span className="font-bold text-slate-800">2 files (~6.1 MB)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Encryption:</span>
                <span className="font-medium text-slate-700">AES-256 (Simulated At-Rest)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sharing Policy:</span>
                <span className="text-teal-800 font-semibold text-[11px]">Zero Access Without Explicit Grant</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onOpenUploadModal}
              className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Upload Medical Record
            </button>
          </div>
        </div>

        {/* Card 3: Sunrise Medical Centre EHR */}
        {hospitalConns.map((conn) => (
          <div
            key={conn.id}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {conn.providerName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Hospital Electronic Health Record Integration
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Connected
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Hospital records remain held by the institution. Continuum Health facilitates
                sharing request coordination and tracks external release status.
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Linked Records:</span>
                  <span className="font-bold text-slate-800">
                    {conn.linkedRecordsCount || 1} records
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">External Patient Reference:</span>
                  <span className="font-mono text-slate-700 text-[11px]">
                    {conn.externalReference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Release Protocol:</span>
                  <span className="text-indigo-900 font-medium text-[11px]">
                    Hospital release verification required
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Connected since {new Date(conn.connectedAt).toLocaleDateString()}
              </span>
              <span className="font-medium text-slate-700">Healthy Connector</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
