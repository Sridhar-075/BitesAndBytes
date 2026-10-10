import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Link2,
  Share2,
  KeyRound,
  History,
  Clock,
  User,
  Stethoscope,
  FileCheck2,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';

export type PatientTab =
  | 'overview'
  | 'records'
  | 'sources'
  | 'requests'
  | 'permissions'
  | 'timeline'
  | 'audit'
  | 'profile';

export type ProviderTab =
  | 'provider-dashboard'
  | 'provider-records'
  | 'provider-requests'
  | 'provider-approved'
  | 'provider-external'
  | 'provider-audit';

export type AdminTab = 'admin-overview' | 'admin-audit';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarProps {
  userRole: 'PATIENT' | 'PROVIDER' | 'ORGANISATION_ADMIN' | 'PLATFORM_ADMIN';
  activeTab: string;
  onSelectTab: (tab: any) => void;
  pendingRequestsCount?: number;
  userName?: string;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  activeTab,
  onSelectTab,
  pendingRequestsCount = 0,
  userName,
  userEmail,
}) => {
  const patientNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'records', label: 'My Medical Records', icon: FolderOpen },
    { id: 'sources', label: 'Connected Sources', icon: Link2 },
    {
      id: 'requests',
      label: 'Sharing Requests',
      icon: Share2,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    { id: 'permissions', label: 'Access & Permissions', icon: KeyRound },
    { id: 'timeline', label: 'Health Timeline', icon: Clock },
    { id: 'audit', label: 'Activity & Audit History', icon: History },
    { id: 'profile', label: 'Profile & Security', icon: User },
  ];

  const providerNavItems: NavItem[] = [
    { id: 'provider-dashboard', label: 'Provider Dashboard', icon: LayoutDashboard },
    { id: 'provider-records', label: 'Patient Medical Records', icon: FolderOpen },
    { id: 'provider-requests', label: 'Patient Access Requests', icon: Share2 },
    { id: 'provider-approved', label: 'Approved Platform Docs', icon: FileCheck2 },
    { id: 'provider-external', label: 'External Sharing Status', icon: ExternalLink },
    { id: 'provider-audit', label: 'Provider Access History', icon: History },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin-overview', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'admin-audit', label: 'System Compliance Logs', icon: History },
  ];

  const items: NavItem[] =
    userRole === 'PATIENT'
      ? patientNavItems
      : userRole === 'PROVIDER'
      ? providerNavItems
      : adminNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {userRole === 'PATIENT'
            ? 'Patient Management'
            : userRole === 'PROVIDER'
            ? 'Clinical Portal'
            : 'Administration'}
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-teal-50 text-teal-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-teal-700' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User info at bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
            {userName ? userName.charAt(0) : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-900 truncate">
              {userName || 'User'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {userEmail || ''}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
