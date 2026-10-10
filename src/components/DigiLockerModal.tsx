import React from 'react';
import {
  X,
  Database,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';

interface DigiLockerModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const DigiLockerModal: React.FC<DigiLockerModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [stateToken, setStateToken] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [discoveredRecords, setDiscoveredRecords] = React.useState<any[]>([]);
  const [selectedToLink, setSelectedToLink] = React.useState<Record<string, boolean>>({});
  const [linkingInProgress, setLinkingInProgress] = React.useState(false);

  // Step 1: Start Auth
  const handleStart = async () => {
    setLoading(true);
    try {
      const data = await ApiClient.startDigiLocker();
      setStateToken(data.stateToken);
      setStep(2);
    } catch (err: any) {
      alert(err.message || 'Error starting DigiLocker session');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete Mock Consent
  const handleCompleteConsent = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.completeDigiLocker(stateToken);
      setDiscoveredRecords(res.discoverableRecords || []);
      // Preselect first record
      const initial: Record<string, boolean> = {};
      res.discoverableRecords?.forEach((r, idx) => {
        initial[r.id] = idx === 0;
      });
      setSelectedToLink(initial);
      setStep(3);
    } catch (err: any) {
      alert(err.message || 'Error completing DigiLocker authorization');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Link Selected References
  const handleLinkSelected = async () => {
    setLinkingInProgress(true);
    try {
      const recordsToLink = discoveredRecords.filter((r) => selectedToLink[r.id]);
      for (const r of recordsToLink) {
        await ApiClient.addExternalReference({
          sourceType: 'DIGILOCKER',
          documentType: r.documentType,
          title: r.title,
          issuerName: r.issuerName,
          recordDate: r.recordDate,
          sourceDocumentReference: r.sourceDocumentReference,
          metadata: {
            notes: 'Linked via DigiLocker mock discovery gateway.',
          },
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error linking discovered documents');
    } finally {
      setLinkingInProgress(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-sky-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connect DigiLocker Account
              </h3>
              <p className="text-[11px] text-slate-500">
                Simulated National Digital Health Document Locker Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-500">
          <div
            className={`flex-1 py-2 px-3 text-center border-b-2 ${
              step === 1 ? 'border-sky-600 text-sky-900 font-bold' : 'border-transparent'
            }`}
          >
            1. Consent Scope
          </div>
          <div
            className={`flex-1 py-2 px-3 text-center border-b-2 ${
              step === 2 ? 'border-sky-600 text-sky-900 font-bold' : 'border-transparent'
            }`}
          >
            2. Authorisation Portal
          </div>
          <div
            className={`flex-1 py-2 px-3 text-center border-b-2 ${
              step === 3 ? 'border-sky-600 text-sky-900 font-bold' : 'border-transparent'
            }`}
          >
            3. Link References
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 text-sky-950">
                <h4 className="font-semibold text-xs text-sky-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                  <span>Metadata-Only Connection Architecture</span>
                </h4>
                <p className="mt-1.5 text-xs text-sky-900 leading-relaxed">
                  Continuum Health connects to DigiLocker exclusively to discover issued
                  records and catalogue their verified references.
                </p>
                <div className="mt-2.5 p-2 bg-white/80 rounded border border-sky-200 text-[11px] text-sky-950 space-y-1">
                  <div>✔ Stores verified title, issuer, date, and reference identifier.</div>
                  <div>❌ Never downloads, copies, or proxies medical file contents.</div>
                  <div>❌ Never requests unrestricted access to all personal locker files.</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Hackathon Demonstration Notice: </span>
                  This interaction uses an authentic simulated OAuth flow without requiring
                  real government DigiLocker credentials or Aadhaar OTP.
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>Continue to DigiLocker Authorization</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-800">
                    DigiLocker Mock Consent Screen
                  </div>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono">
                    Token: {stateToken.slice(0, 12)}...
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  <strong>Application:</strong> Continuum Health (Patient-Controlled Portal)<br />
                  <strong>Requested Scope:</strong> Read metadata for verified health and diagnostic certificates.<br />
                  <strong>Storage:</strong> No document contents will be retained on the requesting platform.
                </p>

                <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Linked DigiLocker User: </span>
                  Priya Sharma (Mobile: +91 98765 43210)
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>

                <button
                  onClick={handleCompleteConsent}
                  disabled={loading}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Authorize & Discover Records</span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>DigiLocker Connected · Select Documents to Link</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-800">
                  Select which discovered records to add to your Continuum Health unified catalogue.
                  Only references will be linked.
                </p>
              </div>

              <div className="space-y-2">
                {discoveredRecords.map((rec) => {
                  const isChecked = !!selectedToLink[rec.id];
                  return (
                    <div
                      key={rec.id}
                      onClick={() =>
                        setSelectedToLink((prev) => ({ ...prev, [rec.id]: !prev[rec.id] }))
                      }
                      className={`p-3 border rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-sky-500 bg-sky-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 text-xs">{rec.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {rec.issuerName} · {rec.recordDate}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Ref: {rec.sourceDocumentReference}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Skip for Now
                </button>

                <button
                  onClick={handleLinkSelected}
                  disabled={linkingInProgress}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {linkingInProgress
                      ? 'Linking...'
                      : `Link Selected (${Object.values(selectedToLink).filter(Boolean).length}) Records`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
