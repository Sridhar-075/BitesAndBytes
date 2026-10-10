import React from 'react';
import {
  Clock,
  Filter,
  Calendar,
  Building2,
  Database,
  ShieldCheck,
  Eye,
  Info,
  ExternalLink,
} from 'lucide-react';
import { SourceBadge } from '../components/SourceBadge.js';
import { ApiClient } from '../services/api.js';

interface PatientTimelineProps {
  onSelectDoc: (doc: any) => void;
  onOpenEhrViewer?: (doc: any) => void;
}

export const PatientTimeline: React.FC<PatientTimelineProps> = ({ onSelectDoc, onOpenEhrViewer }) => {
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedSource, setSelectedSource] = React.useState('ALL');

  React.useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await ApiClient.getDocuments({
          sourceType: selectedSource,
          pageSize: 50,
        });
        setDocuments(res.items || []);
      } catch (err: any) {
        console.error('Error fetching timeline:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [selectedSource]);

  // Group by Year
  const groupedByYear: Record<string, any[]> = {};
  documents.forEach((doc) => {
    const year = doc.recordDate ? doc.recordDate.substring(0, 4) : '2026';
    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }
    groupedByYear[year].push(doc);
  });

  const years = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Longitudinal Health Timeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Chronological catalogue of medical records spanning DigiLocker, connected hospital EHRs, and private uploads.
        </p>
      </div>

      {/* Domain notice */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Catalogue Index Notice: </strong>
          This timeline catalogues the chronological occurrence of medical events and documents across your
          care network. It does not imply that external documents have been centralized, downloaded, or
          clinically reconciled.
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Filter Source:
        </span>
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'ALL', label: 'All Sources' },
            { id: 'DIGILOCKER', label: 'DigiLocker' },
            { id: 'HOSPITAL', label: 'Hospital EHR' },
            { id: 'UPLOAD', label: 'Platform Upload' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSource(s.id)}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                selectedSource === s.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading timeline...</div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500">
          No records match the current filter.
        </div>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year} className="space-y-4">
              <div className="inline-block px-3 py-1 bg-slate-200 text-slate-800 font-bold text-xs rounded-full">
                {year}
              </div>

              <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-4">
                {groupedByYear[year].map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDoc(doc)}
                    className="relative bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer group"
                  >
                    {/* Timeline Node Bullet */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-4.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-teal-600 group-hover:scale-125 transition-transform" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {doc.title}
                        </span>
                        <SourceBadge
                          sourceType={doc.sourceType}
                          storageLocation={doc.storageLocation}
                          compact
                        />
                      </div>

                      <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.recordDate}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Provider: {doc.issuerName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{doc.documentType.toLowerCase().replace('_', ' ')}</span>
                      {doc.sourceDocumentReference && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[10px] text-slate-400">
                            Ref: {doc.sourceDocumentReference}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        {doc.storageLocation === 'PLATFORM'
                          ? 'Stored securely in private vault'
                          : 'Remains at original provider / locker source'}
                      </span>
                      <div className="flex items-center gap-2">
                        {(doc.sourceType === 'HOSPITAL' ||
                          doc.sourceType === 'LABORATORY' ||
                          doc.sourceType === 'DIGILOCKER' ||
                          doc.metadata?.externalPortalUrl) && (
                          <div className="flex items-center gap-1">
                            {doc.metadata?.externalPortalUrl && (
                              <a
                                href={doc.metadata.externalPortalUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`px-1.5 py-0.5 bg-white hover:bg-slate-50 border rounded text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                                  doc.sourceType === 'DIGILOCKER'
                                    ? 'text-sky-700 border-sky-200'
                                    : 'text-indigo-700 border-indigo-200'
                                }`}
                                title={doc.sourceType === 'DIGILOCKER' ? "Direct Link to DigiLocker Document" : "Direct Link to Hospital EHR Portal / Viewer Page"}
                              >
                                <ExternalLink className={`w-2.5 h-2.5 ${doc.sourceType === 'DIGILOCKER' ? 'text-sky-600' : 'text-indigo-600'}`} />
                                <span>{doc.sourceType === 'DIGILOCKER' ? 'DigiLocker ↗' : 'Link ↗'}</span>
                              </a>
                            )}
                            {onOpenEhrViewer && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenEhrViewer(doc);
                                }}
                                className={`px-2 py-0.5 border rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                  doc.sourceType === 'DIGILOCKER'
                                    ? 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-200'
                                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                                }`}
                                title={doc.sourceType === 'DIGILOCKER' ? "Open in DigiLocker" : "Open EHR Portal / Viewer Page"}
                              >
                                <ExternalLink className={`w-3 h-3 ${doc.sourceType === 'DIGILOCKER' ? 'text-sky-600' : 'text-indigo-600'}`} />
                                <span>{doc.sourceType === 'DIGILOCKER' ? 'DigiLocker' : 'EHR Portal'}</span>
                              </button>
                            )}
                          </div>
                        )}
                        <button className="text-teal-700 font-semibold text-[11px] hover:text-teal-800 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Inspect Reference</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
