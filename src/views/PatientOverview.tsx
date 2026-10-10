import React from 'react';
import {
  FileText,
  Link2,
  Share2,
  ShieldCheck,
  Plus,
  ArrowRight,
  Database,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { SourceBadge } from '../components/SourceBadge.js';

interface PatientOverviewProps {
  dashboardData: any;
  onOpenAddRecord: () => void;
  onOpenConnectSource: () => void;
  onNavigateToTab: (tab: string) => void;
  onSelectDoc: (doc: any) => void;
  onOpenEhrViewer?: (doc: any) => void;
}

export const PatientOverview: React.FC<PatientOverviewProps> = ({
  dashboardData,
  onOpenAddRecord,
  onOpenConnectSource,
  onNavigateToTab,
  onSelectDoc,
  onOpenEhrViewer,
}) => {
  const metrics = dashboardData?.metrics || {
    totalRecords: 6,
    platformUploadsCount: 2,
    externalReferencesCount: 4,
    connectedSources: 3,
    pendingRequests: 1,
    activeShares: 2,
  };

  const recentDocs = dashboardData?.recentDocs || [];
  const recentActivities = dashboardData?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Good morning, {dashboardData?.patient?.displayName || 'Priya Sharma'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your medical records, organised across the places that care for you.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenConnectSource}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Link2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Connect a Source</span>
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

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Records */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Records
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {metrics.totalRecords}
            </span>
            <span className="text-xs text-slate-500 font-medium">in catalogue</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>{metrics.externalReferencesCount} External refs</span>
            <span>·</span>
            <span>{metrics.platformUploadsCount} Vault uploads</span>
          </div>
        </div>

        {/* Card 2: Connected Sources */}
        <div
          onClick={() => onNavigateToTab('sources')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Connected Sources
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {metrics.connectedSources}
            </span>
            <span className="text-xs text-slate-500 font-medium">ecosystems linked</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            DigiLocker & 2 Connected Hospitals
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div
          onClick={() => onNavigateToTab('requests')}
          className={`p-5 rounded-xl border shadow-2xs transition-colors cursor-pointer ${
            metrics.pendingRequests > 0
              ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-950 tracking-tight">
              {metrics.pendingRequests}
            </span>
            <span className="text-xs text-amber-800 font-medium">action required</span>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 font-medium flex items-center justify-between">
            <span>Review doctor requests</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 4: Active Shares */}
        <div
          onClick={() => onNavigateToTab('permissions')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Shares
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {metrics.activeShares}
            </span>
            <span className="text-xs text-slate-500 font-medium">active permissions</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            {metrics.activePlatformGrants || 1} Vault grant · {metrics.confirmedExternalShares || 1} External confirmed
          </div>
        </div>
      </div>

      {/* Grid: Recent Medical Records & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Medical Records (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Recent Medical Records
              </h2>
              <p className="text-xs text-slate-500">
                Combined view of external references and platform uploads
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('records')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentDocs.map((doc: any) => (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className="py-3 sm:py-3.5 flex items-center justify-between hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {doc.title}
                    </span>
                    <SourceBadge
                      sourceType={doc.sourceType}
                      storageLocation={doc.storageLocation}
                      compact
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{doc.issuerName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.recordDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{doc.documentType.toLowerCase().replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
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

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      doc.sharingStatus === 'SHARED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : doc.sharingStatus === 'EXTERNAL_PENDING'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {doc.sharingStatus === 'SHARED'
                      ? 'Shared'
                      : doc.sharingStatus === 'EXTERNAL_PENDING'
                      ? 'Pending Source'
                      : 'Private'}
                  </span>
                  <button className="p-1 text-slate-400 hover:text-teal-700 rounded transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Audit Trail Activity
              </h2>
              <p className="text-xs text-slate-500">Read-only event log</p>
            </div>
            <button
              onClick={() => onNavigateToTab('audit')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {recentActivities.slice(0, 5).map((act: any) => (
              <div key={act.id} className="text-xs flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 leading-snug">
                    {act.eventType === 'DOCUMENT_UPLOADED'
                      ? `You uploaded ${act.documentTitle || 'medical record'}`
                      : act.eventType === 'ACCESS_REQUEST_CREATED'
                      ? `${act.actorName} requested access`
                      : act.eventType === 'RECORD_LINKED'
                      ? `Linked ${act.documentTitle || 'record'} reference`
                      : act.eventType === 'PLATFORM_GRANT_CREATED'
                      ? `Granted access to ${act.safeMetadata?.grantee || 'provider'}`
                      : act.eventType === 'DOCUMENT_VIEWED'
                      ? `${act.actorName} viewed ${act.documentTitle || 'record'}`
                      : act.eventType === 'SOURCE_CONNECTED'
                      ? `Connected ${act.safeMetadata?.sourceName || 'external source'}`
                      : `${act.eventType.replace('_', ' ')} recorded`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(act.occurredAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
