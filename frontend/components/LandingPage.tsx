'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveParticles } from './InteractiveParticles';
import { SpotlightNavbar } from './SpotlightNavbar';
import { AppleFeatureBlock } from './AppleFeatureBlock';
import { FullscreenLiquidSurface } from './FullscreenLiquidSurface';
import { PlatinumWineParticles } from './PlatinumWineParticles';
import { HeroLoginGenerateButton } from './HeroLoginGenerateButton';
import { AuthSidebar } from './AuthSidebar';
import { Sparkles, ShieldCheck, CheckCircle2, ChevronDown, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAuth?: () => void;
}

export default function LandingPage({ onOpenPrivacy, onOpenTerms, onOpenAuth }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLiquidReady = () => {
    setTimeout(() => {
      setShowNavbar(true);
    }, 400);
  };

  const handleOpenAuthSidebar = () => {
    setIsAuthOpen(true);
  };

  const handleAuthComplete = () => {
    setIsAuthOpen(false);
    onOpenAuth?.();
  };

  if (!mounted) {
    return (
      <div className="relative min-h-screen bg-[#000000] text-platinum-100" />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#000000] text-platinum-100 selection:bg-white/20 selection:text-white">
      
      {/* 1. Spotlight Navbar */}
      <AnimatePresence>
        {showNavbar && (
          <motion.div
            initial={{ y: -60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
          >
            <SpotlightNavbar
              onOpenPrivacy={onOpenPrivacy}
              onOpenTerms={onOpenTerms}
              onScrollToArchitecture={() => {
                const el = document.getElementById("system-architecture-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Screen Hero: Fullscreen Liquid WebGL Surface + Left Title + Right Vengeance UI Login Button */}
      <section className="relative w-screen h-screen flex flex-col justify-between bg-[#000000] overflow-hidden px-6 sm:px-12 lg:px-20 pt-28 pb-10">
        
        {/* Fullscreen Interactive Liquid Wave Surface (Ping-Pong FBO wave equation) */}
        <FullscreenLiquidSurface
          onFormed={handleLiquidReady}
          className="absolute inset-0 w-full h-full z-0 cursor-crosshair"
        />

        {/* Floating Ambient Platinum & Deep Wine Red Particles */}
        <PlatinumWineParticles />

        {/* Ambient Silver Sheen */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

        {/* TOP: Left-aligned Institutional Badge */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-start pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/15 text-platinum-200 text-xs font-mono uppercase tracking-widest backdrop-blur-md pointer-events-auto shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#FFF] animate-pulse" />
            <span className="text-white font-medium">AICTE Problem Statement 26262</span>
            <span className="text-white/30">·</span>
            <span className="text-platinum-300">Approval Workflow Engine</span>
          </motion.div>
        </div>

        {/* MIDDLE / BOTTOM: 2-Column Responsive Grid */}
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pointer-events-none pb-4">
          
          {/* LEFT COLUMN: Main Title, Subheadings & Badges */}
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            
            {/* Main Title Row: Dynamic Logo 'A' */}
            <div className="overflow-visible pb-2 flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="flex items-center gap-x-2 select-none"
              >
                {/* THE RE-ENGINEERED DYNAMIC 'A' FROM THE LOGO */}
                <motion.div
                  animate={{ 
                    y: [0, -3, 0],
                    filter: [
                      "drop-shadow(0 0 14px rgba(255,255,255,0.4))",
                      "drop-shadow(0 0 28px rgba(255,255,255,0.75))",
                      "drop-shadow(0 0 14px rgba(255,255,255,0.4))"
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                  className="relative w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 -mr-1 shrink-0 flex items-center justify-center"
                >
                  <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full object-contain overflow-visible"
                  >
                    <defs>
                      <linearGradient id="platGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="50%" stopColor="#E2E8F0" />
                        <stop offset="100%" stopColor="#94A3B8" />
                      </linearGradient>
                      <linearGradient id="platGradSwoosh" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F8FAFC" />
                        <stop offset="100%" stopColor="#64748B" />
                      </linearGradient>
                      <linearGradient id="platGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E2E8F0" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                    </defs>

                    {/* Left Dynamic Arch */}
                    <path
                      d="M 48 8 C 50 8 52 10 50 14 L 18 80 C 17 82 14 83 12 80 C 10 78 12 74 15 70 L 44 12 C 45 9 46 8 48 8 Z"
                      fill="url(#platGradMain)"
                    />

                    {/* Right Bold Leg */}
                    <path
                      d="M 47 11 L 76 80 C 78 83 75 85 70 85 L 60 85 C 57 85 55 83 54 80 L 40 46 L 47 11 Z"
                      fill="url(#platGradRight)"
                    />

                    {/* Inner dynamic crossbar */}
                    <path
                      d="M 37 49 L 58 49 L 55 57 L 33 57 Z"
                      fill="url(#platGradMain)"
                    />

                    {/* Orbital Dynamic Swoosh */}
                    <path
                      d="M 12 80 C 24 75 42 66 65 62 C 84 59 92 48 88 38 C 85 30 76 34 71 39 C 68 42 68 44 71 45 C 75 46 80 43 82 46 C 84 51 76 56 62 59 C 40 64 24 73 12 80 Z"
                      fill="url(#platGradSwoosh)"
                    />
                  </svg>
                </motion.div>

                {/* Remainder of the word "pproval AI" */}
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-platinum-100 to-platinum-400">
                  pproval AI
                </h1>
              </motion.div>
            </div>

            {/* Subheading 1: Pure Platinum Primary Line */}
            <motion.p
              initial={{ opacity: 0, x: -45 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.35 }}
              className="text-base sm:text-lg lg:text-xl text-platinum-100 font-sans font-light mt-3 max-w-2xl leading-relaxed"
            >
              Integrated Statutory Approval Workflow Automation, Real-Time Compliance Monitoring, and Deterministic SLA Escalation.
            </motion.p>

            {/* Subheading 2: Secondary Line */}
            <motion.p
              initial={{ opacity: 0, x: -35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.5 }}
              className="text-xs sm:text-sm text-platinum-400 font-sans mt-2 max-w-xl leading-relaxed"
            >
              Enforcing immutable audit trails, multi-stage scrutiny gates, and proactive land & safety tenure defense across national regulatory queues.
            </motion.p>

            {/* Feature Badges: Left-aligned in Platinum & Black */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/10 pointer-events-auto"
            >
              <div className="flex items-center gap-2 text-xs font-mono text-platinum-200 bg-white/[0.04] px-3.5 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-platinum-200" />
                <span>Zero Autonomous Decisions</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-platinum-200 bg-white/[0.04] px-3.5 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-platinum-300" />
                <span>Tamper-Evident SHA Audit</span>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Vengeance UI Generate Button & Live Regulatory Telemetry */}
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center pointer-events-auto mt-6 lg:mt-0 pb-6 lg:pb-8">
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="flex flex-col items-start lg:items-end gap-3.5 w-full sm:w-auto"
            >
              {/* Vengeance UI Generate Button -> Opens Auth Sidebar */}
              <HeroLoginGenerateButton onLogin={handleOpenAuthSidebar} />
              
              <span className="text-[11px] font-mono text-platinum-500 tracking-wider">
                Official Regulatory Portal Access · 2026-27
              </span>

              {/* Live Statutory Grid Telemetry Ticker */}
              <div className="w-full max-w-xs p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md text-[11px] font-mono space-y-2 shadow-glass-island mt-1">
                <div className="flex items-center justify-between text-platinum-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white font-semibold">REGULATORY TELEMETRY</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30">LIVE</span>
                </div>
                <div className="flex items-center justify-between text-platinum-300 pt-1.5 border-t border-white/5">
                  <span className="text-platinum-400">Active Dossiers:</span>
                  <span className="text-white font-bold">4,812 Monitored</span>
                </div>
                <div className="flex items-center justify-between text-platinum-300">
                  <span className="text-platinum-400">Statutory Gates:</span>
                  <span className="text-emerald-400 font-bold">0 Skips Allowed</span>
                </div>
                <div className="flex items-center justify-between text-platinum-300">
                  <span className="text-platinum-400">SLA Watchdog:</span>
                  <span className="text-platinum-200">99.4% Nominal</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Scroll Indicator Prompt - Clickable Magnetic Pill */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          onClick={() => {
            document.getElementById("system-architecture-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="absolute bottom-4 right-8 sm:right-12 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/30 text-xs text-platinum-400 hover:text-white font-mono backdrop-blur-md transition-all duration-300 cursor-pointer group shadow-glass-island z-20"
        >
          <span>Explore Architecture</span>
          <ChevronDown className="w-3.5 h-3.5 text-platinum-300 group-hover:translate-y-0.5 transition-transform" />
        </motion.button>
      </section>

      {/* 3. Section 2: Apple-style Feature Block (skiper17 stacked GSAP deck) */}
      <div className="relative z-10 bg-gradient-to-b from-[#000000] via-[#0A0C10] to-[#07090D] border-t border-white/10">
        <AppleFeatureBlock />
      </div>

      {/* 4. Section 3 (Bottom): AICTE Emblem Interactive Particles Section */}
      <section className="relative w-screen min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#000000] border-t border-white/10 py-16">
        
        {/* Section Heading */}
        <div className="relative z-10 text-center mb-6 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-platinum-300 text-xs font-mono uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-platinum-300" />
            <span>Statutory Seal & Emblem Verification</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">
            All India Council for Technical Education
          </h2>
          <p className="text-xs sm:text-sm text-platinum-400 max-w-lg mx-auto mt-2 font-mono">
            Interactive GPU particle matrix · Hover or drag across the emblem below to scatter and reform
          </p>
        </div>

        {/* AICTE Particle Canvas Container */}
        <div className="w-full h-[650px] relative cursor-crosshair">
          <InteractiveParticles
            src="/aicte-particles.png"
            background="#000000"
            color="#ffffff"
            size={1.4}
            randomness={2.0}
            depth={3.5}
            touchRadius={0.22}
            allowUpload={false}
            className="w-full h-full"
          />
        </div>

        {/* Grand Finale Closure CTA */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 mt-8 mb-16 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#11141C] to-[#0A0D12] border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-white/[0.04] blur-2xl rounded-full pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-platinum-300 text-xs font-mono uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Full Autonomous Regulatory Stack</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight mb-3">
              Ready to Experience Autonomous Regulatory Governance?
            </h3>
            <p className="text-sm sm:text-base text-platinum-300 max-w-xl mx-auto mb-8 font-light leading-relaxed">
              Step into the Scrutiny Officer console, trigger simulated statutory inspections, or verify immutable SHA-256 audit ledgers in real time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-display font-semibold text-sm hover:bg-platinum-100 transition shadow-[0_0_30px_rgba(255,255,255,0.35)] flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <span>Launch Officer Sandbox</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById("system-architecture-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/[0.05] border border-white/15 text-platinum-300 hover:text-white hover:border-white/30 transition text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Review Architecture Deck</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full mt-4 py-8 border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-platinum-400 gap-4 relative z-10">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-platinum-200 font-display">ApprovalFlow AI</span>
            <span>·</span>
            <span>SIH 2026 Problem Statement 26262</span>
          </div>

          <div className="flex items-center space-x-6">
            <button onClick={onOpenPrivacy} className="hover:text-white transition">
              Privacy Policy
            </button>
            <button onClick={onOpenTerms} className="hover:text-white transition">
              Terms & Conditions
            </button>
            <span className="text-platinum-600">|</span>
            <span className="text-[11px] text-platinum-500">Regulation Bureau © 2026</span>
          </div>
        </footer>
      </section>

      {/* 5. Two-Screen Auth Sidebar Drawer */}
      <AuthSidebar
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={handleAuthComplete}
      />

    </div>
  );
}
