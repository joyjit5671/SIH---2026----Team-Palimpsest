'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  BadgeCheck,
  Scale,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { UndertakingItem } from '../types/api';

interface ComplianceSpotlightDeckProps {
  complianceList: UndertakingItem[];
  onSelectUndertaking: (undertaking: UndertakingItem) => void;
}

interface SpotlightCompliance {
  id: string;
  title: string;
  institution_name: string;
  description: string;
  due_date: string;
  status: string;
  officer_name: string;
  officer_title: string;
  review_verdict_quote: string;
  prerequisites: { name: string; status: 'satisfied' | 'warning' | 'pending' }[];
  aph_clause_ref: string;
  evidence_filename?: string;
}

export const ComplianceSpotlightDeck: React.FC<ComplianceSpotlightDeckProps> = ({
  complianceList,
  onSelectUndertaking,
}) => {
  // Built-in statutory compliance cases enriched from live compliance list
  const spotlightItems: SpotlightCompliance[] = [
    {
      id: complianceList[0]?.id || 'comp-1',
      title: complianceList[0]?.title || 'Perpetual 30-Year Registered Land Lease Deed Verification',
      institution_name: complianceList[0]?.institution_name || 'Apex Institute of Technology & Management',
      description: complianceList[0]?.description || 'Submission of registered 30-year lease mutation certificate with Sub-Registrar seal.',
      due_date: complianceList[0]?.due_date || '2026-11-15',
      status: complianceList[0]?.status || 'VERIFIED_CLOSED',
      officer_name: 'Er. R. K. Mukherjee',
      officer_title: 'AICTE Legal & Estate Bureau Lead',
      review_verdict_quote:
        'Sub-Registrar serial registration #ND-4921 matched against State Revenue GIS portal. Encumbrance certificate confirms unencumbered title for 12.5 acres institutional land.',
      prerequisites: [
        { name: 'Sub-Registrar Seal Legible', status: 'satisfied' },
        { name: 'Revenue GIS Boundary Match', status: 'satisfied' },
        { name: '30-Year Mutation Confirmed', status: 'satisfied' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 4.2 & Appendix 4',
      evidence_filename: complianceList[0]?.evidence_filename || 'Registered_Lease_Deed_2026.pdf',
    },
    {
      id: complianceList[1]?.id || 'comp-2',
      title: complianceList[1]?.title || 'Mandatory 24x7 Anti-Ragging Committee & Hostel CCTV Surveillance',
      institution_name: complianceList[1]?.institution_name || 'Bengaluru Institute of Science & Technology',
      description: complianceList[1]?.description || 'Affidavit affirming constitution of anti-ragging squad and installation of 48 IP cameras across campus perimeter.',
      due_date: complianceList[1]?.due_date || '2026-11-20',
      status: complianceList[1]?.status || 'EVIDENCE_SUBMITTED',
      officer_name: 'Dr. Neha Verma',
      officer_title: 'Member Secretary, AICTE Anti-Ragging Cell',
      review_verdict_quote:
        'CCTV DVR retention logs and emergency response protocol uploaded. Random verification of 12 cameras completed via remote live IP feed. Recommended for formal closure.',
      prerequisites: [
        { name: 'Squad Gazetted Roster', status: 'satisfied' },
        { name: '48 IP CCTV Coverage Active', status: 'satisfied' },
        { name: 'Emergency Helpline 1800-Live', status: 'satisfied' },
      ],
      aph_clause_ref: 'AICTE Anti-Ragging Regulations 2009 / APH Cl. 6.4',
      evidence_filename: complianceList[1]?.evidence_filename || 'Anti_Ragging_Affidavit_CCTV_Audit.pdf',
    },
    {
      id: complianceList[2]?.id || 'comp-3',
      title: complianceList[2]?.title || 'Faculty Cadre 1:15 & Aadhaar-Seeded Biometric Attendance Sync',
      institution_name: complianceList[2]?.institution_name || 'Delhi College of Engineering & Research',
      description: complianceList[2]?.description || 'Submission of Aadhaar-enabled biometric attendance log and Form 16 salary disbursements for 84 regular faculty members.',
      due_date: complianceList[2]?.due_date || '2026-11-10',
      status: complianceList[2]?.status || 'PENDING',
      officer_name: 'Prof. K. S. Raman',
      officer_title: 'Director of Academic & Faculty Audit',
      review_verdict_quote:
        'Bank disbursement statements for September 2026 pending upload. 3 faculty profiles show mismatch between AICTE Faculty ID and Aadhaar vault. Clarification notice issued.',
      prerequisites: [
        { name: 'Bank Form-16 Salary Proof', status: 'warning' },
        { name: 'Cadre Ratio 1:15 Preserved', status: 'satisfied' },
        { name: 'Biometric Server Heartbeat', status: 'pending' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 7.1 & 7th CPC Pay Scale',
      evidence_filename: complianceList[2]?.evidence_filename,
    },
    {
      id: complianceList[3]?.id || 'comp-4',
      title: complianceList[3]?.title || 'Barrier-Free Built Environment & Accessible Ramps (RPwD Act 2016)',
      institution_name: complianceList[3]?.institution_name || 'Mumbai Academy of Technology',
      description: complianceList[3]?.description || 'PWD certification for disabled-friendly toilets, tactile flooring, and wheelchair ramps across all academic blocks.',
      due_date: complianceList[3]?.due_date || '2026-11-28',
      status: complianceList[3]?.status || 'VERIFIED_CLOSED',
      officer_name: 'Er. Sandeep Joshi',
      officer_title: 'Infrastructure & Safety Inspector',
      review_verdict_quote:
        'Executive Engineer PWD certificate #PWD-MUM-891 verified. Tactile pavers from entry gate to classrooms and dedicated elevators with Braille audio annunciators operational.',
      prerequisites: [
        { name: 'PWD Accessibility Clearance', status: 'satisfied' },
        { name: 'Wheelchair Ramps 1:12 Slope', status: 'satisfied' },
        { name: 'Braille Audio Lifts Active', status: 'satisfied' },
      ],
      aph_clause_ref: 'RPwD Act 2016 / APH 2026-27 Norms',
      evidence_filename: complianceList[3]?.evidence_filename || 'PWD_Accessibility_Clearance_Cert.pdf',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (isPaused || isMinimized) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spotlightItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, isMinimized, spotlightItems.length]);

  const activeItem = spotlightItems[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + spotlightItems.length) % spotlightItems.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % spotlightItems.length);
  };

  const handleInspect = () => {
    // Map active spotlight item back to UndertakingItem
    const liveMatch = complianceList.find((c) => c.id === activeItem.id) || {
      id: activeItem.id,
      institution_id: 'inst-1',
      institution_name: activeItem.institution_name,
      title: activeItem.title,
      description: activeItem.description,
      due_date: activeItem.due_date,
      status: activeItem.status as any,
      evidence_filename: activeItem.evidence_filename,
      created_at: new Date().toISOString(),
    };
    onSelectUndertaking(liveMatch);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative bg-[#0A0D14]/90 rounded-3xl border border-white/10 p-5 sm:p-6 shadow-glass-island overflow-hidden transition-all duration-300"
    >
      {/* Ambient decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold font-display text-white tracking-tight">
                Statutory Compliance Surveillance Spotlight
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                APH 2026-27 Mandatory Undertakings
              </span>
            </div>
            <p className="text-[11px] text-platinum-400 font-sans">
              Real-time audit verification stream of legal affidavits, anti-ragging measures, and cadre ratios.
            </p>
          </div>
        </div>

        {/* Carousel controls, minimize & pagination */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-platinum-300 hover:text-white border border-white/10 text-xs font-mono transition cursor-pointer"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>{isMinimized ? 'Expand' : 'Minimize'}</span>
          </button>

          {!isMinimized && (
            <>
              <div className="text-[11px] font-mono text-platinum-400 px-1">
                <span className="text-white font-bold">{currentIndex + 1}</span> / {spotlightItems.length}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/15 text-platinum-300 hover:text-white border border-white/10 transition cursor-pointer"
                  title="Previous undertaking"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/15 text-platinum-300 hover:text-white border border-white/10 transition cursor-pointer"
                  title="Next undertaking"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Body: Minimized Compact Ticker vs Full Stacked Card */}
      {isMinimized ? (
        <div
          onClick={handleInspect}
          className="p-3 bg-[#0D1017]/80 border border-white/10 rounded-2xl flex items-center justify-between text-xs cursor-pointer hover:border-white/20 transition group"
        >
          <div className="flex items-center space-x-3 truncate">
            <span className="font-mono text-emerald-400 font-bold shrink-0">{activeItem.aph_clause_ref}</span>
            <span className="text-white font-bold truncate">{activeItem.institution_name}:</span>
            <span className="text-platinum-300 truncate italic">"{activeItem.review_verdict_quote}"</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
              {activeItem.status}
            </span>
            <span className="text-platinum-400 group-hover:text-white text-xs font-mono flex items-center gap-1">
              Inspect <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Stacked Cards Area */}
          <div className="relative min-h-[220px] sm:min-h-[200px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full bg-[#0D1017]/95 border border-white/10 hover:border-white/20 rounded-2xl p-5 shadow-2xl relative flex flex-col justify-between"
          >
            {/* Top row: Metadata, institution, statutory status */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-white bg-white/[0.08] px-2.5 py-0.5 rounded-md border border-white/10">
                    {activeItem.aph_clause_ref}
                  </span>
                  <span className="text-xs text-platinum-400 font-mono flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-platinum-400" />
                    <strong className="text-white">{activeItem.institution_name}</strong>
                  </span>
                </div>
                <h4 className="text-base font-bold font-display text-white mt-1.5 line-clamp-1">
                  {activeItem.title}
                </h4>
              </div>

              {/* Status pill & Due Date */}
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-[10px] text-platinum-400 font-mono">DUE DATE</div>
                  <div className="text-xs font-mono font-bold text-platinum-200">{activeItem.due_date}</div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
                    activeItem.status === 'VERIFIED_CLOSED'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                      : activeItem.status === 'EVIDENCE_SUBMITTED'
                      ? 'bg-sky-950/60 text-sky-300 border border-sky-500/40'
                      : activeItem.status === 'OVERDUE'
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {activeItem.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Officer Verdict Quote Banner */}
            <div className="bg-white/[0.02] border-l-2 border-emerald-400/80 pl-3.5 py-2 my-2 rounded-r-xl">
              <p className="text-xs text-platinum-200 font-sans italic leading-relaxed">
                "{activeItem.review_verdict_quote}"
              </p>
              <div className="mt-1 flex items-center space-x-2">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-white font-mono">{activeItem.officer_name}</span>
                <span className="text-[10px] text-platinum-400 font-sans">({activeItem.officer_title})</span>
              </div>
            </div>

            {/* Bottom Row: Prerequisite Checklist Pills & Inspect Action */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 mt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-platinum-400 font-mono uppercase tracking-wider">
                  Audit Checklist:
                </span>
                {activeItem.prerequisites.map((p, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono ${
                      p.status === 'satisfied'
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : p.status === 'warning'
                        ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                        : 'bg-white/5 text-platinum-400 border border-white/10'
                    }`}
                  >
                    {p.status === 'satisfied' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                    )}
                    <span>{p.name}</span>
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={handleInspect}
                className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-platinum-200 text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:scale-[1.02]"
              >
                <span>Inspect Undertaking</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel dots pagination */}
      <div className="flex items-center justify-center space-x-1.5 mt-4">
        {spotlightItems.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? 'w-6 bg-emerald-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Jump to undertaking ${idx + 1}`}
          />
        ))}
      </div>
        </>
      )}
    </div>
  );
};
