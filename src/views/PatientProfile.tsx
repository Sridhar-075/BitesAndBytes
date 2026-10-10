import React from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  MapPin,
  Heart,
  FileCheck2,
} from 'lucide-react';

interface PatientProfileProps {
  patient: any;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({ patient }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Patient Profile & Data Sovereignty
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your personal records identifiers, emergency contact, and privacy guarantees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div className="text-center pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-800 border-2 border-teal-200 flex items-center justify-center font-bold text-xl mx-auto mb-2">
              PS
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {patient?.displayName || 'Priya Sharma'}
            </h2>
            <p className="text-slate-500 text-[11px]">Bengaluru, Karnataka, India</p>
          </div>

          <div className="space-y-3 text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Date of Birth:</span>
              <span className="font-semibold text-slate-800">14 May 1992 (34y)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Gender:</span>
              <span className="font-semibold text-slate-800">Female</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Blood Group:</span>
              <span className="font-semibold text-teal-800">B+ Positive</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Contact Number:</span>
              <span className="font-semibold text-slate-800">+91 98765 43210</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Emergency Contact:</span>
              <span className="font-semibold text-slate-800">Rajesh Sharma (Spouse)</span>
            </div>
          </div>
        </div>

        {/* Data Sovereignty & Architecture Guarantees (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Continuum Health Architecture Guarantees</span>
            </h3>

            <div className="space-y-3 pt-2 text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="font-bold text-slate-900 mb-1">
                  1. Zero Centralised External Duplication
                </div>
                <p className="text-[11px]">
                  Records from DigiLocker and hospital EHR systems remain strictly at their source.
                  Continuum Health does not retrieve, proxy, download, or index external files.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="font-bold text-slate-900 mb-1">
                  2. Patient-Controlled Document-Granular Grants
                </div>
                <p className="text-[11px]">
                  When a doctor requests 3 records, you can approve 1 and deny 2. No blanket access
                  is ever assumed, even if you are an ongoing patient at their hospital.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="font-bold text-slate-900 mb-1">
                  3. Instant Revocation Without Caching Delays
                </div>
                <p className="text-[11px]">
                  Revoking a grant immediately updates the permission decision engine. The doctor's
                  next click is rejected with an audited 403 Access Denied.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
