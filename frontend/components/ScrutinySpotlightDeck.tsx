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
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText,
  BadgeCheck,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { ApplicationSummary } from '../types/api';

interface ScrutinySpotlightDeckProps {
  applications: ApplicationSummary[];
  onSelectApplication: (id: string) => void;
}

interface SpotlightDossier {
  id: string;
  application_number: string;
  institution_name: string;
  region: string;
  application_type: string;
  current_stage: string;
  operational_status: string;
  days_in_current_stage: number;
  is_overdue: boolean;
  officer_name: string;
  officer_title: string;
  review_verdict_quote: string;
  prerequisites: { name: string; status: 'satisfied' | 'warning' | 'pending' }[];
  aph_clause_ref: string;
}

export const ScrutinySpotlightDeck: React.FC<ScrutinySpotlightDeckProps> = ({
  applications,
  onSelectApplication,
}) => {
  // Built-in statutory assessment highlights enriched from applications
  const spotlightItems: SpotlightDossier[] = [
    {
      id: applications[0]?.id || 'app-1',
      application_number: applications[0]?.application_number || 'APP-2026-1001',
      institution_name: applications[0]?.institution_name || 'Apex Institute of Technology & Management',
      region: applications[0]?.region || 'Northern Region',
      application_type: applications[0]?.application_type || 'Extension of Approval (EoA)',
      current_stage: applications[0]?.current_stage || 'SCRUTINY',
      operational_status: applications[0]?.operational_status || 'IN_REVIEW',
      days_in_current_stage: applications[0]?.days_in_current_stage || 6,
      is_overdue: applications[0]?.is_overdue || false,
      officer_name: 'Er. Priya Sharma',
      officer_title: 'AICTE Scrutiny Officer (Tech-I)',
      review_verdict_quote:
        'Land conversion order and 30-year registered lease deed verified against state revenue portal. Faculty Cadre ratio 1:15 satisfied for B.Tech AI & Data Science.',
      prerequisites: [
        { name: 'Land Title Registered', status: 'satisfied' },
        { name: 'Faculty Cadre 1:15', status: 'satisfied' },
        { name: 'Structural Stability NOC', status: 'warning' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 4.2 & 7.1',
    },
    {
      id: applications[1]?.id || 'app-2',
      application_number: applications[1]?.application_number || 'APP-2026-1002',
      institution_name: applications[1]?.institution_name || 'Bengaluru Institute of Science & Technology',
      region: applications[1]?.region || 'South-Western Region',
      application_type: applications[1]?.application_type || 'New Technical Institution',
      current_stage: applications[1]?.current_stage || 'EVC',
      operational_status: applications[1]?.operational_status || 'IN_REVIEW',
      days_in_current_stage: applications[1]?.days_in_current_stage || 12,
      is_overdue: false,
      officer_name: 'Prof. A. K. Sen',
      officer_title: 'EVC Expert Inspection Chairman',
      review_verdict_quote:
        'Physical campus inspection validated. 180 computing workstations active with licensed CAD/CAM software and 1 Gbps NMEICT connectivity. Accessibility ramps confirmed.',
      prerequisites: [
        { name: 'Campus Boundary Geo-Fenced', status: 'satisfied' },
        { name: '180 PC Workstations Active', status: 'satisfied' },
        { name: 'Barrier-Free Ramps', status: 'satisfied' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 5.4 & Appendix 4',
    },
    {
      id: applications[2]?.id || 'app-3',
      application_number: applications[2]?.application_number || 'APP-2026-1003',
      institution_name: applications[2]?.institution_name || 'Delhi College of Engineering & Research',
      region: applications[2]?.region || 'Northern Region',
      application_type: applications[2]?.application_type || 'Course Expansion (CSE & IoT)',
      current_stage: applications[2]?.current_stage || 'SAC_SHC',
      operational_status: applications[2]?.operational_status || 'RETURNED',
      days_in_current_stage: applications[2]?.days_in_current_stage || 19,
      is_overdue: true,
      officer_name: 'Justice (Retd.) M. K. Chawla',
      officer_title: 'Standing Hearing Committee (SAC Lead)',
      review_verdict_quote:
        'Appellate hearing convened on deficiency return. Institution produced original sub-registrar notarized affidavit for built-up area. Clarification accepted.',
      prerequisites: [
        { name: 'Built-up Area 4,200 sq.m', status: 'satisfied' },
        { name: 'Endowment Fund ₹1.5 Cr', status: 'satisfied' },
        { name: 'Fire Department Clearance', status: 'warning' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 9.2 (Appellate Procedure)',
    },
    {
      id: applications[3]?.id || 'app-4',
      application_number: applications[3]?.application_number || 'APP-2026-1004',
      institution_name: applications[3]?.institution_name || 'Mumbai Academy of Technology',
      region: applications[3]?.region || 'Western Region',
      application_type: applications[3]?.application_type || 'Extension of Approval (EoA)',
      current_stage: applications[3]?.current_stage || 'FINAL_REVIEW',
      operational_status: applications[3]?.operational_status || 'IN_REVIEW',
      days_in_current_stage: applications[3]?.days_in_current_stage || 4,
      is_overdue: false,
      officer_name: 'Dr. Anil S.',
      officer_title: 'AICTE Bureau Officer & Supervisor',
      review_verdict_quote:
        'All scrutiny and EVC clearance thresholds satisfied. Zero active legal disputes. Recommended for final statutory council approval grant.',
      prerequisites: [
        { name: 'Scrutiny Stage Cleared', status: 'satisfied' },
        { name: 'EVC Report Satisfactory', status: 'satisfied' },
        { name: 'Anti-Ragging Compliance', status: 'satisfied' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 2.1 (Council Ratification)',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-rotation every 6 seconds unless hovered or minimized
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

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative bg-[#0A0D14]/90 rounded-3xl border border-white/10 p-5 sm:p-6 shadow-glass-island overflow-hidden transition-all duration-300"
    >
      {/* Ambient decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold font-display text-white tracking-tight">
                Scrutiny Assessment Spotlight Deck
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-platinum-300 border border-white/10">
                APH 2026-27 Norms
              </span>
            </div>
            <p className="text-[11px] text-platinum-400 font-sans">
              Interactive stacked preview of lead officer findings and committee verdicts. Click to review full dossier.
            </p>
          </div>
        </div>

        {/* Carousel controls, minimize button & pagination */}
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
                  title="Previous dossier"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/15 text-platinum-300 hover:text-white border border-white/10 transition cursor-pointer"
                  title="Next dossier"
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
          onClick={() => onSelectApplication(activeItem.id)}
          className="p-3 bg-[#0D1017]/80 border border-white/10 rounded-2xl flex items-center justify-between text-xs cursor-pointer hover:border-white/20 transition group"
        >
          <div className="flex items-center space-x-3 truncate">
            <span className="font-mono text-sky-400 font-bold shrink-0">{activeItem.application_number}</span>
            <span className="text-white font-bold truncate">{activeItem.institution_name}:</span>
            <span className="text-platinum-300 truncate italic">"{activeItem.review_verdict_quote}"</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-500/30">
              {activeItem.current_stage}
            </span>
            <span className="text-platinum-400 group-hover:text-white text-xs font-mono flex items-center gap-1">
              Inspect <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Stacked Cards Area */}
          <div className="relative min-h-[230px] sm:min-h-[210px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={() => onSelectApplication(activeItem.id)}
            className="w-full bg-[#0D1017]/95 hover:bg-[#111520] border border-white/15 hover:border-white/30 rounded-2xl p-5 shadow-2xl transition-all cursor-pointer relative group"
          >
            {/* Top Row: Application ID, Region & Stage Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-xs font-bold text-white bg-white/[0.08] px-2.5 py-1 rounded-lg border border-white/10">
                  {activeItem.application_number}
                </span>
                <span className="text-xs text-platinum-400 font-sans font-medium">
                  {activeItem.region}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-500/30">
                  {activeItem.application_type}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-platinum-400">
                  Stage: <strong className="text-white">{activeItem.current_stage}</strong>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeItem.is_overdue
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30 animate-pulse'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {activeItem.days_in_current_stage}d in stage {activeItem.is_overdue && '· OVERDUE'}
                </span>
              </div>
            </div>

            {/* Institution Title */}
            <h4 className="text-base font-bold font-display text-white group-hover:text-sky-300 transition-colors">
              {activeItem.institution_name}
            </h4>

            {/* Officer Observation Quote (The Vengeance Testimonials Card Core) */}
            <div className="my-3 p-3.5 bg-white/[0.02] border border-white/10 rounded-xl relative">
              <p className="text-xs text-platinum-200 font-sans leading-relaxed italic">
                "{activeItem.review_verdict_quote}"
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] font-mono text-platinum-400">
                <div className="flex items-center space-x-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-white font-semibold">{activeItem.officer_name}</span>
                  <span className="text-platinum-500">({activeItem.officer_title})</span>
                </div>
                <span className="text-[10px] text-platinum-500">{activeItem.aph_clause_ref}</span>
              </div>
            </div>

            {/* Bottom Bar: Prerequisite Checklist & Click to Inspect Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                <span className="text-platinum-400 mr-1">Prerequisites:</span>
                {activeItem.prerequisites.map((p, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                      p.status === 'satisfied'
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {p.status === 'satisfied' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                    <span>{p.name}</span>
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-sky-400 group-hover:text-white flex items-center gap-1 font-semibold transition">
                  Inspect & Review Dossier
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Dots Indicator */}
      <div className="flex justify-center items-center space-x-1.5 mt-4">
        {spotlightItems.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentIndex === idx ? 'w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
        </>
      )}
    </div>
  );
};
