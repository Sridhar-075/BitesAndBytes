import React from 'react';
import {
  ShieldAlert,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface HeaderProps {
  currentUser: {
    id: string;
    email: string;
    displayName: string;
    role: string;
  } | null;
  availableAccounts: Array<{
    id: string;
    email: string;
    displayName: string;
    role: string;
  }>;
  onSwitchUser: (userId: string) => void;
  onOpenSecurityTests: () => void;
  onResetDemo: () => void;
  pendingRequestsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  availableAccounts,
  onSwitchUser,
  onOpenSecurityTests,
  onResetDemo,
  pendingRequestsCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
              <HeartPulse className="w-6 h-6 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Continuum Health
                </span>
                <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 hidden md:inline">
                  Patient-Controlled Consent Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Unified catalogue · Zero external document duplication
              </p>
            </div>
          </div>

          {/* Action Tools & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Security Tests Trigger */}
            <button
              onClick={onOpenSecurityTests}
              title="Run live automated verification of the 8 mandatory security rules"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-teal-700" />
              <span className="hidden sm:inline">Security Tests</span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-teal-800 bg-white rounded-full border border-teal-200">
                8/8
              </span>
            </button>

            {/* Reset Demo State Button */}
            <button
              onClick={onResetDemo}
              title="Reset sample patient records, access requests, and workflows to seed state"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg transition-colors border border-slate-200/80 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-slate-900 leading-tight">
                    {currentUser?.displayName || 'Select User'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Role: {currentUser?.role}
                  </div>
                </div>
                <span className="md:hidden text-xs font-semibold">
                  {currentUser?.role === 'PATIENT' ? 'Patient' : currentUser?.role === 'PROVIDER' ? 'Doctor' : 'Admin'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                      <div className="font-semibold text-slate-800">Switch Demo Persona</div>
                      <p className="text-[11px] text-slate-500">
                        Experience the platform from each stakeholder's perspective
                      </p>
                    </div>

                    <div className="py-1">
                      {availableAccounts.map((acc) => {
                        const isCurrent = acc.id === currentUser?.id;
                        return (
                          <button
                            key={acc.id}
                            onClick={() => {
                              onSwitchUser(acc.id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                              isCurrent ? 'bg-teal-50/70 text-teal-900 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="font-medium text-slate-900">
                                {acc.displayName}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {acc.role === 'PATIENT'
                                  ? 'Patient · Priya Sharma'
                                  : acc.role === 'PROVIDER'
                                  ? acc.email.includes('sunrise')
                                    ? 'Sunrise Hospital · Endocrinologist'
                                    : acc.email.includes('greenvalley')
                                    ? 'Green Valley Clinic · Diabetologist'
                                    : 'City Diagnostics · Radiologist'
                                  : 'System Auditor · Trust & Compliance'}
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-teal-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
