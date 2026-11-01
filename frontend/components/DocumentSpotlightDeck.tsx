'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Flame,
  ShieldAlert,
  Calendar,
  BadgeCheck,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { DocumentItem } from '../types/api';

interface DocumentSpotlightDeckProps {
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
}

interface SpotlightDoc {
  id: string;
  document_type: string;
  institution_name: string;
  filename: string;
  valid_from: string;
  expires_on: string;
  review_status: string;
  days_remaining: number;
  officer_name: string;
  officer_title: string;
  review_verdict_quote: string;
  prerequisites: { name: string; status: 'satisfied' | 'warning' | 'pending' }[];
  aph_clause_ref: string;
}

export const DocumentSpotlightDeck: React.FC<DocumentSpotlightDeckProps> = ({
  documents,
  onSelectDocument,
}) => {
  // Built-in statutory document cases enriched from live document vault
  const spotlightItems: SpotlightDoc[] = [
    {
      id: documents[0]?.id || 'doc-1',
      document_type: documents[0]?.document_type || 'State Fire Department Safety Clearance (Fire NOC)',
      institution_name: documents[0]?.institution_name || 'Apex Institute of Technology & Management',
      filename: documents[0]?.filename || 'State_Fire_Safety_Clearance_NOC_2026.pdf',
      valid_from: documents[0]?.valid_from || '2023-11-20',
      expires_on: documents[0]?.expires_on || '2026-11-19',
      review_status: documents[0]?.review_status || 'APPROACHING_EXPIRY',
      days_remaining: 18,
      officer_name: 'Chief Fire Officer K. L. Rao',
      officer_title: 'State Fire & Emergency Services Directorate',
      review_verdict_quote:
        'Fire NOC expires in 18 days! Automatic 30-day radar alert triggered. On-site wet riser pressure test and fire exit route demarcation audit scheduled for renewal.',
      prerequisites: [
        { name: 'Smoke Detector Grid Tested', status: 'satisfied' },
        { name: 'Fire Hydrant Pressure 3.5 bar', status: 'satisfied' },
        { name: 'Renewal Fee Receipt Uploaded', status: 'warning' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 9.1 & National Building Code (NBC) Part 4',
    },
    {
      id: documents[1]?.id || 'doc-2',
      document_type: documents[1]?.document_type || 'Perpetual Campus Land Lease Deed (30-Year Registered)',
      institution_name: documents[1]?.institution_name || 'Bengaluru Institute of Science & Technology',
      filename: documents[1]?.filename || 'Registered_Lease_Deed_30Years_Mutation.pdf',
      valid_from: documents[1]?.valid_from || '2026-04-01',
      expires_on: documents[1]?.expires_on || '2056-03-31',
      review_status: documents[1]?.review_status || 'VALID',
      days_remaining: 10740,
      officer_name: 'Er. S. Narayanan',
      officer_title: 'AICTE Land & Building Directorate Lead',
      review_verdict_quote:
        '30-year perpetual lease with Sub-Registrar Bangalore Rural verified. Title is unencumbered and registered in name of the applicant educational trust. Validity verified through 2056.',
      prerequisites: [
        { name: 'Sub-Registrar Registration Book I', status: 'satisfied' },
        { name: 'No-Encumbrance 30-Yr Search', status: 'satisfied' },
        { name: 'Contiguous 10-Acre Plot Certified', status: 'satisfied' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 4.1 & Appendix 4',
    },
    {
      id: documents[2]?.id || 'doc-3',
      document_type: documents[2]?.document_type || 'Municipal Building Occupancy Certificate (Form D)',
      institution_name: documents[2]?.institution_name || 'Delhi College of Engineering & Research',
      filename: documents[2]?.filename || 'Building_Occupancy_Certificate_FormD.pdf',
      valid_from: documents[2]?.valid_from || '2024-01-15',
      expires_on: documents[2]?.expires_on || '2029-01-14',
      review_status: documents[2]?.review_status || 'VALID',
      days_remaining: 790,
      officer_name: 'Shri A. P. Mathur',
      officer_title: 'Chief Town Planner, Municipal Corporation',
      review_verdict_quote:
        'Sanctioned architectural building plan and structural stability certificate examined. Total carpet area 42,600 sq.m confirmed as institutional educational zone.',
      prerequisites: [
        { name: 'Sanctioned Master Plan #MP-820', status: 'satisfied' },
        { name: 'Carpet Area > Mandated Norm', status: 'satisfied' },
        { name: 'Barrier-Free Entrance Form D', status: 'satisfied' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 5.2 (Infrastructure Carpet Area)',
    },
    {
      id: documents[3]?.id || 'doc-4',
      document_type: documents[3]?.document_type || 'Structural Stability & Seismic Safety Certificate',
      institution_name: documents[3]?.institution_name || 'Mumbai Academy of Technology',
      filename: documents[3]?.filename || 'PWD_Structural_Stability_Certificate_2026.pdf',
      valid_from: documents[3]?.valid_from || '2025-06-01',
      expires_on: documents[3]?.expires_on || '2026-10-31',
      review_status: documents[3]?.review_status || 'RENEWAL_SUBMITTED',
      days_remaining: -1,
      officer_name: 'Dr. Vikramaditya Rao',
      officer_title: 'Executive Engineer (PWD Civil)',
      review_verdict_quote:
        'Prior 1-year certificate expired on 31-Oct-2026. Institution uploaded 5-year comprehensive structural audit conducted by IIT Mumbai civil faculty. Under scrutiny for clearance.',
      prerequisites: [
        { name: 'IIT Structural Audit Report', status: 'satisfied' },
        { name: 'Seismic Zone III Compliance', status: 'satisfied' },
        { name: 'Executive Engineer Seal Pending', status: 'warning' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 5.3 & IS:1893 Seismic Standards',
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
    const liveMatch = documents.find((d) => d.id === activeItem.id) || {
      id: activeItem.id,
      institution_id: 'inst-1',
      institution_name: activeItem.institution_name,
      document_type: activeItem.document_type,
      filename: activeItem.filename,
      valid_from: activeItem.valid_from,
      expires_on: activeItem.expires_on,
      review_status: activeItem.review_status as any,
      created_at: new Date().toISOString(),
    };
    onSelectDocument(liveMatch);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative bg-[#0A0D14]/90 rounded-3xl border border-white/10 p-5 sm:p-6 shadow-glass-island overflow-hidden transition-all duration-300"
    >
      {/* Ambient decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold font-display text-white tracking-tight">
                Statutory Document Lifecycle & Expiry Radar
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/30">
                Life-Safety & Land Clearances
              </span>
            </div>
            <p className="text-[11px] text-platinum-400 font-sans">
              Continuous surveillance of Fire NOCs, 30-year land leases, and structural stability certificates with 30/60/90-day warning triggers.
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
                  title="Previous certificate"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/15 text-platinum-300 hover:text-white border border-white/10 transition cursor-pointer"
                  title="Next certificate"
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
            <span className="font-mono text-amber-400 font-bold shrink-0">{activeItem.document_type}</span>
            <span className="text-white font-bold truncate">{activeItem.institution_name}:</span>
            <span className="text-platinum-300 truncate italic">"{activeItem.review_verdict_quote}"</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
              {activeItem.review_status}
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
                  {activeItem.document_type}
                </h4>
              </div>

              {/* Status pill & Expiry Warning */}
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-[10px] text-platinum-400 font-mono">EXPIRES ON</div>
                  <div className="text-xs font-mono font-bold text-platinum-200">{activeItem.expires_on}</div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
                    activeItem.review_status === 'VALID'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                      : activeItem.review_status === 'APPROACHING_EXPIRY'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 animate-pulse'
                      : activeItem.review_status === 'RENEWAL_SUBMITTED'
                      ? 'bg-sky-950/60 text-sky-300 border border-sky-500/40'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {activeItem.review_status === 'APPROACHING_EXPIRY'
                    ? `EXPIRING (${activeItem.days_remaining}D)`
                    : activeItem.review_status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Officer Verdict Quote Banner */}
            <div className="bg-white/[0.02] border-l-2 border-amber-400/80 pl-3.5 py-2 my-2 rounded-r-xl">
              <p className="text-xs text-platinum-200 font-sans italic leading-relaxed">
                "{activeItem.review_verdict_quote}"
              </p>
              <div className="mt-1 flex items-center space-x-2">
                <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-white font-mono">{activeItem.officer_name}</span>
                <span className="text-[10px] text-platinum-400 font-sans">({activeItem.officer_title})</span>
              </div>
            </div>

            {/* Bottom Row: Prerequisite Checklist Pills & Inspect Action */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 mt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-platinum-400 font-mono uppercase tracking-wider">
                  Validity Criteria:
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
                <span>Inspect Certificate</span>
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
              idx === currentIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Jump to certificate ${idx + 1}`}
          />
        ))}
      </div>
        </>
      )}
    </div>
  );
};
