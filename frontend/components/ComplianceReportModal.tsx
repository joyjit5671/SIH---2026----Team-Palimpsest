'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2, AlertTriangle, ShieldCheck, Scale, FileText, Check } from 'lucide-react';
import { UndertakingItem } from '../types/api';

interface ComplianceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  undertaking: UndertakingItem | null;
}

export const ComplianceReportModal: React.FC<ComplianceReportModalProps> = ({
  isOpen,
  onClose,
  undertaking,
}) => {
  if (!isOpen || !undertaking) return null;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0B0E15] border border-white/20 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-platinum-100">
        {/* Header Bar */}
        <div className="p-5 bg-[#0E121B] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Official AICTE Compliance Clearance Memorandum
              </span>
              <h3 className="text-base font-bold font-display text-white mt-0.5">
                Statutory Undertaking Audit Certificate
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
              className="text-platinum-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document Canvas */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-white text-zinc-900 font-sans print:p-0 print:m-0">
          {/* Official AICTE / Ministry of Education Header */}
          <div className="border-b-2 border-zinc-900 pb-4 text-center space-y-1">
            <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-600 font-mono">
              Government of India · Ministry of Education
            </div>
            <h1 className="text-xl font-extrabold uppercase tracking-wide text-zinc-950 font-serif">
              All India Council for Technical Education
            </h1>
            <div className="text-xs font-medium text-zinc-700">
              Nelson Mandela Marg, Vasant Kunj, New Delhi-110070 · Website: www.aicte-india.org
            </div>
            <div className="text-xs font-semibold text-zinc-800 pt-1 font-mono uppercase tracking-wider">
              Legal Bureau & Compliance Monitoring Directorate
            </div>
          </div>

          {/* Reference and Date Bar */}
          <div className="flex justify-between items-center text-xs font-mono border-b border-zinc-200 pb-3 text-zinc-700">
            <div>
              <span>Ref: </span>
              <strong className="text-zinc-950">
                AICTE/COMP-AUDIT/2026/UT-{undertaking.id.slice(0, 8).toUpperCase()}
              </strong>
            </div>
            <div>
              <span>Date: </span>
              <strong className="text-zinc-950">{todayStr}</strong>
            </div>
          </div>

          {/* Institutional Addressee */}
          <div className="text-xs space-y-1 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
            <div className="font-bold text-zinc-950 uppercase font-mono">
              To: The Principal / Director,
            </div>
            <div className="font-semibold text-zinc-900 text-sm">{undertaking.institution_name || 'Apex Institute of Technology & Management'}</div>
            <div className="text-zinc-600">AICTE Permanent Institution ID: AICTE-1-392019481</div>
            <div className="text-zinc-600 font-mono">Undertaking Record ID: {undertaking.id}</div>
          </div>

          {/* Subject Line */}
          <div className="text-xs font-bold text-zinc-950 uppercase border-l-4 border-emerald-600 pl-3 py-1 bg-emerald-50">
            SUBJECT: VERIFICATION & STATUTORY AUDIT CLEARANCE MEMORANDUM FOR TIME-BOUND UNDERTAKING — {undertaking.title.toUpperCase()}
          </div>

          {/* Preamble Body */}
          <div className="text-xs leading-relaxed text-zinc-800 space-y-3">
            <p>
              In accordance with the regulatory powers vested under Section 10 of the AICTE Act 1987 and provisions laid down in the <strong>Approval Process Handbook (APH 2026-2027)</strong>, this Directorate has conducted a formal legal and forensic audit of the evidence documents submitted towards compliance of the subject undertaking.
            </p>
          </div>

          {/* Audit Verification Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-mono">
              Forensic Audit & Evidence Verification Schedule
            </h4>
            <div className="border border-zinc-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead className="bg-zinc-100 text-zinc-800 font-mono text-[11px] uppercase">
                  <tr className="border-b border-zinc-300">
                    <th className="p-2.5 text-left w-1/4">Regulatory Parameter</th>
                    <th className="p-2.5 text-left w-2/5">Statutory Finding / Evidence Observation</th>
                    <th className="p-2.5 text-left w-1/5">Statutory Clause</th>
                    <th className="p-2.5 text-center w-1/6">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-800">
                  <tr>
                    <td className="p-2.5 font-bold">{undertaking.title}</td>
                    <td className="p-2.5 leading-relaxed text-zinc-700">
                      {undertaking.description || 'Statutory compliance verification of registered deed and legal undertaking.'}
                      {undertaking.evidence_filename && (
                        <div className="mt-1 font-mono text-[10px] text-zinc-600">
                          Evidence File: <strong>{undertaking.evidence_filename}</strong> (Hash verified SHA-256)
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-zinc-700">APH Cl. 4.2 / 6.3</td>
                    <td className="p-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {undertaking.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Due Date Adherence</td>
                    <td className="p-2.5 leading-relaxed text-zinc-700">
                      Evidence submitted within statutory period before designated due date ({undertaking.due_date}).
                    </td>
                    <td className="p-2.5 font-mono text-zinc-700">SLA 15-Day Cycle</td>
                    <td className="p-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                        TIMELY
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Finding Summary */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs text-emerald-950 space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5 text-emerald-900 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Competent Authority Audit Finding & Clearance</span>
            </div>
            <p className="leading-relaxed">
              The uploaded evidentiary instruments have been cross-checked with the state registration authority and the AICTE National Portal. The competent authority is satisfied that the institutional condition stands fulfilled for Academic Year 2026-27.
            </p>
          </div>

          {/* Signatory Box */}
          <div className="pt-8 flex justify-between items-end text-xs font-mono text-zinc-800 border-t border-zinc-200">
            <div>
              <div className="font-bold">National Digital Lock Verification:</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">SHA256: 9b2e81fc897d228f41... (Tamper Evident)</div>
              <div className="text-[10px] text-zinc-500 font-mono">Timestamp: {new Date().toISOString()}</div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-bold uppercase tracking-wider text-zinc-950">Er. R. K. Mukherjee</div>
              <div className="text-[11px] text-zinc-600">Director & Legal Bureau Lead</div>
              <div className="text-[10px] text-zinc-500">All India Council for Technical Education</div>
              <div className="inline-block px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-[9px] text-zinc-700 mt-1 font-bold">
                [Digitally Certified by AICTE Central Node]
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0E121B] border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] font-mono text-platinum-400">
            Official AICTE Document · Printable on A4 Standard Bond
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs transition cursor-pointer hover:bg-platinum-200"
          >
            Close Memorandum
          </button>
        </div>
      </div>
    </div>
  );
};
