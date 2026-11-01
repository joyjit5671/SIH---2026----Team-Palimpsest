"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ArrowDownRight } from "lucide-react";

export interface SpotlightNavbarProps {
  className?: string;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onScrollToArchitecture?: () => void;
}

export function SpotlightNavbar({
  className,
  onOpenPrivacy,
  onOpenTerms,
  onScrollToArchitecture,
}: SpotlightNavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const spotlightX = useRef(0);

  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = nav.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setHoverX(x);
      spotlightX.current = x;
      nav.style.setProperty("--spotlight-x", `${x}px`);
    };

    const handleMouseLeave = () => {
      setHoverX(null);
    };

    nav.addEventListener("mousemove", handleMouseMove);
    nav.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      nav.removeEventListener("mousemove", handleMouseMove);
      nav.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleHowWeWorkClick = () => {
    if (onScrollToArchitecture) {
      onScrollToArchitecture();
    } else {
      const el = document.getElementById("system-architecture-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className={cn("fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none", className)}>
      <nav
        ref={navRef}
        className={cn(
          "pointer-events-auto relative h-13 rounded-full px-4 sm:px-6 py-2 flex items-center justify-between gap-4 sm:gap-7",
          "border border-white/15 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.18)]",
          "transition-all duration-300 overflow-hidden backdrop-blur-2xl"
        )}
        style={{
          background: "linear-gradient(135deg, rgba(30, 36, 48, 0.88) 0%, rgba(12, 14, 20, 0.95) 55%, rgba(24, 28, 38, 0.9) 100%)",
        }}
      >
        {/* Subtle Silver Metallic Edge Tint */}
        <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-r from-platinum-200/5 via-white/10 to-platinum-300/5" />

        {/* Brand / Emblem */}
        <div className="relative flex items-center space-x-2.5 z-10">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/20 bg-charcoal-900 p-0.5 shadow-sm">
            <Image src="/aicte-logo.png" alt="AICTE" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-display font-bold text-white tracking-tight flex items-center gap-1.5">
              ApprovalFlow AI
              <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-platinum-300 border border-white/15">
                26262
              </span>
            </span>
          </div>
        </div>

        {/* CTAs with Vengeance Spotlight Hover */}
        <div className="relative flex items-center gap-2 sm:gap-4 z-10">
          <button
            onClick={onOpenPrivacy}
            className="px-3 py-1.5 text-xs font-medium text-platinum-300 hover:text-white rounded-full transition-colors duration-200"
          >
            Privacy Policy
          </button>

          <button
            onClick={onOpenTerms}
            className="px-3 py-1.5 text-xs font-medium text-platinum-300 hover:text-white rounded-full transition-colors duration-200"
          >
            Terms & Conditions
          </button>

          {/* Precision Metallic Pill: "How we Work?" */}
          <button
            type="button"
            onClick={handleHowWeWorkClick}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full",
              "text-xs font-semibold font-display tracking-tight text-white",
              "bg-gradient-to-r from-[#2A313D] via-[#1A1F29] to-[#252C37]",
              "border border-white/30 hover:border-white/60",
              "shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_10px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.15)]",
              "hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),0_0_20px_rgba(255,255,255,0.3)]",
              "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            )}
          >
            <span>How we Work?</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-platinum-300 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Vengeance UI Spotlight Layer (Fluid Cursor Follower) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300"
          style={{
            opacity: hoverX !== null ? 1 : 0,
            background: `radial-gradient(140px circle at var(--spotlight-x, 0px) 50%, rgba(226, 232, 240, 0.22) 0%, rgba(255, 255, 255, 0.08) 45%, transparent 70%)`
          }}
        />

        {/* Bottom Ambient Line */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-platinum-200/25 to-transparent z-10" />
      </nav>
    </div>
  );
}

export default SpotlightNavbar;
