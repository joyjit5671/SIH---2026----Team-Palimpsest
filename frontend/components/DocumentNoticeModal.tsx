'use client';

import React from 'react';
import { X, Printer, AlertTriangle, ShieldAlert, Flame, FileText } from 'lucide-react';
import { DocumentItem } from '../types/api';

interface DocumentNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentItem: DocumentItem | null;
}

export const DocumentNoticeModal: React.FC<DocumentNoticeModalProps> = ({
  isOpen,
  onClose,
  documentItem,
}) => {
  if (!isOpen || !documentItem) return null;

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
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold">
                Official AICTE Statutory Show-Cause Memorandum
              </span>
              <h3 className="text-base font-bold font-display text-white mt-0.5">
                Statutory Document Expiry & Rectification Notice
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
          {/* Official AICTE Header */}
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
            <div className="text-xs font-semibold text-rose-900 pt-1 font-mono uppercase tracking-wider">
              Estate, Land & Safety Surveillance Cell · Approval Bureau
            </div>
          </div>

          {/* Reference and Date Bar */}
          <div className="flex justify-between items-center text-xs font-mono border-b border-zinc-200 pb-3 text-zinc-700">
            <div>
              <span>Ref: </span>
              <strong className="text-zinc-950">
                AICTE/ESTATE/EXPIRY-WARN/2026/DOC-{documentItem.id.slice(0, 8).toUpperCase()}
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
              To: The Chairman / Secretary of the Trust & Principal,
            </div>
            <div className="font-semibold text-zinc-900 text-sm">{documentItem.institution_name || 'Apex Institute of Technology & Management'}</div>
            <div className="text-zinc-600">AICTE Permanent Institution ID: AICTE-1-392019481</div>
            <div className="text-zinc-600 font-mono">Vault Certificate ID: {documentItem.id}</div>
          </div>

          {/* Subject Line */}
          <div className="text-xs font-bold text-rose-900 uppercase border-l-4 border-rose-600 pl-3 py-1 bg-rose-50">
            SUBJECT: STATUTORY SHOW-CAUSE NOTICE FOR IMMINENT EXPIRATION OF MANDATORY CLEARANCE CERTIFICATE — {documentItem.document_type.toUpperCase()}
          </div>

          {/* Preamble Body */}
          <div className="text-xs leading-relaxed text-zinc-800 space-y-3">
            <p>
              WHEREAS, under the provisions of Section 10(k) and Section 11 of the <strong>All India Council for Technical Education Act, 1987 (Act No. 52 of 1987)</strong> and Chapter IV of the <strong>Approval Process Handbook (APH 2026-27)</strong>, all approved technical institutions are statutorily required to maintain valid, unexpired statutory life-safety, fire safety, land lease mutation, and structural stability clearances at all times during the academic session.
            </p>
            <p>
              AND WHEREAS, the centralized AICTE Document Expiry Radar has detected that the following mandatory statutory instrument registered by your institution is approaching expiry or has lapsed without proof of renewed grant:
            </p>
          </div>

          {/* Document Defect Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-mono">
              Critical Clearance Expiry Schedule
            </h4>
            <div className="border border-zinc-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead className="bg-zinc-100 text-zinc-800 font-mono text-[11px] uppercase">
                  <tr className="border-b border-zinc-300">
                    <th className="p-2.5 text-left w-1/4">Statutory Document Type</th>
                    <th className="p-2.5 text-left w-1/4">Current Certificate Record</th>
                    <th className="p-2.5 text-center w-1/6">Expiry Date</th>
                    <th className="p-2.5 text-center w-1/6">Surveillance Status</th>
                    <th className="p-2.5 text-left w-1/6">Statutory Mandate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-800">
                  <tr>
                    <td className="p-2.5 font-bold">{documentItem.document_type}</td>
                    <td className="p-2.5 font-mono text-zinc-600">{documentItem.filename}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-rose-700">{documentItem.expires_on || 'Immediate'}</td>
                    <td className="p-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300">
                        {documentItem.review_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-zinc-700">APH Cl. 9.1 / NBC Part 4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 15-Day Remediation Directive */}
          <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/80 text-xs text-rose-950 space-y-2">
            <div className="font-bold flex items-center space-x-1.5 text-rose-900 font-mono">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Mandatory 15-Day Rectification Directive</span>
            </div>
            <p className="leading-relaxed">
              You are hereby called upon to submit the renewed, competent authority-authenticated clearance certificate or the official government renewal acknowledgment receipt through the AICTE Regulatory Portal within <strong>fifteen (15) calendar days</strong> from the issuance of this memorandum.
            </p>
            <p className="font-semibold text-rose-900">
              FAILURE TO COMPLY: In the event of failure to furnish renewed clearance within the stipulated window, the Council reserves the right under Section 10(p) to withhold Extension of Approval (EoA) for Academic Year 2026-27 or place the approved programs in "No Admission Category" for life-safety default.
            </p>
          </div>

          {/* Signatory Box */}
          <div className="pt-8 flex justify-between items-end text-xs font-mono text-zinc-800 border-t border-zinc-200">
            <div>
              <div className="font-bold">Dispatch Traceability Hash:</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">SHA256: 4f1a92e10c78b409a2... (Statutory Dispatch)</div>
              <div className="text-[10px] text-zinc-500 font-mono">Logged into AICTE Immutable Audit Trail</div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-bold uppercase tracking-wider text-zinc-950">Er. S. Narayanan</div>
              <div className="text-[11px] text-zinc-600">Director (Approval & Safety Regulation Bureau)</div>
              <div className="text-[10px] text-zinc-500">All India Council for Technical Education</div>
              <div className="inline-block px-2 py-0.5 bg-rose-100 border border-rose-300 rounded text-[9px] text-rose-900 mt-1 font-bold">
                [Digitally Certified by AICTE Central Server]
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0E121B] border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] font-mono text-platinum-400">
            Official AICTE Show-Cause Notice · Printable on A4 Standard Bond
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs transition cursor-pointer hover:bg-platinum-200"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
};
