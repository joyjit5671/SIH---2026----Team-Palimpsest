'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Users,
  Compass,
  FileCheck2,
  Minimize2,
  Maximize2,
  BadgeCheck,
} from 'lucide-react';
import { EVCItem } from '../types/api';

interface EVCSpotlightDeckProps {
  evcQueue: EVCItem[];
  onSelectEVC: (evc: EVCItem) => void;
}

interface SpotlightEVC {
  id: string;
  application_number: string;
  institution_name: string;
  scheduled_at: string;
  status: string;
  assigned_team: string;
  chairman_name: string;
  chairman_title: string;
  inspection_verdict_quote: string;
  prerequisites: { name: string; status: 'satisfied' | 'warning' | 'pending' }[];
  aph_clause_ref: string;
}

export const EVCSpotlightDeck: React.FC<EVCSpotlightDeckProps> = ({
  evcQueue,
  onSelectEVC,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const spotlightItems: SpotlightEVC[] = [
    {
      id: evcQueue[0]?.id || 'evc-1',
      application_number: evcQueue[0]?.application_number || 'APP-2026-1002',
      institution_name: evcQueue[0]?.institution_name || 'Bengaluru Institute of Science & Technology',
      scheduled_at: evcQueue[0]?.scheduled_at || '2026-11-12T10:00:00',
      status: evcQueue[0]?.status || 'SCHEDULED',
      assigned_team: evcQueue[0]?.assigned_team || 'Prof. A. K. Sen (Chair), Dr. R. Iyer (Expert)',
      chairman_name: 'Prof. A. K. Sen',
      chairman_title: 'EVC Expert Committee Chairman',
      inspection_verdict_quote:
        'Physical campus inspection validated. 180 computing workstations active with licensed CAD/CAM software and 1 Gbps NMEICT connectivity. Accessibility ramps confirmed.',
      prerequisites: [
        { name: '180 PC Workstations Active', status: 'satisfied' },
        { name: 'Licensed CAD/CAM Software', status: 'satisfied' },
        { name: 'Barrier-Free Ramps & Lifts', status: 'satisfied' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 5.4 & Appendix 4',
    },
    {
      id: evcQueue[1]?.id || 'evc-2',
      application_number: evcQueue[1]?.application_number || 'APP-2026-1001',
      institution_name: evcQueue[1]?.institution_name || 'Apex Institute of Technology & Management',
      scheduled_at: evcQueue[1]?.scheduled_at || '2026-11-15T11:30:00',
      status: evcQueue[1]?.status || 'PENDING',
      assigned_team: evcQueue[1]?.assigned_team || 'Dr. Manjit Singh (Lead), Er. V. K. Sharma (PWD Expert)',
      chairman_name: 'Dr. Manjit Singh',
      chairman_title: 'Northern Bureau EVC Inspector',
      inspection_verdict_quote:
        'Advanced Robotics & AI Laboratory physical audit scheduled. 6-axis industrial arms, safety cages, and high-performance GPU cluster ready for on-site benchmark testing.',
      prerequisites: [
        { name: 'Geo-Fenced Drone Survey', status: 'satisfied' },
        { name: 'Robotics Safety Cages', status: 'satisfied' },
        { name: 'Biometric Attendance Audit', status: 'warning' },
      ],
      aph_clause_ref: 'APH 2026-27 Normative Lab Guidelines',
    },
    {
      id: evcQueue[2]?.id || 'evc-3',
      application_number: evcQueue[2]?.application_number || 'APP-2026-1004',
      institution_name: evcQueue[2]?.institution_name || 'Mumbai Academy of Technology',
      scheduled_at: evcQueue[2]?.scheduled_at || '2026-11-18T09:30:00',
      status: evcQueue[2]?.status || 'COMPLETED',
      assigned_team: evcQueue[2]?.assigned_team || 'Prof. Sunita Deshmukh (Chairperson)',
      chairman_name: 'Prof. Sunita Deshmukh',
      chairman_title: 'Standing Inspection Lead',
      inspection_verdict_quote:
        '42,000 sq.m contiguous campus inspected via GPS geo-tagging. Zero boundary encumbrances. Smart classroom audio-visual infrastructure satisfies APH Chapter 5.',
      prerequisites: [
        { name: 'Contiguous Land Survey', status: 'satisfied' },
        { name: '12 Smart Classrooms Active', status: 'satisfied' },
        { name: 'Fire Hydrant Pressure Passed', status: 'satisfied' },
      ],
      aph_clause_ref: 'APH 2026-27 Clause 4.3 & 5.1',
    },
  ];

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
    const liveMatch = evcQueue.find((e) => e.id === activeItem.id) || {
      id: activeItem.id,
      application_id: 'app-2',
      application_number: activeItem.application_number,
      institution_name: activeItem.institution_name,
      region: 'South-Western',
      status: activeItem.status as any,
      scheduled_at: activeItem.scheduled_at,
      assigned_team: activeItem.assigned_team,
      created_at: new Date().toISOString(),
    };
    onSelectEVC(liveMatch);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative bg-[#0A0D14]/90 rounded-3xl border border-white/10 p-5 sm:p-6 shadow-glass-island overflow-hidden transition-all duration-300"
    >
      {/* Ambient decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold font-display text-white tracking-tight">
                EVC On-Site Inspection Spotlight Deck
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/40 text-indigo-300 border border-indigo-500/30">
                Physical Campus Audits
              </span>
            </div>
            <p className="text-[11px] text-platinum-400 font-sans">
              Expert committee findings on laboratory infrastructure, geo-fencing, and computing capacities.
            </p>
          </div>
        </div>

        {/* Controls: Minimize / Expand & Pagination */}
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
                  title="Previous inspection"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/15 text-platinum-300 hover:text-white border border-white/10 transition cursor-pointer"
                  title="Next inspection"
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
            <span className="font-mono text-indigo-400 font-bold shrink-0">{activeItem.application_number}</span>
            <span className="text-white font-bold truncate">{activeItem.institution_name}:</span>
            <span className="text-platinum-300 truncate italic">"{activeItem.inspection_verdict_quote}"</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
              {activeItem.status}
            </span>
            <span className="text-platinum-400 group-hover:text-white text-xs font-mono flex items-center gap-1">
              Inspect <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      ) : (
        <>
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
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white bg-white/[0.08] px-2.5 py-0.5 rounded-md border border-white/10">
                        {activeItem.application_number}
                      </span>
                      <span className="text-xs text-platinum-400 font-mono flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-platinum-400" />
                        <strong className="text-white">{activeItem.institution_name}</strong>
                      </span>
                    </div>
                    <div className="text-xs text-platinum-300 mt-1.5 flex items-center space-x-2 font-mono">
                      <span>Team: <strong className="text-white">{activeItem.assigned_team}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-[10px] text-platinum-400 font-mono">SCHEDULED</div>
                      <div className="text-xs font-mono font-bold text-platinum-200">
                        {new Date(activeItem.scheduled_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
                        activeItem.status === 'COMPLETED'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                          : activeItem.status === 'SCHEDULED'
                          ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {activeItem.status}
                    </span>
                  </div>
                </div>

                {/* Inspection Verdict Quote Banner */}
                <div className="bg-white/[0.02] border-l-2 border-indigo-400/80 pl-3.5 py-2 my-2 rounded-r-xl">
                  <p className="text-xs text-platinum-200 font-sans italic leading-relaxed">
                    "{activeItem.inspection_verdict_quote}"
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] font-bold text-white font-mono">{activeItem.chairman_name}</span>
                    <span className="text-[10px] text-platinum-400 font-sans">({activeItem.chairman_title})</span>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 mt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-platinum-400 font-mono uppercase tracking-wider">
                      Infrastructure Metrics:
                    </span>
                    {activeItem.prerequisites.map((p, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono ${
                          p.status === 'satisfied'
                            ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30'
                            : p.status === 'warning'
                            ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 text-platinum-400 border border-white/10'
                        }`}
                      >
                        {p.status === 'satisfied' ? (
                          <CheckCircle2 className="w-3 h-3 text-indigo-400" />
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
                    <span>Inspect EVC Dossier</span>
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
                  idx === currentIndex ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Jump to inspection ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
