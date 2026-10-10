import React from 'react';
import {
  Search,
  Filter,
  Plus,
  Link2,
  ExternalLink,
  Eye,
  Trash2,
  ChevronRight,
  Database,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { SourceBadge } from '../components/SourceBadge.js';
import { ApiClient } from '../services/api.js';

interface PatientCatalogueProps {
  onOpenAddRecord: () => void;
  onOpenConnectSource: () => void;
  onSelectDoc: (doc: any) => void;
  onOpenEhrViewer: (doc: any) => void;
}

export const PatientCatalogue: React.FC<PatientCatalogueProps> = ({
  onOpenAddRecord,
  onOpenConnectSource,
  onSelectDoc,
  onOpenEhrViewer,
}) => {
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSource, setSelectedSource] = React.useState('ALL');
  const [selectedType, setSelectedType] = React.useState('ALL');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getDocuments({
        sourceType: selectedSource,
        documentType: selectedType,
        searchQuery,
      });
      setDocuments(res.items || []);
    } catch (err: any) {
      console.error('Error fetching catalogue:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDocuments();
  }, [selectedSource, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Medical Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            One organised view of your records, wherever they are stored.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenConnectSource}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Link2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Connect Source</span>
          </button>

          <button
            onClick={onOpenAddRecord}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medical Record</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by document title, lab name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Segmented Controls / Interactive Filters (Button groups as allowed by design constitution) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Source:
          </span>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'ALL', label: 'All Sources' },
              { id: 'DIGILOCKER', label: 'DigiLocker' },
              { id: 'HOSPITAL', label: 'Hospital EHR' },
              { id: 'UPLOAD', label: 'Platform Uploads' },
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

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Category:
          </span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border-0 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="LAB_REPORT">Laboratory Reports</option>
            <option value="IMAGING_REPORT">Imaging & Scans</option>
            <option value="PRESCRIPTION">Prescriptions</option>
            <option value="DISCHARGE_SUMMARY">Discharge Summaries</option>
            <option value="VACCINATION_RECORD">Vaccination Records</option>
            <option value="CLINICAL_NOTE">Clinical Notes</option>
          </select>
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading unified medical records catalogue...
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">No matching medical records found.</p>
            <p className="text-[11px] text-slate-400">
              Try adjusting your search query or link a record from DigiLocker or a Hospital.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Record Type</th>
                  <th className="py-3 px-4">Original Source</th>
                  <th className="py-3 px-4">Record Date</th>
                  <th className="py-3 px-4">Storage Location</th>
                  <th className="py-3 px-4">Sharing Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => onSelectDoc(doc)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      <div>{doc.title}</div>
                      <div className="text-[11px] text-slate-400 font-normal truncate">
                        {doc.issuerName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize text-slate-700">
                        {doc.documentType.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <SourceBadge
                        sourceType={doc.sourceType}
                        storageLocation={doc.storageLocation}
                      />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {doc.recordDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-medium ${
                          doc.storageLocation === 'PLATFORM'
                            ? 'text-teal-800'
                            : 'text-slate-600'
                        }`}
                      >
                        {doc.storageLocation === 'PLATFORM'
                          ? 'Continuum Vault'
                          : 'External Provider'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {doc.sharingStatus === 'SHARED' ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Shared ({doc.activeRecipientName || 'Active'})</span>
                        </div>
                      ) : doc.sharingStatus === 'EXTERNAL_PENDING' ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Awaiting Source</span>
                        </div>
                      ) : doc.sharingStatus === 'REVOKED' ? (
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Revoked</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Private</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {(doc.sourceType === 'HOSPITAL' ||
                        doc.sourceType === 'LABORATORY' ||
                        doc.sourceType === 'DIGILOCKER' ||
                        doc.metadata?.externalPortalUrl) && (
                        <div className="inline-flex items-center gap-1 mr-1.5">
                          {doc.metadata?.externalPortalUrl && (
                            <a
                              href={doc.metadata.externalPortalUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`px-2 py-1 bg-white hover:bg-slate-50 font-semibold rounded text-[11px] transition-colors inline-flex items-center gap-1 shadow-2xs ${
                                doc.sourceType === 'DIGILOCKER'
                                  ? 'text-sky-700 border border-sky-200'
                                  : 'text-indigo-700 border border-indigo-200'
                              }`}
                              title={doc.sourceType === 'DIGILOCKER' ? "Direct Link to DigiLocker Document" : "Direct Link to Hospital EHR Portal / Viewer Page"}
                            >
                              <ExternalLink className={`w-3 h-3 ${doc.sourceType === 'DIGILOCKER' ? 'text-sky-600' : 'text-indigo-600'}`} />
                              <span>{doc.sourceType === 'DIGILOCKER' ? 'DigiLocker ↗' : 'EHR Link ↗'}</span>
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEhrViewer(doc);
                            }}
                            className={`px-2.5 py-1 font-semibold rounded text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs ${
                              doc.sourceType === 'DIGILOCKER'
                                ? 'bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                            }`}
                            title={doc.sourceType === 'DIGILOCKER' ? "Open in DigiLocker" : "Launch Interactive EHR Portal / Viewer Page"}
                          >
                            <ExternalLink className={`w-3 h-3 ${doc.sourceType === 'DIGILOCKER' ? 'text-sky-600' : 'text-indigo-600'}`} />
                            <span>{doc.sourceType === 'DIGILOCKER' ? 'DigiLocker' : 'EHR Viewer'}</span>
                          </button>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDoc(doc);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
