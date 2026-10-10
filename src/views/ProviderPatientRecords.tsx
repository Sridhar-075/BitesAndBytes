import React from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  Eye,
  FileText,
  Lock,
  Building2,
  Database,
  ShieldCheck,
  ExternalLink,
  Plus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { SourceBadge } from '../components/SourceBadge.js';
import { ApiClient } from '../services/api.js';

interface ProviderPatientRecordsProps {
  currentProvider: any;
  onAccessDocument: (docId: string) => void;
  onOpenEhrViewer: (doc: any) => void;
  onRequestAccess: (docId: string) => void;
}

export const ProviderPatientRecords: React.FC<ProviderPatientRecordsProps> = ({
  currentProvider,
  onAccessDocument,
  onOpenEhrViewer,
  onRequestAccess,
}) => {
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [workflows, setWorkflows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSource, setSelectedSource] = React.useState('ALL');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, permsRes, wfsRes] = await Promise.all([
        ApiClient.getDocuments({ pageSize: 50 }),
        ApiClient.getPermissions(),
        ApiClient.getExternalSharingWorkflows(),
      ]);
      setDocuments(docsRes.items || []);
      setPermissions(permsRes || []);
      setWorkflows(wfsRes || []);
    } catch (err: any) {
      console.error('Error fetching provider patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    if (selectedSource !== 'ALL' && doc.sourceType !== selectedSource) return false;
    if (selectedCategory !== 'ALL' && doc.documentType !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchIssuer = doc.issuerName.toLowerCase().includes(q);
      const matchCode = doc.metadata?.diagnosticCode?.toLowerCase().includes(q);
      if (!matchTitle && !matchIssuer && !matchCode) return false;
    }
    return true;
  });

  // Category counts
  const labDocsCount = documents.filter((d) => d.documentType === 'LAB_REPORT').length;
  const imagingDocsCount = documents.filter((d) => d.documentType === 'IMAGING_REPORT').length;
  const rxDocsCount = documents.filter((d) => d.documentType === 'PRESCRIPTION').length;
  const dischargeDocsCount = documents.filter((d) => d.documentType === 'DISCHARGE_SUMMARY').length;

  // Check if current provider has an active grant for a platform document
  const hasActiveGrant = (docId: string) => {
    return permissions.some(
      (p) =>
        p.status === 'ACTIVE' &&
        p.documents?.some((d: any) => d.id === docId)
    );
  };

  // Check if current provider has a confirmed external workflow
  const getExternalWf = (docId: string) => {
    return workflows.find((w) => w.documentId === docId);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Patient Clinical Record Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase tracking-wide">
              Patient Record Access
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 font-medium">UHID: PAT-1-P-SHARMA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Priya Sharma — Clinical Records Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Age: 34 Y · Female · Blood Group: B+ · Accessing as Dr. {currentProvider?.displayName}
          </p>
        </div>

        <button
          onClick={() => onRequestAccess('')}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request New Record Access</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient's records by title, diagnostic code, or facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          {[
            { id: 'ALL', label: 'All Records', count: documents.length },
            { id: 'LAB_REPORT', label: 'Lab Reports', count: labDocsCount },
            { id: 'IMAGING_REPORT', label: 'Images & Scans', count: imagingDocsCount },
            { id: 'PRESCRIPTION', label: 'Prescriptions', count: rxDocsCount },
            { id: 'DISCHARGE_SUMMARY', label: 'Discharge Summaries', count: dischargeDocsCount },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer inline-flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Source:
          </span>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'ALL', label: 'All Records' },
              { id: 'UPLOAD', label: 'Platform Vault (Uploads)' },
              { id: 'HOSPITAL', label: 'Hospital EHR' },
              { id: 'DIGILOCKER', label: 'DigiLocker' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSource(s.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedSource === s.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {(selectedCategory !== 'ALL' || selectedSource !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedSource('ALL');
                setSearchQuery('');
              }}
              className="ml-auto text-xs text-teal-700 hover:text-teal-900 font-semibold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading patient records...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No medical records match query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Record Type</th>
                  <th className="py-3 px-4">Source & Storage</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Your Access Status</th>
                  <th className="py-3 px-4 text-right">Clinical Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const isPlatform = doc.storageLocation === 'PLATFORM';
                  const isApproved = isPlatform && hasActiveGrant(doc.id);
                  const extWf = getExternalWf(doc.id);
                  const isExtConfirmed = extWf?.status === 'CONFIRMED';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td
                        onClick={() => (isPlatform ? onAccessDocument(doc.id) : onOpenEhrViewer(doc))}
                        className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate cursor-pointer group"
                      >
                        <div className="group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                          <span>{doc.title}</span>
                          <span className="text-[10px] text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            (Open Document)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal truncate">
                          {doc.issuerName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 capitalize text-slate-700">
                        {doc.documentType?.toLowerCase().replace('_', ' ')}
                      </td>

                      <td className="py-3.5 px-4">
                        <SourceBadge
                          sourceType={doc.sourceType}
                          storageLocation={doc.storageLocation}
                        />
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {doc.recordDate}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPlatform ? (
                          isApproved ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Consent Granted</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                              <ShieldCheck className="w-3 h-3 text-teal-600" />
                              <span>Clinical Consultation Ready</span>
                            </span>
                          )
                        ) : isExtConfirmed ? (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                            doc.sourceType === 'DIGILOCKER'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            <CheckCircle2 className={`w-3 h-3 ${doc.sourceType === 'DIGILOCKER' ? 'text-sky-600' : 'text-indigo-600'}`} />
                            <span>{doc.sourceType === 'DIGILOCKER' ? 'DigiLocker Verified' : 'EHR Release Confirmed'}</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                            doc.sourceType === 'DIGILOCKER'
                              ? 'bg-sky-50/70 text-sky-800 border-sky-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {doc.sourceType === 'DIGILOCKER' ? (
                              <Database className="w-3 h-3 text-sky-600" />
                            ) : (
                              <Building2 className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{doc.sourceType === 'DIGILOCKER' ? 'DigiLocker National Vault' : 'Hospital EHR Hosted'}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isPlatform ? (
                          <button
                            onClick={() => onAccessDocument(doc.id)}
                            className="px-3 py-1.5 rounded font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs bg-teal-700 hover:bg-teal-800 text-white"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Access Document Itself</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            {doc.metadata?.externalPortalUrl && (
                              <a
                                href={doc.metadata.externalPortalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`px-2 py-1 bg-white hover:bg-slate-50 border rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors ${
                                  doc.sourceType === 'DIGILOCKER'
                                    ? 'text-sky-700 border-sky-200'
                                    : 'text-indigo-700 border-indigo-200'
                                }`}
                                title={doc.sourceType === 'DIGILOCKER' ? "Open Direct DigiLocker Link" : "Open Direct Hospital EHR Portal Link"}
                              >
                                <ExternalLink className={`w-3 h-3 ${doc.sourceType === 'DIGILOCKER' ? 'text-sky-600' : 'text-indigo-600'}`} />
                                <span>{doc.sourceType === 'DIGILOCKER' ? 'DigiLocker ↗' : 'Portal Link ↗'}</span>
                              </a>
                            )}
                            <button
                              onClick={() => onOpenEhrViewer(doc)}
                              className={`px-3 py-1.5 border rounded font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                                doc.sourceType === 'DIGILOCKER'
                                  ? 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-200'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                              }`}
                            >
                              <ExternalLink className={`w-3.5 h-3.5 ${doc.sourceType === 'DIGILOCKER' ? 'text-sky-600' : 'text-indigo-600'}`} />
                              <span>{doc.sourceType === 'DIGILOCKER' ? 'Access Document (DigiLocker)' : 'Access Document Itself (EHR Viewer)'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
