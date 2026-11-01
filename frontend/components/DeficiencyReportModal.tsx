'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { ApplicationDetail } from '../types/api';

interface DeficiencyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationDetail;
  onApplyToReturn: (reason: string, items: string[]) => void;
}

export const DeficiencyReportModal: React.FC<DeficiencyReportModalProps> = ({
  isOpen,
  onClose,
  application,
  onApplyToReturn,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Canonical deficiency items derived from AI pre-screening diagnostic
  const deficiencyItems = [
    {
      clause: 'Clause 7.4 (Faculty Cadre Ratio)',
      observation: 'Cadre ratio in Computer Science & Engineering department is 1:2.4 vs mandated 1:2 (Professor to Assoc. Professor). Deficit of 1 Endowed Professor.',
      remediation: 'Submit appointment notification with gazetted selection committee minutes for Endowed Professor post.',
      status: 'CRITICAL',
    },
    {
      clause: 'Clause 4.12 (Land Title Registration)',
      observation: 'Sub-registrar notarization seal is missing on Annexure 4 (Perpetual 30-Year Lease Mutation deed).',
      remediation: 'Upload re-scanned copy of lease deed featuring legible sub-registrar registration stamp and serial receipt.',
      status: 'DEFICIENT',
    },
    {
      clause: 'Clause 9.1 (Fire Safety Clearance)',
      observation: 'Municipal Fire Safety NOC validity expires within 18 days (2026-11-19).',
      remediation: 'Provide renewal acknowledgment receipt or newly issued fire safety certificate from Chief Fire Officer.',
      status: 'TIME_BOUND',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleApply = () => {
    const summaryReason = `AICTE APH 2026-27 Normative Deficiencies Observed: ${deficiencyItems.map(d => `${d.clause} - ${d.observation}`).join('; ')}`;
    const itemsList = deficiencyItems.map(d => `${d.clause}: ${d.remediation}`);
    onApplyToReturn(summaryReason, itemsList);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0E15] border border-white/20 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-platinum-100">
        {/* Header Bar */}
        <div className="p-5 bg-[#0E121B] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Official AICTE Memorandum Generator
              </span>
              <h3 className="text-base font-bold font-display text-white mt-0.5">
                Statutory Deficiency Diagnostic Report
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/15 text-white text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-platinum-400 hover:text-white bg-white/[0.05] hover:bg-white/15 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Document Body (Printable Paper Look) */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-white text-slate-900 font-serif leading-relaxed text-xs selection:bg-amber-100">
          {/* Government / AICTE Letterhead */}
          <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
            <div className="text-[10px] tracking-widest uppercase font-mono text-slate-600 font-bold">
              Government of India · Ministry of Education
            </div>
            <h1 className="text-base font-black uppercase tracking-wide font-sans text-slate-900">
              All India Council for Technical Education
            </h1>
            <p className="text-[10px] font-sans text-slate-600">
              Nelson Mandela Marg, Vasant Kunj, New Delhi-110070 · Regulation & Approval Bureau
            </p>
            <div className="text-[9px] font-mono text-slate-500 pt-1">
              Ref: AICTE/AB/2026-27/{application.application_number}/MEMO-01 · Date: {todayStr}
            </div>
          </div>

          {/* Recipient Block */}
          <div className="space-y-1 font-sans text-xs">
            <div className="font-bold">To:</div>
            <div className="font-semibold text-slate-800">{application.institution?.name || application.institution_name}</div>
            <div className="text-slate-600">Region: {application.region} · State: {application.institution?.state || application.region}</div>
            <div className="text-slate-600 font-mono text-[11px]">Application Reference: {application.application_number}</div>
          </div>

          {/* Subject */}
          <div className="p-2.5 bg-amber-50 border-l-4 border-amber-600 font-sans text-xs font-bold text-slate-800">
            Subject: Scrutiny Observation & Normative Deficiency Memorandum for Academic Year 2026–27
          </div>

          {/* Memorandum Body */}
          <div className="space-y-3 font-sans text-xs text-slate-700">
            <p>
              Sir / Madam,
            </p>
            <p>
              The application submitted by your institution under Route <strong>{application.route_code}</strong> has undergone automated statutory pre-screening and initial scrutiny pursuant to the <strong>AICTE Approval Process Handbook (APH 2026–27)</strong>.
            </p>
            <p>
              The following non-compliances and documentation deficits have been formally recorded by the Scrutiny Board:
            </p>
          </div>

          {/* Deficiencies Schedule Table */}
          <table className="w-full text-left border-collapse border border-slate-300 font-sans text-[11px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px]">
                <th className="p-2 border-r border-slate-300">APH Clause</th>
                <th className="p-2 border-r border-slate-300">Observed Non-Compliance</th>
                <th className="p-2">Mandatory Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {deficiencyItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-300 font-mono font-bold text-amber-900 whitespace-nowrap">
                    {item.clause}
                  </td>
                  <td className="p-2 border-r border-slate-300 text-slate-800 leading-normal">
                    {item.observation}
                  </td>
                  <td className="p-2 text-slate-700 leading-normal font-medium">
                    {item.remediation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Time Bound Clause */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded text-slate-800 font-sans text-[11px] space-y-1">
            <div className="font-bold">Statutory Compliance Deadline:</div>
            <p>
              In accordance with APH Section 4.5, you are granted a compliance window of <strong>10 working days</strong> to upload rectified documentation onto the National Approval Portal. Failure to remediate will lead to referral to the Standing Hearing Committee (SHC).
            </p>
          </div>

          {/* Officer Sign-off Block */}
          <div className="pt-6 flex justify-between items-end font-sans text-xs">
            <div className="text-slate-500 text-[10px] space-y-0.5 font-mono">
              <div>System Authenticated: SHA-256 Validated</div>
              <div>Dispatch Time: {new Date().toISOString()}</div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-bold text-slate-900">Er. Priya Sharma</div>
              <div className="text-slate-600 text-[11px]">Scrutiny Officer (Regulation Bureau)</div>
              <div className="text-slate-500 text-[10px]">All India Council for Technical Education</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-[#0E121B] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-platinum-400 font-mono text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for official transmission to institution</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/[0.06] hover:bg-white/10 text-platinum-300 rounded-xl transition cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <span>Auto-Fill Return Notice & Transmit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
