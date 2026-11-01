"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ReactLenis from "lenis/react";
import { 
  Layers, 
  FileSpreadsheet, 
  Building2, 
  FileCheck2, 
  CalendarClock, 
  History, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Lock,
  RefreshCw,
  FileText
} from "lucide-react";
import { TextBoxReveal } from "./TextBoxReveal";
import { cn } from "@/lib/utils";

export interface FeatureItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  metricLabel: string;
  metricValue: string;
  previewType: "workflow" | "deficiency" | "evc" | "compliance" | "sla" | "audit";
  keyPoints: string[];
}

const FEATURES: FeatureItem[] = [
  {
    id: "workflow-engine",
    tag: "Autonomous Stage Sequencing",
    title: "Configurable Approval Routes",
    subtitle: "AICTE Problem Statement 26262 §7.1",
    description: "Multi-stage automated progression tailored for Scrutiny, EVC, and SAC/SHC bodies. Enforces rigid statutory gates—preventing unauthorized stage-skipping.",
    icon: <Layers className="w-5 h-5 text-platinum-200" />,
    metricLabel: "Statutory Gate Security",
    metricValue: "0 Unchecked Skips",
    previewType: "workflow",
    keyPoints: [
      "Dynamic routes based on application category (EoA, Course Expansion, New Institute)",
      "Automated prerequisite validation before advancing to subsequent stages",
      "Transactional consistency: stage changes committed atomically with audit logs"
    ]
  },
  {
    id: "deficiency-resolution",
    tag: "Traceable Rectification",
    title: "Deficiency & Return Resolution",
    subtitle: "APH 2026-27 Compliant",
    description: "Arbitrary returns are forbidden. Officers must provide structured deficiency grounds and explicit rectification checklists, preserving complete institutional history.",
    icon: <FileSpreadsheet className="w-5 h-5 text-platinum-200" />,
    metricLabel: "Historical Preservation",
    metricValue: "100% Retained",
    previewType: "deficiency",
    keyPoints: [
      "Mandatory return reasons with itemized deficiency checklist",
      "Institution view provides dedicated response portal with document attachments",
      "Resubmissions do not erase prior events—full timeline stays intact"
    ]
  },
  {
    id: "evc-radar",
    tag: "Physical Verification",
    title: "EVC Inspection Radar",
    subtitle: "Expert Visit Committee Queue",
    description: "End-to-end site inspection coordination with expert panel assignment, scheduling radar, and findings report submission—strictly preserving human evaluation.",
    icon: <Building2 className="w-4 h-4 text-platinum-300" />,
    metricLabel: "Inspection Integrity",
    metricValue: "Zero Dropped Visits",
    previewType: "evc",
    keyPoints: [
      "Interactive inspection date scheduling & panel coordinator assignment",
      "Automated detection of overdue or pending site inspections",
      "No automated decisions: all outcomes signed off by human expert committee"
    ]
  },
  {
    id: "compliance-vault",
    tag: "Time-Bound Undertakings",
    title: "Continuing Compliance Vault",
    subtitle: "Lease & Safety Radar",
    description: "Continuous automated scanning for land leases, structural stability certificates, and Fire NOCs with 30/60/90-day expiry warnings and verification workflows.",
    icon: <FileCheck2 className="w-4 h-4 text-platinum-200" />,
    metricLabel: "Earliest Warning Window",
    metricValue: "<30-Day Alert",
    previewType: "compliance",
    keyPoints: [
      "Monitors land lease validity and Sub-Registrar stamp verification",
      "Document upload does not equate to fulfillment until verified by an officer",
      "Automated alerts prevent institutional compliance lapses"
    ]
  },
  {
    id: "sla-watchdog",
    tag: "Pendency Defense",
    title: "SLA Watchdog & Escalations",
    subtitle: "Automated Background Engine",
    description: "Independent service scanning dossier ageing across national and regional queues. Identifies bottlenecks in distinct ageing buckets and triggers director escalations.",
    icon: <CalendarClock className="w-4 h-4 text-platinum-200" />,
    metricLabel: "Ageing Classification",
    metricValue: "<7d, 7-14d, 15-30d, >30d",
    previewType: "sla",
    keyPoints: [
      "Deterministic SLA threshold monitoring across Eastern, Western, and Northern zones",
      "High-priority alert generation for regional supervisors",
      "Idempotent alerts: repeated scans avoid duplicate notification flooding"
    ]
  },
  {
    id: "audit-spine",
    tag: "Security Spine",
    title: "Tamper-Evident Digital Audit",
    subtitle: "Append-Only Event Trail",
    description: "Every login, document review, deficiency return, and stage transition is permanently etched into an immutable audit registry with before/after state diffs.",
    icon: <History className="w-4 h-4 text-platinum-200" />,
    metricLabel: "Tamper Resistance",
    metricValue: "Immutable Append-Only",
    previewType: "audit",
    keyPoints: [
      "Stores actor identity, role, exact UTC timestamp, and state diffs",
      "Ordinary users and officers cannot modify or purge audit entries",
      "Ready for ministerial inquiry and statutory compliance audits"
    ]
  }
];

