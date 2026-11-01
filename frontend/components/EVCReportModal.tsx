'use client';

import React from 'react';
import { X, Printer, CheckCircle2, AlertTriangle, Compass, FileCheck2, Building2 } from 'lucide-react';
import { EVCItem } from '../types/api';

interface EVCReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evcItem: EVCItem | null;
}

export const EVCReportModal: React.FC<EVCReportModalProps> = ({
  isOpen,
  onClose,
  evcItem,
}) => {
  if (!isOpen || !evcItem) return null;

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
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Official AICTE Expert Visiting Committee (EVC) Report
              </span>
              <h3 className="text-base font-bold font-display text-white mt-0.5">
                Physical Campus Appraisal & Infrastructure Audit
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
            <div className="text-xs font-semibold text-indigo-900 pt-1 font-mono uppercase tracking-wider">
              Expert Visiting Committee (EVC) Appraisal Directorate
            </div>
          </div>

          {/* Reference and Date Bar */}
          <div className="flex justify-between items-center text-xs font-mono border-b border-zinc-200 pb-3 text-zinc-700">
            <div>
              <span>Ref: </span>
              <strong className="text-zinc-950">
                AICTE/EVC-APPRAISAL/2026/EVC-{evcItem.id.slice(0, 8).toUpperCase()}
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
              Institution Inspected:
            </div>
            <div className="font-semibold text-zinc-900 text-sm">{evcItem.institution_name}</div>
            <div className="text-zinc-600 font-mono">Application Reference: {evcItem.application_number}</div>
            <div className="text-zinc-600">Committee Composition: <strong>{evcItem.assigned_team || 'Prof. A. K. Sen (Chairman), Dr. R. Iyer (Expert)'}</strong></div>
            <div className="text-zinc-600 font-mono">Scheduled Date: {evcItem.scheduled_at ? new Date(evcItem.scheduled_at).toLocaleString() : 'Unscheduled'}</div>
          </div>

          {/* Subject Line */}
          <div className="text-xs font-bold text-indigo-950 uppercase border-l-4 border-indigo-600 pl-3 py-1 bg-indigo-50">
            SUBJECT: FORMAL PHYSICAL APPRAISAL & COMPLIANCE FINDINGS REPORT OF THE EXPERT VISITING COMMITTEE (EVC) — AY 2026-27
          </div>

          {/* Infrastructure Audit Findings Schedule */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-mono">
              Normative Infrastructure Verification Schedule (APH 2026-27)
            </h4>
            <div className="border border-zinc-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead className="bg-zinc-100 text-zinc-800 font-mono text-[11px] uppercase">
                  <tr className="border-b border-zinc-300">
                    <th className="p-2.5 text-left w-1/4">Infrastructure Parameter</th>
                    <th className="p-2.5 text-left w-2/5">On-Site Committee Observation</th>
                    <th className="p-2.5 text-left w-1/5">Statutory Reference</th>
                    <th className="p-2.5 text-center w-1/6">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-800">
                  <tr>
                    <td className="p-2.5 font-bold">Computing & CAD/CAM Labs</td>
                    <td className="p-2.5 leading-relaxed text-zinc-700">
                      180 active terminals with Intel i7 / 16GB RAM inspected. Licensed SolidWorks and MATLAB activated on campus server.
                    </td>
                    <td className="p-2.5 font-mono text-zinc-700">APH Cl. 5.4</td>
                    <td className="p-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                        SATISFIED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Land & Geo-Tagging Survey</td>
                    <td className="p-2.5 leading-relaxed text-zinc-700">
                      GPS coordinates validated with drone perimeter tracking. 100% contiguous institutional plot unencumbered.
                    </td>
                    <td className="p-2.5 font-mono text-zinc-700">APH Cl. 4.1</td>
                    <td className="p-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                        SATISFIED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Barrier-Free Accessibility</td>
                    <td className="p-2.5 leading-relaxed text-zinc-700">
                      Wheelchair ramps with 1:12 slope and anti-skid surfaces functional. Elevators equipped with Braille tactile buttons and audio alarms.
                    </td>
                    <td className="p-2.5 font-mono text-zinc-700">RPwD Act 2016</td>
                    <td className="p-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                        SATISFIED
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Life-Safety & Fire Measures</td>
                    <td className="p-2.5 leading-relaxed text-zinc-700">
                      Fire hydrant pressure tested at 3.5 bar. Two wide emergency evacuation stairways unobstructed across all academic blocks.
                    </td>
                    <td className="p-2.5 font-mono text-zinc-700">NBC 2016 Part 4</td>
                    <td className="p-2.5 text-center">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                        SATISFIED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Committee Final Recommendation */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 text-xs text-indigo-950 space-y-1.5">
            <div className="font-bold flex items-center space-x-1.5 text-indigo-900 font-mono">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Final Recommendation of the Expert Visiting Committee</span>
            </div>
            <p className="leading-relaxed">
              Based upon exhaustive on-site verification, physical inspection of laboratories, faculty credentials, and safety systems, the Expert Visiting Committee unequivocally recommends this institution for onward progression to Standing Appellate / Final Council Review for grant of approval.
            </p>
          </div>

          {/* Signatory Box */}
          <div className="pt-8 flex justify-between items-end text-xs font-mono text-zinc-800 border-t border-zinc-200">
            <div>
              <div className="font-bold">EVC Geo-Verification Stamp:</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">LAT/LONG: 12.9716° N, 77.5946° E (On-Site Verified)</div>
              <div className="text-[10px] text-zinc-500 font-mono">Timestamp: {new Date().toISOString()}</div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-bold uppercase tracking-wider text-zinc-950">Prof. A. K. Sen</div>
              <div className="text-[11px] text-zinc-600">Chairman, Expert Visiting Committee</div>
              <div className="text-[10px] text-zinc-500">All India Council for Technical Education</div>
              <div className="inline-block px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-[9px] text-zinc-700 mt-1 font-bold">
                [Digitally Certified by EVC Inspection Portal]
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
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
