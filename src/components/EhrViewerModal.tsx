import React from 'react';
import {
  X,
  Building2,
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  UserCheck,
} from 'lucide-react';

interface EhrViewerModalProps {
  document: any;
  onClose: () => void;
}

export const EhrViewerModal: React.FC<EhrViewerModalProps> = ({ document: doc, onClose }) => {
  if (!doc) return null;

  const isDigiLocker = doc.sourceType === 'DIGILOCKER';
  const portalUrl =
    doc.metadata?.externalPortalUrl ||
    (isDigiLocker
      ? `https://digilocker.gov.in/portal/records/${doc.sourceDocumentReference || 'DL-992'}`
      : `https://records.sunrisemedical.org/patient/episodes/${doc.sourceDocumentReference || 'EHR-441'}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Hospital / Source Portal Header */}
        <div
          className={`p-4 border-b text-white flex items-center justify-between ${
            isDigiLocker ? 'bg-sky-900 border-sky-800' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20">
              {isDigiLocker ? <Database className="w-5 h-5 text-sky-200" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  {isDigiLocker ? 'DigiLocker National Health Portal' : doc.issuerName}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                  {isDigiLocker ? 'DIGILOCKER' : 'HOSPITAL EHR PORTAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {isDigiLocker ? 'DigiLocker Document Session' : 'Secure Web Viewer Session'} · Reference ID: {doc.sourceDocumentReference || doc.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={portalUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              title="Open direct URL in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Address Bar Simulation */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-[11px] text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-mono text-slate-700 truncate flex-1">{portalUrl}</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">TLS 1.3 256-bit Encrypted</span>
        </div>

        {/* Document Content View */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* Institutional Release Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Verified Institutional Document
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                  {doc.title}
                </h2>
                <div className="text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <span>Facility: {doc.issuerName}</span>
                  <span>·</span>
                  <span>Date: {doc.recordDate}</span>
                  <span>·</span>
                  <span>Category: {doc.documentType?.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified at Source</span>
                </span>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Auth Ref: {doc.sourceDocumentReference || 'SMC-REF-2026'}
                </div>
              </div>
            </div>

            {/* Patient Encounter Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient Name</span>
                <div className="font-bold text-slate-800">Priya Sharma</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Age / Gender</span>
                <div className="font-semibold text-slate-800">34 Y / Female (B+)</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Department</span>
                <div className="font-semibold text-slate-800 truncate">
                  {doc.metadata?.department || 'Internal Medicine & OPD'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Attending Doctor</span>
                <div className="font-semibold text-slate-800 truncate">
                  {doc.metadata?.doctorName || 'Dr. Vivek Kulkarni, MD'}
                </div>
              </div>
            </div>

            {/* Clinical Details */}
            <div className="space-y-3 pt-2 text-slate-700 leading-relaxed text-xs">
              {doc.documentType === 'DISCHARGE_SUMMARY' ? (
                <>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="font-bold text-slate-900">Diagnosis at Discharge: </span>
                    <span>Acute Gastroenteritis with Mild Dehydration (ICD-10 A09)</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                      Hospital Course & Summary of Care:
                    </span>
                    <p>
                      Patient was admitted with acute vomiting, pyrexia, and abdominal cramping. Intravenous
                      fluid rehydration was administered. Oral rehydration tolerated well by Day 2. Stool routine
                      was negative for ova/cysts. Electrolytes normalised (Serum Na 139, K 4.1). Discharged in
                      hemodynamically stable condition.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                      Discharge Medications & Follow-up:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                      <li>Tab. Rifaximin 400mg TID x 3 days</li>
                      <li>Oral Rehydration Salts (ORS) as needed</li>
                      <li>Probiotics (Lactobacillus GG) once daily x 10 days</li>
                      <li>Review in OPD in 7 days if symptoms persist</li>
                    </ul>
                  </div>
                </>
              ) : doc.documentType === 'PRESCRIPTION' ? (
                <>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="font-bold text-slate-900">Clinical Indication: </span>
                    <span>Type 2 Diabetes Mellitus & Primary Hypertension follow-up</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                      Prescribed Rx Therapy:
                    </span>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left divide-y divide-slate-200">
                        <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                          <tr>
                            <th className="p-2">Medication</th>
                            <th className="p-2">Dosage</th>
                            <th className="p-2">Frequency</th>
                            <th className="p-2">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="p-2 font-semibold">Tab. Metformin HCl</td>
                            <td className="p-2">500 mg</td>
                            <td className="p-2">Twice daily after meals</td>
                            <td className="p-2">30 Days</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-semibold">Tab. Telmisartan</td>
                            <td className="p-2">40 mg</td>
                            <td className="p-2">Once daily morning</td>
                            <td className="p-2">30 Days</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="font-bold text-slate-900">Verified Result Parameter: </span>
                    <span>{doc.title} — Verified against DigiLocker Health Registry</span>
                  </div>
                  <p className="text-slate-600">
                    {doc.metadata?.notes ||
                      'Verified laboratory parameter issued by accredited national health diagnostics network.'}
                  </p>
                </div>
              )}
            </div>

            {/* Official Hospital Digital Seal */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-[11px]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {isDigiLocker
                    ? 'Digitally Authenticated National Health Record · Verified by DigiLocker Authority'
                    : 'Digitally Authenticated EHR Record · Verified by Hospital Registrar'}
                </span>
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                SHA-256: 7f8a9b2c...4e1a
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Source: <span className="font-semibold">{doc.issuerName}</span> ({isDigiLocker ? 'DigiLocker' : 'EHR System'})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
          >
            {isDigiLocker ? 'Close DigiLocker' : 'Close EHR Viewer'}
          </button>
        </div>
      </div>
    </div>
  );
};
