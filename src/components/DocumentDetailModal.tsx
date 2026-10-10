import React from 'react';
import {
  X,
  Database,
  Building2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Lock,
  FileText,
  Calendar,
  Tag,
  Eye,
  Trash2,
} from 'lucide-react';
import { SourceBadge } from './SourceBadge.js';
import { ApiClient } from '../services/api.js';

interface DocumentDetailModalProps {
  document: any;
  onClose: () => void;
  onRefresh?: () => void;
  onOpenEhrViewer?: (doc: any) => void;
  onOpenClinicalViewer?: (docId: string) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document: doc,
  onClose,
  onRefresh,
  onOpenEhrViewer,
  onOpenClinicalViewer,
}) => {
  const [loadingContent, setLoadingContent] = React.useState(false);
  const [viewData, setViewData] = React.useState<any>(null);
  const [viewError, setViewError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (doc?.storageLocation === 'PLATFORM') {
      fetchPlatformContent();
    }
  }, [doc]);

  const fetchPlatformContent = async () => {
    setLoadingContent(true);
    setViewError(null);
    try {
      const data = await ApiClient.viewDocument(doc.id);
      setViewData(data);
    } catch (err: any) {
      setViewError(err.message || 'Unable to retrieve document content');
    } finally {
      setLoadingContent(false);
    }
  };

  if (!doc) return null;

  const isDigiLocker = doc.sourceType === 'DIGILOCKER';
  const isHospital = doc.sourceType === 'HOSPITAL' || doc.sourceType === 'LABORATORY';
  const isPlatform = doc.storageLocation === 'PLATFORM';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SourceBadge
                sourceType={doc.sourceType}
                storageLocation={doc.storageLocation}
              />
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                {doc.documentType.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {doc.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
            <div>
              <div className="text-[11px] text-slate-500">Record Date</div>
              <div className="font-semibold text-slate-800">{doc.recordDate}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Issuer / Provider</div>
              <div className="font-semibold text-slate-800 truncate" title={doc.issuerName}>
                {doc.issuerName}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Storage Location</div>
              <div className="font-semibold text-slate-800">
                {isPlatform ? 'Continuum Vault (Encrypted)' : 'Original External Host'}
              </div>
            </div>
            {doc.sourceDocumentReference && (
              <div className="col-span-2">
                <div className="text-[11px] text-slate-500">Source Reference Identifier</div>
                <div className="font-mono text-slate-700 text-[11px] truncate">
                  {doc.sourceDocumentReference}
                </div>
              </div>
            )}
            <div>
              <div className="text-[11px] text-slate-500">Availability</div>
              <div className="font-semibold text-emerald-700">Verified & Available</div>
            </div>
          </div>

          {/* CRITICAL ARCHITECTURAL DISTINCTION VIEWS */}

          {/* CASE 1: DIGILOCKER */}
          {isDigiLocker && (
            <div className="space-y-4">
              <div className="bg-sky-50/80 border border-sky-200 rounded-lg p-4">
                <div className="flex items-start gap-2.5">
                  <Database className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sky-950 text-xs">
                      DigiLocker Architecture Boundary Notice
                    </h4>
                    <p className="text-sky-900 mt-1 leading-relaxed">
                      This document remains in DigiLocker. Our platform stores only the
                      permitted reference and metadata. Viewing and sharing the document are
                      subject to DigiLocker's supported authorisation process.
                    </p>
                    <p className="text-sky-800/80 mt-1 text-[11px]">
                      Security guarantee: The platform never retrieves, proxies, caches, or
                      downloads external medical file contents.
                    </p>
                  </div>
                </div>
              </div>

              {doc.metadata?.notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-medium text-slate-500 mb-1">
                    Connector Metadata Notes
                  </div>
                  <div className="text-slate-700">{doc.metadata.notes}</div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {onOpenEhrViewer && (
                  <button
                    onClick={() => onOpenEhrViewer(doc)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-medium rounded-lg transition-colors text-xs cursor-pointer shadow-xs"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Launch DigiLocker</span>
                  </button>
                )}
                <a
                  href={doc.metadata?.externalPortalUrl || 'https://digilocker.gov.in'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-sky-300 text-sky-800 hover:bg-sky-50 font-medium rounded-lg transition-colors text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>DigiLocker ↗</span>
                </a>
              </div>
            </div>
          )}

          {/* CASE 2: HOSPITAL EHR */}
          {isHospital && (
            <div className="space-y-4">
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-indigo-950 text-xs">
                      Hospital EHR Boundary Notice
                    </h4>
                    <p className="text-indigo-900 mt-1 leading-relaxed">
                      This record remains with the healthcare provider ({doc.issuerName}).
                      Access must be authorised through the provider's supported sharing
                      workflow.
                    </p>
                    <div className="mt-2 text-indigo-800 text-[11px] flex items-center gap-2">
                      <span>External Status:</span>
                      <span className="font-semibold text-indigo-950">
                        {doc.externalWorkflowStatus === 'CONFIRMED'
                          ? 'Sharing Confirmed by Hospital'
                          : doc.externalWorkflowStatus === 'PENDING_EXTERNAL_CONFIRMATION'
                          ? 'Awaiting Hospital Authorization Release'
                          : 'Not Initiated'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {doc.metadata?.doctorName && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-[11px] text-slate-500">Attending Physician</div>
                    <div className="font-medium text-slate-800">{doc.metadata.doctorName}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Diagnostic Code</div>
                    <div className="font-medium text-slate-800">{doc.metadata.diagnosticCode || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* Link Directing to EHR Portal or Viewer Page */}
              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-950 text-xs flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Link Directing to EHR Portal or Viewer Page</span>
                  </span>
                  <a
                    href={doc.metadata?.externalPortalUrl || 'https://records.sunrisemedical.org'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Hospital EHR Link ↗</span>
                  </a>
                </div>
                <div className="font-mono text-[11px] text-slate-600 truncate">
                  {doc.metadata?.externalPortalUrl || 'https://records.sunrisemedical.org/patient/episodes/' + (doc.sourceDocumentReference || doc.id)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {onOpenEhrViewer && (
                  <button
                    onClick={() => onOpenEhrViewer(doc)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-medium rounded-lg transition-colors text-xs cursor-pointer shadow-xs"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Launch Hospital EHR Web Viewer Portal</span>
                  </button>
                )}
                <a
                  href={doc.metadata?.externalPortalUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-indigo-300 text-indigo-800 hover:bg-indigo-50 font-medium rounded-lg transition-colors text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>External Portal Link ↗</span>
                </a>
              </div>
            </div>
          )}

          {/* CASE 3: PLATFORM UPLOAD */}
          {isPlatform && (
            <div className="space-y-4">
              <div className="bg-teal-50/80 border border-teal-200 rounded-lg p-3.5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-teal-950 text-xs">
                      Platform Storage & Access Policy
                    </h4>
                    <p className="text-teal-900 mt-1 leading-relaxed">
                      Stored privately on Continuum Health platform. You control who is allowed
                      to view it through explicit document-level consent grants.
                    </p>
                  </div>
                </div>
              </div>

              {/* Associated External Portal / Viewer Link if uploaded with link */}
              {doc.metadata?.externalPortalUrl && (
                <div className={`p-3 rounded-lg border space-y-1.5 ${
                  doc.metadata.externalPortalUrl.includes('digilocker')
                    ? 'bg-sky-50/70 border-sky-200'
                    : 'bg-indigo-50/60 border-indigo-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs flex items-center gap-1.5">
                      {doc.metadata.externalPortalUrl.includes('digilocker') ? (
                        <>
                          <Database className="w-3.5 h-3.5 text-sky-700" />
                          <span className="text-sky-950">Link Directing to DigiLocker</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                          <span className="text-indigo-950">Link Directing to Associated EHR Portal or Viewer Page</span>
                        </>
                      )}
                    </span>
                    <a
                      href={doc.metadata.externalPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 transition-colors text-white ${
                        doc.metadata.externalPortalUrl.includes('digilocker')
                          ? 'bg-sky-700 hover:bg-sky-800'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{doc.metadata.externalPortalUrl.includes('digilocker') ? 'Open DigiLocker ↗' : 'Open EHR Portal Link ↗'}</span>
                    </a>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 truncate">
                    {doc.metadata.externalPortalUrl}
                  </div>
                </div>
              )}

              {/* Secure Document Viewer */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
                    <FileText className="w-3.5 h-3.5 text-teal-700" />
                    <span>Clinical Diagnostic Report Viewer</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Size: {(doc.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB · PDF
                  </span>
                </div>

                <div className="p-4 bg-white space-y-3">
                  {loadingContent ? (
                    <div className="py-8 text-center text-slate-400">
                      Decrypting and validating server-side authorization...
                    </div>
                  ) : viewError ? (
                    <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded text-xs">
                      {viewError}
                    </div>
                  ) : viewData?.simulatedContent ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          Clinical Summary
                        </div>
                        <p className="text-slate-800 mt-0.5 leading-relaxed font-medium">
                          {viewData.simulatedContent.summary}
                        </p>
                      </div>

                      {viewData.simulatedContent.findings && (
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            Report Findings
                          </div>
                          <ul className="list-disc pl-4 space-y-1 text-slate-700">
                            {viewData.simulatedContent.findings.map((f: string, i: number) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {viewData.simulatedContent.clinicalNotes && (
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700">
                          <span className="font-semibold text-slate-900">Impression: </span>
                          {viewData.simulatedContent.clinicalNotes}
                        </div>
                      )}

                      {onOpenClinicalViewer && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenClinicalViewer(doc.id);
                          }}
                          className="w-full mt-2 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Open Full Clinical Diagnostic Document (Print / Download)</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500">No content preview available.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Document ID: <span className="font-mono">{doc.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
