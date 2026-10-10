import React from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Lock,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';

interface SecurityTestModalProps {
  onClose: () => void;
}

export const SecurityTestModal: React.FC<SecurityTestModalProps> = ({ onClose }) => {
  const [running, setRunning] = React.useState(false);
  const [report, setReport] = React.useState<any | null>(null);

  const runTests = async () => {
    setRunning(true);
    try {
      const data = await ApiClient.runSecurityTests();
      setReport(data);
    } catch (err: any) {
      alert(err.message || 'Failed to execute security tests');
    } finally {
      setRunning(false);
    }
  };

  React.useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-teal-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-800 flex items-center justify-center text-teal-200 border border-teal-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Mandatory Security Invariants Test Runner
                </h3>
                {report && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-700 text-teal-100 rounded-full border border-teal-600">
                    {report.summary.passed}/{report.summary.total} PASSED
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-200">
                Automated live assertions verifying strict architecture rules (Section 15: Tests A–H)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-teal-300 hover:text-white rounded-lg hover:bg-teal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-600">
            Tests run in-memory against the live PermissionDecisionService and DB integrity rules.
          </div>
          <button
            onClick={runTests}
            disabled={running}
            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Verifying Invariants...' : 'Rerun All Tests'}</span>
          </button>
        </div>

        {/* Test List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {report?.tests?.map((test: any) => (
            <div
              key={test.id}
              className={`p-3.5 rounded-lg border transition-colors ${
                test.passed
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-rose-200 bg-rose-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  {test.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {test.id}: {test.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {test.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {test.description}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    test.passed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {test.passed ? 'Verified' : 'Failed'}
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 font-medium">Expected: </span>
                  <span className="font-mono text-slate-700">{test.expectedResult}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Live Evaluation: </span>
                  <span className="font-mono text-slate-800 font-semibold">{test.actualResult}</span>
                </div>
                <div className="sm:col-span-2 text-slate-600">
                  <span className="font-medium">Details: </span>
                  {test.details}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Continuum Health Invariant Guarantee: Zero proxying of external files · Zero blanket grants.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition-colors"
          >
            Close Runner
          </button>
        </div>
      </div>
    </div>
  );
};