export function AppleFeatureBlock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeDeckIndex, setActiveDeckIndex] = useState(0);

  // Interactive states for consoles
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<"scrutiny" | "evc" | "sac" | "approval">("evc");
  const [evcCheckpoints, setEvcCheckpoints] = useState({ labs: true, library: true, exits: false });
  const [slaBucket, setSlaBucket] = useState<"b1" | "b2" | "b3" | "b4">("b4");
  const [deficiencyTab, setDeficiencyTab] = useState<"grounds" | "rectified">("grounds");
  const [isAuditing, setIsAuditing] = useState(false);

  const jumpToCard = (targetIdx: number) => {
    const stageEl = document.querySelector(".skiper17-deck-stage");
    if (!stageEl) return;
    const rect = stageEl.getBoundingClientRect();
    const stageTop = window.scrollY + rect.top - 40;
    const totalDistance = window.innerHeight * (FEATURES.length - 0.75);
    const targetScroll = stageTop + (targetIdx / (FEATURES.length - 1)) * totalDistance;
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      const totalCards = cards.length;
      if (totalCards === 0) return;

      // Card 0 starts locked in place
      gsap.set(cards[0], { yPercent: 0, scale: 1, rotation: 0, opacity: 1 });

      // Following cards start pushed off the bottom
      for (let i = 1; i < totalCards; i++) {
        gsap.set(cards[i], { yPercent: 120, scale: 1, rotation: 0, opacity: 1 });
      }

      // GSAP Pinning Timeline matching skiper17
      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".skiper17-deck-stage",
          start: "top 40px",
          end: () => `+=${window.innerHeight * (totalCards - 0.75)}`,
          pin: true,
          scrub: 0.6,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const currentCardIdx = Math.min(
              totalCards - 1,
              Math.max(0, Math.round(self.progress * (totalCards - 1)))
            );
            setActiveDeckIndex(currentCardIdx);
          },
        },
      });

      for (let i = 0; i < totalCards - 1; i++) {
        const currentCard = cards[i];
        const nextCard = cards[i + 1];
        const position = i;

        // Current card scales down, rotates slightly and dims back
        const targetRotation = (i % 2 === 0 ? -4 : 4);
        scrollTimeline.to(
          currentCard,
          {
            scale: 0.88,
            rotation: targetRotation,
            filter: "brightness(0.65) blur(1px)",
            duration: 1,
            ease: "power2.inOut",
          },
          position
        );

        // Next card slides all the way up over it
        scrollTimeline.to(
          nextCard,
          {
            yPercent: 0,
            duration: 1,
            ease: "power2.out",
          },
          position
        );
      }

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
        scrollTimeline.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: containerRef }
  );

  return (
    <ReactLenis root>
      <section id="system-architecture-section" ref={containerRef} className="relative w-full">
        
        {/* 1. Header Section with Skiper70 Text Reveal */}
        <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-platinum-300 text-xs font-mono uppercase tracking-wider mb-6 shadow-glass-island">
            <Sparkles className="w-3.5 h-3.5 text-platinum-300" />
            <span>System Architecture & Regulatory Execution</span>
          </div>

          <TextBoxReveal highlightWords={["Autonomous", "Statutory", "AICTE", "Integrity", "Architecture"]}>
            Autonomous AICTE Approval Workflow Automation and SLA Compliance Architecture
          </TextBoxReveal>

          <p className="text-sm sm:text-base text-platinum-400 mt-4 max-w-2xl mx-auto leading-relaxed font-sans mb-6">
            Scroll down to enter the stacked deck, or select any statutory pillar below to inspect immediately.
          </p>

          {/* Quick-Jump Deck Navigation Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-charcoal-900/90 border border-white/15 backdrop-blur-xl shadow-glass-island max-w-full z-20 relative">
            {FEATURES.map((feat, fIdx) => (
              <button
                key={feat.id}
                type="button"
                onClick={() => jumpToCard(fIdx)}
                className={cn(
                  "px-3 sm:px-4 py-1.5 rounded-full text-xs font-mono transition-all duration-300 flex items-center gap-1.5 cursor-pointer select-none",
                  activeDeckIndex === fIdx
                    ? "bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.45)] scale-105"
                    : "text-platinum-400 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  activeDeckIndex === fIdx ? "bg-emerald-500" : "bg-white/30"
                )} />
                <span className="font-bold">0{fIdx + 1}</span>
                <span className="hidden sm:inline font-sans text-[11px]">{feat.title.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Skiper17 Pinning Stage */}
        <div className="skiper17-deck-stage relative w-full h-[90vh] flex items-center justify-center px-4 sm:px-8 overflow-hidden">
          <div className="relative w-full max-w-6xl h-[80vh] max-h-[720px]">
            {FEATURES.map((feature, idx) => (
              <div
                key={feature.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                className={cn(
                  "absolute inset-0 rounded-3xl border border-white/15 bg-charcoal-900/98 backdrop-blur-3xl",
                  "shadow-[0_30px_90px_-15px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.18)]",
                  "p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden will-change-transform"
                )}
                style={{ zIndex: idx + 10 }}
              >
                {/* Ambient Top Glow: Frosted Silver Sheen */}
                <div className="absolute top-0 right-10 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
                
                {/* Stack Indicator Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10 text-xs text-platinum-400 font-mono shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                    <span className="text-white font-bold uppercase tracking-wider">Module 0{idx + 1} / 0{FEATURES.length}</span>
                    <span className="text-platinum-500">·</span>
                    <span className="text-platinum-300 font-sans font-medium">{feature.tag}</span>
                  </div>
                  <span className="text-[11px] font-mono text-platinum-200 font-medium px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10">
                    {feature.metricValue}
                  </span>
                </div>

                {/* Card Main Body Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 flex-1 py-4 overflow-y-auto lg:overflow-visible">
                  
                  {/* Left Column: Narrative & Checklist */}
                  <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-5">
                    <div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight mb-2">
                        {feature.title}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-platinum-300 mb-4">
                        <span>{feature.subtitle}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-platinum-300 leading-relaxed mb-5 font-normal">
                        {feature.description}
                      </p>

                      {/* Checklist */}
                      <div className="space-y-2.5 pt-3 border-t border-white/10">
                        {feature.keyPoints.map((point, kIdx) => (
                          <div key={kIdx} className="flex items-start gap-2.5 text-xs text-platinum-200">
                            <CheckCircle2 className="w-4 h-4 text-platinum-300 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                      <span className="text-platinum-400 font-mono">{feature.metricLabel}</span>
                      <span className="font-mono text-platinum-100 font-bold px-2 py-0.5 rounded bg-charcoal-800 border border-white/10">
                        {feature.metricValue}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Live Interactive Mock Display */}
                  <div className="lg:col-span-7 h-full flex flex-col justify-center">
                    <div className="w-full rounded-2xl border border-white/10 bg-charcoal-950/80 p-5 shadow-2xl relative overflow-hidden">
                      {renderModuleConsole(feature.previewType, {
                        activeWorkflowStage,
                        setActiveWorkflowStage,
                        evcCheckpoints,
                        setEvcCheckpoints,
                        slaBucket,
                        setSlaBucket,
                        deficiencyTab,
                        setDeficiencyTab,
                        isAuditing,
                        setIsAuditing,
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Sub-bar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-platinum-500 shrink-0">
                  <span>AICTE 26262 Regulatory Platform</span>
                  <div className="flex items-center gap-1.5">
                    {FEATURES.map((_, dotIdx) => (
                      <span 
                        key={dotIdx} 
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          dotIdx === idx ? "bg-white w-4 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/20 w-1.5"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ReactLenis>
  );
}

// -------------------------------------------------------------
// Interactive Consoles for Each Regulatory Module
// -------------------------------------------------------------

interface ConsoleContext {
  activeWorkflowStage: "scrutiny" | "evc" | "sac" | "approval";
  setActiveWorkflowStage: (stage: "scrutiny" | "evc" | "sac" | "approval") => void;
  evcCheckpoints: { labs: boolean; library: boolean; exits: boolean };
  setEvcCheckpoints: React.Dispatch<React.SetStateAction<{ labs: boolean; library: boolean; exits: boolean }>>;
  slaBucket: "b1" | "b2" | "b3" | "b4";
  setSlaBucket: (b: "b1" | "b2" | "b3" | "b4") => void;
  deficiencyTab: "grounds" | "rectified";
  setDeficiencyTab: (tab: "grounds" | "rectified") => void;
  isAuditing: boolean;
  setIsAuditing: (v: boolean) => void;
}

function renderModuleConsole(type: FeatureItem["previewType"], ctx: ConsoleContext) {
  switch (type) {
    case "workflow": {
      const stages = [
        { id: "scrutiny", label: "Scrutiny", sub: "Completed", prereq: "Digital Signature & APH 2026 Checklist", satisfied: true },
        { id: "evc", label: "EVC Visit", sub: "In Progress", prereq: "Land Lease & Safety Certification", satisfied: true },
        { id: "sac", label: "SAC / SHC", sub: "Pending", prereq: "EVC Report Signed by Panel Chair", satisfied: false },
        { id: "approval", label: "Approval", sub: "Pending", prereq: "Executive Quorum Concurrence (Statutory Gate)", satisfied: false },
      ] as const;

      const current = stages.find((s) => s.id === ctx.activeWorkflowStage) || stages[1];

      return (
        <div className="space-y-4 select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-platinum-300">Live Stage Controller · APP-2026-1001</span>
            </div>
            <span className="text-platinum-400 text-[11px]">Click a stage to simulate gate</span>
          </div>
          
          <div className="p-3.5 rounded-xl bg-charcoal-900 border border-white/10">
            <span className="text-[11px] font-mono text-platinum-400 block mb-2 uppercase tracking-wider">
              Configured Stage Sequence:
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              {stages.map((st) => {
                const isSelected = ctx.activeWorkflowStage === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => ctx.setActiveWorkflowStage(st.id)}
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200 cursor-pointer text-left sm:text-center",
                      isSelected
                        ? "bg-white/[0.12] border-2 border-white text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-102"
                        : st.satisfied
                        ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/60"
                        : "bg-charcoal-800 border border-white/10 text-platinum-500 hover:text-platinum-300 hover:border-white/20"
                    )}
                  >
                    <span className="block truncate text-xs">{st.label}</span>
                    <span className={cn(
                      "block text-[10px] font-normal truncate",
                      isSelected ? "text-platinum-200" : st.satisfied ? "text-emerald-400/80" : "text-platinum-600"
                    )}>
                      {st.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-charcoal-900/60 border border-white/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 truncate">
              <Lock className="w-3.5 h-3.5 text-platinum-400 shrink-0" />
              <span className="text-platinum-300 truncate">Prerequisite: {current.prereq}</span>
            </div>
            <span className={cn(
              "shrink-0 font-semibold text-xs ml-2",
              current.satisfied ? "text-emerald-400" : "text-amber-400"
            )}>
              {current.satisfied ? "✓ Satisfied" : "🔒 Gate Enforced"}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-[11px] font-mono text-platinum-400 pt-1">
            <span>Stage Lock: No Skip Permitted</span>
            <span className="text-platinum-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
              Live Regulatory State <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      );
    }

    case "deficiency": {
      return (
        <div className="space-y-4 select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-platinum-300">Deficiency Audit Docket · APH §402</span>
            </div>
            {/* Interactive Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-charcoal-900 border border-white/10">
              <button
                type="button"
                onClick={() => ctx.setDeficiencyTab("grounds")}
                className={cn(
                  "px-2.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer",
                  ctx.deficiencyTab === "grounds"
                    ? "bg-white text-black font-semibold"
                    : "text-platinum-400 hover:text-white"
                )}
              >
                Deficiency Grounds
              </button>
              <button
                type="button"
                onClick={() => ctx.setDeficiencyTab("rectified")}
                className={cn(
                  "px-2.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer",
                  ctx.deficiencyTab === "rectified"
                    ? "bg-emerald-500 text-black font-semibold"
                    : "text-platinum-400 hover:text-white"
                )}
              >
                Rectified Upload
              </button>
            </div>
          </div>

          {ctx.deficiencyTab === "grounds" ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-charcoal-900 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-platinum-400">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Mandatory Return Grounds (Recorded):
                  </span>
                  <span className="text-platinum-300">Officer #402</span>
                </div>
                <p className="text-platinum-200 bg-charcoal-950/80 p-2.5 rounded border border-white/5 font-sans leading-relaxed">
                  "Building Structural Stability Certificate (Form B) provided by institution is missing the municipal endorsement seal."
                </p>
              </div>

              <div className="p-3 rounded-xl bg-charcoal-900 border border-white/10 space-y-2 text-xs font-mono">
                <span className="text-platinum-400 text-[11px] block uppercase">Requested Rectification Items:</span>
                <div className="flex items-center justify-between text-platinum-200">
                  <span>1. Endorsed Structural Certificate (PDF)</span>
                  <span className="text-amber-400 font-medium px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 text-[10px]">Missing Seal</span>
                </div>
                <div className="flex items-center justify-between text-platinum-200">
                  <span>2. Executive Trustee Affidavit</span>
                  <span className="text-emerald-400 font-medium px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[10px]">Accepted</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Institution Rectification Received:
                  </span>
                  <span className="text-platinum-300 font-mono">DOC-2026-991</span>
                </div>
                <p className="text-platinum-200 bg-charcoal-950/80 p-2.5 rounded border border-white/5 font-sans leading-relaxed">
                  "Uploaded: Structural_FormB_Municipal_Stamped.pdf. Sub-Registrar stamp #8842 verified. Historical timeline fully preserved."
                </p>
              </div>

              <div className="p-3 rounded-xl bg-charcoal-900 border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-platinum-300">Prior Rejection Event Preserved:</span>
                <span className="text-platinum-200 font-bold px-2 py-0.5 rounded bg-white/[0.05] border border-white/10">100% History Intact</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    case "evc": {
      const toggleCheckpoint = (key: "labs" | "library" | "exits") => {
        ctx.setEvcCheckpoints((prev) => ({ ...prev, [key]: !prev[key] }));
      };

      const verifiedCount = Object.values(ctx.evcCheckpoints).filter(Boolean).length;

      return (
        <div className="space-y-4 select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs font-mono">
            <span className="text-platinum-300">Expert Visit Committee (EVC) Radar</span>
            <span className="text-platinum-200 font-semibold px-2 py-0.5 rounded bg-white/[0.05] border border-white/10">Western Region</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-charcoal-900 border border-white/10">
              <span className="text-platinum-400 text-[11px] block mb-1">Scheduled Date:</span>
              <span className="text-white font-semibold text-sm">Nov 14, 2026</span>
              <span className="text-[10px] text-platinum-400 block mt-1">10:00 AM IST</span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900 border border-white/10">
              <span className="text-platinum-400 text-[11px] block mb-1">Assigned Panel:</span>
              <span className="text-white font-semibold text-sm">3 Senior Experts</span>
              <span className="text-[10px] text-emerald-400 block mt-1">Confirmed Acceptance</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-charcoal-900 border border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-mono text-platinum-400 text-[11px]">
              <span>On-Site Infrastructure Radar (Interactive)</span>
              <span className={cn("font-bold font-mono", verifiedCount === 3 ? "text-emerald-400" : "text-amber-400")}>
                {verifiedCount} of 3 Verified
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
              <button
                type="button"
                onClick={() => toggleCheckpoint("labs")}
                className={cn(
                  "p-2 rounded border transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                  ctx.evcCheckpoints.labs
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : "bg-charcoal-950 border-white/10 text-platinum-400 hover:text-white"
                )}
              >
                <span>Laboratories</span>
                <span className="text-[9px]">{ctx.evcCheckpoints.labs ? "✓ Satisfied" : "○ Pending"}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleCheckpoint("library")}
                className={cn(
                  "p-2 rounded border transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                  ctx.evcCheckpoints.library
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : "bg-charcoal-950 border-white/10 text-platinum-400 hover:text-white"
                )}
              >
                <span>Library Area</span>
                <span className="text-[9px]">{ctx.evcCheckpoints.library ? "✓ Satisfied" : "○ Pending"}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleCheckpoint("exits")}
                className={cn(
                  "p-2 rounded border transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                  ctx.evcCheckpoints.exits
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                    : "bg-charcoal-950 border-white/10 text-platinum-400 hover:text-white"
                )}
              >
                <span>Fire Exits</span>
                <span className="text-[9px]">{ctx.evcCheckpoints.exits ? "✓ Satisfied" : "○ Pending"}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    case "compliance": {
      return (
        <div className="space-y-4 select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs font-mono">
            <span className="text-platinum-300">Statutory Continuing Compliance Vault</span>
            <span className="text-amber-400 font-semibold font-mono">Expiring &lt;45 Days</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-charcoal-900 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">Campus Land Lease (30 Yrs)</span>
                <span className="text-[11px] text-platinum-400">Sub-Registrar Reg #9842</span>
              </div>
              <span className="text-amber-300 text-[11px] font-bold px-2 py-1 rounded bg-amber-950/60 border border-amber-500/40">
                Expires Dec 18
              </span>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-900 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="text-white font-semibold block">Fire Safety NOC (Form C)</span>
                <span className="text-[11px] text-platinum-400">State Fire Directorate</span>
              </div>
              <span className="text-emerald-400 text-[11px] font-semibold px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/30">
                Valid · 340 Days
              </span>
            </div>
          </div>

          <p className="text-[11px] text-platinum-400 font-sans leading-relaxed">
            Automated alerts trigger at 90, 60, and 30 days prior to legal expiration.
          </p>
        </div>
      );
    }

    case "sla": {
      const bucketData = {
        b1: { label: "< 7 Days", count: 48, status: "Normal Operation", note: "Routine processing: 48 dossiers actively advancing in regional scrutiny.", color: "text-emerald-400" },
        b2: { label: "7-14 Days", count: 22, status: "Nominal Review", note: "Advisory ping: 22 dossiers scheduled for committee review this week.", color: "text-platinum-200" },
        b3: { label: "15-30 Days", count: 7, status: "Priority Warning", note: "Warning alert: 7 dossiers approaching regional SLA threshold.", color: "text-amber-400" },
        b4: { label: "> 30 Days", count: 3, status: "Immediate Escalation", note: "Escalation Trigger: 3 dossiers escalated directly to Regional Director.", color: "text-rose-300" },
      };

      const selected = bucketData[ctx.slaBucket];

      return (
        <div className="space-y-4 select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs font-mono">
            <span className="text-platinum-300">SLA Ageing & Escalation Matrix</span>
            <span className="text-platinum-300 font-mono text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Escalation Scan
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            {(Object.keys(bucketData) as (keyof typeof bucketData)[]).map((key) => {
              const b = bucketData[key];
              const isSelected = ctx.slaBucket === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => ctx.setSlaBucket(key)}
                  className={cn(
                    "p-2 rounded-xl border transition-all cursor-pointer",
                    isSelected
                      ? "bg-white/[0.12] border-2 border-white scale-102 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                      : "bg-charcoal-900 border-white/10 hover:border-white/20"
                  )}
                >
                  <span className={cn("font-bold block text-sm", b.color)}>{b.count}</span>
                  <span className="text-[10px] text-platinum-400 block mt-0.5">{b.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono flex items-center justify-between">
            <span className="text-platinum-200 truncate pr-2">{selected.note}</span>
            <span className={cn("font-semibold px-2 py-0.5 rounded text-[10px] shrink-0", selected.color, "bg-white/[0.05] border border-white/10")}>
              {selected.status}
            </span>
          </div>
        </div>
      );
    }

    case "audit": {
      return (
        <div className="space-y-4 select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs font-mono">
            <span className="text-platinum-300">Append-Only Audit Ledger</span>
            <span className="text-platinum-400">SHA-256 Ledger Node</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-charcoal-900 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-platinum-400 text-[10px]">
                <span>2026-10-31T14:32:00Z</span>
                <span className="text-platinum-300">ACTOR: officer_scrutiny_02</span>
              </div>
              <div className="text-platinum-200">
                ACTION: <span className="text-white font-semibold">STAGE_TRANSITION</span> (SCRUTINY → EVC)
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-charcoal-900 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-platinum-400 text-[10px]">
                <span>2026-10-31T12:15:20Z</span>
                <span className="text-platinum-300">ACTOR: system_sla_watchdog</span>
              </div>
              <div className="text-platinum-200">
                ACTION: <span className="text-amber-400 font-semibold">ESCALATION_DISPATCHED</span> (APP-2026-088)
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-platinum-300">Hash Checksum Verified: 0x8f2a...c4b1</span>
            </div>
            <span className="text-emerald-400 text-[11px] font-bold">100% Tamper Proof</span>
          </div>
        </div>
      );
    }
  }
}

export default AppleFeatureBlock;
