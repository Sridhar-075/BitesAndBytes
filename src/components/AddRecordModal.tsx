import React from 'react';
import {
  X,
  Link2,
  UploadCloud,
  Database,
  Building2,
  FileCheck,
  ShieldCheck,
  Info,
  ExternalLink,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';

interface AddRecordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({ onClose, onSuccess }) => {
  const [tab, setTab] = React.useState<'LINK' | 'UPLOAD'>('LINK');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Link form state
  const [linkSource, setLinkSource] = React.useState<'DIGILOCKER' | 'HOSPITAL'>('HOSPITAL');
  const [linkTitle, setLinkTitle] = React.useState('');
  const [linkDocType, setLinkDocType] = React.useState('DISCHARGE_SUMMARY');
  const [linkIssuer, setLinkIssuer] = React.useState('Sunrise Medical Centre');
  const [linkDate, setLinkDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [linkRef, setLinkRef] = React.useState('SMC-EHR-2026-9041');
  const [linkPortalUrl, setLinkPortalUrl] = React.useState('https://records.sunrisemedical.org/patient/episodes/2026-9041');

  // Upload form state
  const [uploadTitle, setUploadTitle] = React.useState('');
  const [uploadDocType, setUploadDocType] = React.useState('IMAGING_REPORT');
  const [uploadIssuer, setUploadIssuer] = React.useState('');
  const [uploadDate, setUploadDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [uploadNotes, setUploadNotes] = React.useState('');
  const [uploadPortalUrl, setUploadPortalUrl] = React.useState('');
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!linkTitle || !linkIssuer || !linkRef) {
      setError('Please provide title, issuing provider, and reference identifier.');
      return;
    }

    setSubmitting(true);
    try {
      await ApiClient.addExternalReference({
        sourceType: linkSource,
        documentType: linkDocType,
        title: linkTitle,
        issuerName: linkIssuer,
        recordDate: linkDate,
        sourceDocumentReference: linkRef,
        metadata: {
          notes: 'Manually linked EHR document reference.',
          externalPortalUrl: linkPortalUrl || 'https://records.sunrisemedical.org',
        },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to link document reference');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!uploadTitle || !uploadIssuer) {
      setError('Please provide title and issuing provider/facility.');
      return;
    }

    setSubmitting(true);
    try {
      await ApiClient.uploadDocument({
        title: uploadTitle,
        documentType: uploadDocType,
        issuerName: uploadIssuer,
        recordDate: uploadDate,
        metadata: {
          externalPortalUrl: uploadPortalUrl || undefined,
        },
        simulatedContent: {
          summary: `Clinical diagnostic report for ${uploadTitle}`,
          findings: [
            'All examination parameters reviewed by diagnostic imaging specialist.',
            'No evidence of acute acute pathology on comparative baseline.',
          ],
          clinicalNotes: uploadNotes || 'Routine patient clinical upload.',
        },
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Add Medical Record
            </h3>
            <p className="text-xs text-slate-500">
              Choose whether to link an external reference or store a file privately
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 p-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setTab('LINK');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors ${
              tab === 'LINK'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-4 h-4 text-teal-700" />
            <span>Option A: Link Existing Reference</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('UPLOAD');
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium transition-colors ${
              tab === 'UPLOAD'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-teal-700" />
            <span>Option B: Upload Document File</span>
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {tab === 'LINK' ? (
            <form onSubmit={handleLinkSubmit} className="space-y-4 text-xs">
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-sky-900 text-xs">
                <div className="font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-700" />
                  <span>Metadata Reference Only</span>
                </div>
                <p className="mt-1 text-[11px] text-sky-800">
                  This collects only the verified reference and metadata needed to catalogue
                  the record. Continuum Health will NEVER copy, download, or proxy the external file.
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Source Ecosystem
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLinkSource('DIGILOCKER');
                      if (!linkIssuer) setLinkIssuer('DigiLocker National Locker');
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors ${
                      linkSource === 'DIGILOCKER'
                        ? 'border-sky-500 bg-sky-50 text-sky-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Database className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div>DigiLocker</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        National Document Repository
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLinkSource('HOSPITAL');
                      if (!linkIssuer) setLinkIssuer('Hospital / Diagnostic EHR');
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-colors ${
                      linkSource === 'HOSPITAL'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div>Hospital EHR</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        Hospital or Clinic System
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count Report or Cardiology OPD Note"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Document Category
                  </label>
                  <select
                    value={linkDocType}
                    onChange={(e) => setLinkDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs bg-white"
                  >
                    <option value="LAB_REPORT">Laboratory Report</option>
                    <option value="PRESCRIPTION">Prescription</option>
                    <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                    <option value="IMAGING_REPORT">Imaging & Scan</option>
                    <option value="VACCINATION_RECORD">Vaccination Record</option>
                    <option value="CLINICAL_NOTE">Clinical Note</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Record Date
                  </label>
                  <input
                    type="date"
                    required
                    value={linkDate}
                    onChange={(e) => setLinkDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Issuing Provider / Facility
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City Diagnostics Lab"
                    value={linkIssuer}
                    onChange={(e) => setLinkIssuer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    External Reference Identifier
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-DOC-99201 or SMC-MR-4410"
                    value={linkRef}
                    onChange={(e) => setLinkRef(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
                  />
                </div>
              </div>

              {/* EHR Portal / Web Viewer Page Link */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>EHR Portal / Web Viewer Page Link</span>
                  </label>
                  {linkPortalUrl && (
                    <a
                      href={linkPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-indigo-700 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Test / Preview Portal Link</span>
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://records.sunrisemedical.org/patient/episodes/2026-9041"
                  value={linkPortalUrl}
                  onChange={(e) => setLinkPortalUrl(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs bg-white"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkSource('HOSPITAL');
                      setLinkDocType('DISCHARGE_SUMMARY');
                      setLinkIssuer('Sunrise Medical Centre');
                      setLinkRef('SMC-IPD-DISCH-2026-9041');
                      setLinkPortalUrl('https://records.sunrisemedical.org/patient/episodes/2026-9041');
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition-colors"
                  >
                    Sunrise Hospital EHR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkSource('HOSPITAL');
                      setLinkDocType('PRESCRIPTION');
                      setLinkIssuer('Green Valley Clinic');
                      setLinkRef('GVC-RX-2026-90412');
                      setLinkPortalUrl('https://greenvalleyclinic.org/rx/verify/90412');
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition-colors"
                  >
                    Green Valley OPD Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkSource('DIGILOCKER');
                      setLinkDocType('LAB_REPORT');
                      setLinkIssuer('DigiLocker National Health Locker');
                      setLinkRef('DL-DOC-2026-HEALTH-4412');
                      setLinkPortalUrl('https://digilocker.gov.in/portal/records/DL-DOC-2026-HEALTH-4412');
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition-colors"
                  >
                    DigiLocker Gateway
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Linking Reference...' : 'Add External Reference'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-teal-950 text-xs">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Platform Secure Vault</span>
                </div>
                <p className="mt-1 text-[11px] text-teal-900 leading-relaxed">
                  This document will be stored on our platform. You can manage who is allowed
                  to view it through your granular sharing permissions.
                </p>
              </div>

              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-teal-700 mx-auto mb-2" />
                <p className="font-semibold text-slate-800 text-xs">
                  {selectedFileName ? selectedFileName : 'Drag & drop or click to choose a medical file'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  PDF, JPEG, or PNG supported (simulated secure encryption up to 25 MB)
                </p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload-input"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFileName(file.name);
                      if (!uploadTitle) {
                        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                />
                <label
                  htmlFor="file-upload-input"
                  className="inline-block mt-3 px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  Browse Files
                </label>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultrasound Abdomen Scan or Cardiology Consultation"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Document Category
                  </label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs bg-white"
                  >
                    <option value="IMAGING_REPORT">Imaging and Scans</option>
                    <option value="LAB_REPORT">Laboratory Report</option>
                    <option value="PRESCRIPTION">Prescription</option>
                    <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                    <option value="CLINICAL_NOTE">Clinical Notes</option>
                    <option value="OTHER">Other Medical Document</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Record Date
                  </label>
                  <input
                    type="date"
                    required
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Issuing Provider / Lab Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Diagnostics or Fortis Hospital"
                  value={uploadIssuer}
                  onChange={(e) => setUploadIssuer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Optional Clinical Notes / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Follow-up study after 3 months of medication"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
                />
              </div>

              {/* Link Directing to EHR Portal or Viewer Page for Uploaded Record */}
              <div className={`p-3 rounded-lg space-y-2 border ${
                uploadPortalUrl.toLowerCase().includes('digilocker')
                  ? 'bg-sky-50/50 border-sky-200'
                  : 'bg-indigo-50/50 border-indigo-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    {uploadPortalUrl.toLowerCase().includes('digilocker') ? (
                      <>
                        <Database className="w-3.5 h-3.5 text-sky-700" />
                        <span>Link Directing to DigiLocker (Optional)</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Link Directing to EHR Portal or Viewer Page (Optional)</span>
                      </>
                    )}
                  </label>
                  {uploadPortalUrl && (
                    <a
                      href={uploadPortalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`text-[11px] font-semibold inline-flex items-center gap-1 ${
                        uploadPortalUrl.toLowerCase().includes('digilocker')
                          ? 'text-sky-700 hover:text-sky-800'
                          : 'text-indigo-700 hover:text-indigo-800'
                      }`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{uploadPortalUrl.toLowerCase().includes('digilocker') ? 'Test / Open DigiLocker ↗' : 'Test / Open EHR Link ↗'}</span>
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="e.g. https://records.sunrisemedical.org/patient/scans/2026-8812 or https://digilocker.gov.in/doc/..."
                  value={uploadPortalUrl}
                  onChange={(e) => setUploadPortalUrl(e.target.value)}
                  className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs bg-white"
                />
                <p className="text-[10px] text-slate-500">
                  Provide a direct link directing to the hospital EHR portal, web viewer page, or DigiLocker record. Both you and authorised doctors can use this link to access the document directly.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadPortalUrl('https://digilocker.gov.in/mock-portal/issued-docs/DL-DOC-2026-LAB-7719');
                      if (!uploadIssuer) setUploadIssuer('DigiLocker National Health Locker');
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 rounded transition-colors font-medium cursor-pointer"
                  >
                    DigiLocker Record Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadPortalUrl('https://records.sunrisemedical.org/patient/scans/2026-8812');
                      if (!uploadIssuer) setUploadIssuer('Sunrise Medical Centre (EHR)');
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition-colors cursor-pointer"
                  >
                    Sunrise Hospital EHR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadPortalUrl('https://greenvalleyclinic.org/patient/reports/GVC-90412');
                      if (!uploadIssuer) setUploadIssuer('Green Valley Clinic (OPD)');
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition-colors cursor-pointer"
                  >
                    Green Valley OPD Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadPortalUrl('https://citydiagnostics.org/reports/view/CDR-4410');
                      if (!uploadIssuer) setUploadIssuer('City Diagnostic Centre');
                    }}
                    className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition-colors cursor-pointer"
                  >
                    City Diagnostics Portal
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Encrypting & Uploading...' : 'Upload Medical Record'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
