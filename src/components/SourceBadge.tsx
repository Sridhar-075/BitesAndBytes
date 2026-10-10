import React from 'react';
import { Database, Building2, ShieldCheck } from 'lucide-react';

interface SourceBadgeProps {
  sourceType: 'DIGILOCKER' | 'HOSPITAL' | 'LABORATORY' | 'UPLOAD' | 'OTHER';
  storageLocation: 'EXTERNAL' | 'PLATFORM';
  compact?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  sourceType,
  storageLocation,
  compact = false,
}) => {
  if (sourceType === 'DIGILOCKER') {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-sky-800">
        <Database className="w-3.5 h-3.5 text-sky-600 shrink-0" />
        <span className="font-medium">DigiLocker</span>
        {!compact && (
          <span className="text-slate-400 font-normal hidden sm:inline">
            · Stored at source
          </span>
        )}
      </div>
    );
  }

  if (sourceType === 'HOSPITAL' || sourceType === 'LABORATORY') {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-indigo-900">
        <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="font-medium">
          {sourceType === 'LABORATORY' ? 'Diagnostic Lab EHR' : 'Hospital EHR'}
        </span>
        {!compact && (
          <span className="text-slate-400 font-normal hidden sm:inline">
            · Stored with provider
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-teal-900">
      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
      <span className="font-medium">Platform Upload</span>
      {!compact && (
        <span className="text-slate-400 font-normal hidden sm:inline">
          · Stored securely in vault
        </span>
      )}
    </div>
  );
};
