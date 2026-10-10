import React from 'react';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
} from 'lucide-react';
import { ApiClient } from '../services/api.js';

export const PatientAudit: React.FC = () => {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterType, setFilterType] = React.useState('ALL');

  React.useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      try {
        const data = await ApiClient.getAuditEvents();
        setEvents(data || []);
      } catch (err: any) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ACCESS') return e.eventType.includes('VIEW') || e.eventType.includes('DENIED');
    if (filterType === 'CONSENT') return e.eventType.includes('REQUEST') || e.eventType.includes('GRANT') || e.eventType.includes('REVOKE');
    if (filterType === 'SOURCE') return e.eventType.includes('SOURCE') || e.eventType.includes('LINK') || e.eventType.includes('UPLOAD');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Activity & Audit History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Immutable, read-only log of every security, consent, link, upload, and document access event.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Filter Event Domain:
        </span>
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'ACCESS', label: 'Access & Views' },
            { id: 'CONSENT', label: 'Consent Decisions' },
            { id: 'SOURCE', label: 'Sources & Uploads' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading audit trail...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No events found matching filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Target Record / Subject</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Correlation ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {new Date(event.occurredAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{event.actorName}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        Role: {event.actorRole.toLowerCase()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-medium text-slate-800">
                        {event.eventType}
                      </span>
                      {event.reasonCode && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Code: {event.reasonCode}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-700">
                      {event.documentTitle ? (
                        <div>
                          <span className="font-medium">{event.documentTitle}</span>
                          {event.sourceType && (
                            <span className="text-[10px] text-slate-400 ml-1.5">
                              ({event.sourceType})
                            </span>
                          )}
                        </div>
                      ) : event.safeMetadata?.purpose ? (
                        <span className="text-slate-600">{event.safeMetadata.purpose}</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Platform Core Event</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          event.outcome === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : event.outcome === 'PENDING'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {event.outcome === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {event.outcome === 'DENIED' && <XCircle className="w-3 h-3 text-rose-600" />}
                        <span>{event.outcome}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[10px] font-mono text-slate-400">
                      {event.correlationId}
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
