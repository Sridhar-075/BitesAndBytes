import React from 'react';
import {
  Share2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Search,
  Filter,
  FlaskConical,
  ImageIcon,
  Pill,
  CheckSquare,
  Square,
  Building2,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';
import { SourceBadge } from '../components/SourceBadge.js';

interface ProviderCreateRequestProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProviderCreateRequest: React.FC<ProviderCreateRequestProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [patientId] = React.useState('patient-1');
  const [patientName] = React.useState('Priya Sharma (DOB: 1992-05-14)');
  const [purpose, setPurpose] = React.useState('Comprehensive clinical evaluation & therapy adjustment');
  const [reason, setReason] = React.useState('Review recent pathology and radiology reports before prescribing new treatment protocol');
  const [durationDays, setDurationDays] = React.useState(14);
  const [availableDocs, setAvailableDocs] = React.useState<any[]>([]);
  const [selectedDocIds, setSelectedDocIds] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = React.useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  React.useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await ApiClient.getDocuments({ pageSize: 50 });
        setAvailableDocs(res.items || []);
        // Pre-select first 2 docs
        const initial: Record<string, boolean> = {};
        res.items?.slice(0, 2).forEach((d) => (initial[d.id] = true));
        setSelectedDocIds(initial);
      } catch (err: any) {
        console.error('Error fetching docs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Category counts
  const labDocsCount = availableDocs.filter((d) => d.documentType === 'LAB_REPORT').length;
  const imagingDocsCount = availableDocs.filter((d) => d.documentType === 'IMAGING_REPORT').length;
  const prescriptionDocsCount = availableDocs.filter((d) => d.documentType === 'PRESCRIPTION').length;
  const dischargeDocsCount = availableDocs.filter((d) => d.documentType === 'DISCHARGE_SUMMARY').length;
  const otherDocsCount = availableDocs.filter(
    (d) =>
      d.documentType !== 'LAB_REPORT' &&
      d.documentType !== 'IMAGING_REPORT' &&
      d.documentType !== 'PRESCRIPTION' &&
      d.documentType !== 'DISCHARGE_SUMMARY'
  ).length;

  // Filtered documents
  const filteredDocs = availableDocs.filter((doc) => {
    // Category filter
    if (categoryFilter !== 'ALL') {
      if (categoryFilter === 'OTHER') {
        const isStandard = ['LAB_REPORT', 'IMAGING_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY'].includes(doc.documentType);
        if (isStandard) return false;
      } else if (doc.documentType !== categoryFilter) {
        return false;
      }
    }

    // Source filter
    if (sourceFilter !== 'ALL') {
      if (sourceFilter === 'PLATFORM' && doc.storageLocation !== 'PLATFORM') return false;
      if (sourceFilter === 'DIGILOCKER' && doc.sourceType !== 'DIGILOCKER') return false;
      if (sourceFilter === 'HOSPITAL' && doc.sourceType !== 'HOSPITAL' && doc.sourceType !== 'LABORATORY') return false;
      if (sourceFilter === 'EXTERNAL' && doc.storageLocation !== 'EXTERNAL') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchIssuer = doc.issuerName.toLowerCase().includes(q);
      const matchCode = doc.metadata?.diagnosticCode?.toLowerCase().includes(q);
      if (!matchTitle && !matchIssuer && !matchCode) return false;
    }

    return true;
  });

  const selectVisible = () => {
    setSelectedDocIds((prev) => {
      const next = { ...prev };
      filteredDocs.forEach((d) => {
        next[d.id] = true;
      });
      return next;
    });
  };

  const deselectVisible = () => {
    setSelectedDocIds((prev) => {
      const next = { ...prev };
      filteredDocs.forEach((d) => {
        next[d.id] = false;
      });
      return next;
    });
  };

  const selectedCount = Object.values(selectedDocIds).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const docIds = Object.entries(selectedDocIds)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);

    if (docIds.length === 0) {
      setError('Please select at least one document to request.');
      return;
    }

    setSubmitting(true);
    try {
      await ApiClient.createAccessRequest({
        patientId,
        documentIds: docIds,
        purpose,
        reason,
        requestedDurationDays: durationDays,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit access request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Create Patient Record Access Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Specify treatment purpose, duration, and target medical records. Patient retains sole approval authority.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Patient Selection */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Target Patient
          </label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              PS
            </div>
            <div>
              <div className="font-bold text-slate-900">{patientName}</div>
              <div className="text-[11px] text-slate-500">
                Verified Patient ID: <span className="font-mono">patient-1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Purpose and Reason */}
        <div className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Treatment-Related Purpose *
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Follow-up consultation for endocrine protocol review"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Clinical Rationale / Notes for Patient *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain to the patient why these records are necessary for their treatment..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
            />
          </div>
        </div>

        {/* Requested Duration */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Requested Access Duration
          </label>
          <select
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs bg-white"
          >
            <option value={7}>7 Days (Acute Care Episode)</option>
            <option value={14}>14 Days (Standard Diagnostic Review)</option>
            <option value={30}>30 Days (Ongoing Outpatient Management)</option>
          </select>
        </div>

        {/* Document Selection with Comprehensive Category & Source Filters */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <label className="font-semibold text-slate-800 text-xs">
                  Select Documents from Patient Catalogue *
                </label>
                <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
                  {selectedCount} Selected
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Filter by lab reports, scans, prescriptions, or hospital source to request relevant records.
              </p>
            </div>

            {/* Quick Batch Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={selectVisible}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                Select Filtered ({filteredDocs.length})
              </button>
              <button
                type="button"
                onClick={deselectVisible}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                Deselect Filtered
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDocIds((prev) => {
                    const next = { ...prev };
                    availableDocs.forEach((d) => {
                      if (d.documentType === 'LAB_REPORT') next[d.id] = true;
                    });
                    return next;
                  });
                }}
                className="px-2 py-1 text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded transition-colors inline-flex items-center gap-1"
              >
                <FlaskConical className="w-3 h-3 text-emerald-600" />
                <span>+ All Labs</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDocIds((prev) => {
                    const next = { ...prev };
                    availableDocs.forEach((d) => {
                      if (d.documentType === 'IMAGING_REPORT') next[d.id] = true;
                    });
                    return next;
                  });
                }}
                className="px-2 py-1 text-[10px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded transition-colors inline-flex items-center gap-1"
              >
                <ImageIcon className="w-3 h-3 text-sky-600" />
                <span>+ All Scans</span>
              </button>
            </div>
          </div>

          {/* Filter Bar Controls */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, diagnostic code (e.g. LOINC/ICD), or facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills (Lab reports, images/scans, prescriptions, discharge summaries) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Category:
              </span>
              {[
                { id: 'ALL', label: 'All Records', count: availableDocs.length, icon: null },
                { id: 'LAB_REPORT', label: 'Lab Reports', count: labDocsCount, icon: FlaskConical },
                { id: 'IMAGING_REPORT', label: 'Images & Scans', count: imagingDocsCount, icon: ImageIcon },
                { id: 'PRESCRIPTION', label: 'Prescriptions', count: prescriptionDocsCount, icon: Pill },
                { id: 'DISCHARGE_SUMMARY', label: 'Discharge Summaries', count: dischargeDocsCount, icon: Building2 },
                { id: 'OTHER', label: 'Other', count: otherDocsCount, icon: FileText },
              ].map((cat) => {
                const IconComponent = cat.icon;
                const isActive = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {IconComponent && <IconComponent className="w-3 h-3" />}
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Source Filter */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Source:
              </span>
              {[
                { id: 'ALL', label: 'All Sources' },
                { id: 'PLATFORM', label: 'Platform Vault (Encrypted)' },
                { id: 'DIGILOCKER', label: 'DigiLocker' },
                { id: 'HOSPITAL', label: 'Hospital EHR' },
              ].map((src) => (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => setSourceFilter(src.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    sourceFilter === src.id
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {src.label}
                </button>
              ))}

              {(categoryFilter !== 'ALL' || sourceFilter !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('ALL');
                    setSourceFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="ml-auto text-[10px] text-teal-700 hover:text-teal-900 font-semibold underline"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Filtered Document List */}
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-72 overflow-y-auto bg-white shadow-2xs">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading patient catalogue...</div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">No medical records match the active filter criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter('ALL');
                    setSourceFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline"
                >
                  Clear filters to show all {availableDocs.length} records
                </button>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isChecked = !!selectedDocIds[doc.id];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isChecked ? 'bg-teal-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{doc.title}</span>
                        <SourceBadge
                          sourceType={doc.sourceType}
                          storageLocation={doc.storageLocation}
                          compact
                        />
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 capitalize">
                          {doc.documentType?.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>Facility: {doc.issuerName}</span>
                        <span>·</span>
                        <span>Date: {doc.recordDate}</span>
                        {doc.metadata?.diagnosticCode && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-teal-800 font-medium">
                              Code: {doc.metadata.diagnosticCode}
                            </span>
                          </>
                        )}
                        {doc.metadata?.externalPortalUrl && (
                          <>
                            <span>·</span>
                            <span className={`font-medium ${
                              doc.sourceType === 'DIGILOCKER' || doc.metadata.externalPortalUrl.includes('digilocker')
                                ? 'text-sky-700'
                                : 'text-indigo-700'
                            }`}>
                              {doc.sourceType === 'DIGILOCKER' || doc.metadata.externalPortalUrl.includes('digilocker')
                                ? 'DigiLocker Linked'
                                : 'EHR Portal Linked'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Warning & Submit */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-[11px] leading-relaxed">
          <strong>Non-Negotiable Consent Constraint: </strong>
          Submitting this request does NOT grant direct access to any document. The patient must explicitly
          review and confirm permission. For external records, access must follow the external institution's release workflow.
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Sending Request...' : 'Send Access Request'}
          </button>
        </div>
      </form>
    </div>
  );
};
