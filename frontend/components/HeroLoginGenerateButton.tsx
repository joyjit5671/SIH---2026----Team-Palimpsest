"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface HeroLoginGenerateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onLogin?: () => void;
  className?: string;
}

export function HeroLoginGenerateButton({
  onLogin,
  className,
  ...props
}: HeroLoginGenerateButtonProps) {
  const [isBuffering, setIsBuffering] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isBuffering) return;
    setIsBuffering(true);
    // Buffer for 2.2 seconds with Vengeance wave animation, then call onLogin if provided
    setTimeout(() => {
      setIsBuffering(false);
      onLogin?.();
    }, 2200);
  };

  return (
    <div className={cn("relative inline-block group select-none", className)}>
      <style>{`
        .veng-hero-btn {
          --border-radius: 9999px;
          --padding: 5px;
          --transition: 0.4s;
          --button-color: #0E1116;

          user-select: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 1rem 2.2rem;
          font-family: var(--font-outfit), "Plus Jakarta Sans", sans-serif;
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: 0.02em;

          background: linear-gradient(135deg, #1A1F29 0%, #0E1117 50%, #151A22 100%);

          box-shadow:
            inset 0px 1px 2px rgba(255, 255, 255, 0.4),
            inset 0px 2px 4px rgba(255, 255, 255, 0.15),
            inset 0px -2px 4px rgba(0, 0, 0, 0.8),
            0px 4px 16px rgba(0, 0, 0, 0.6),
            0px 0px 25px rgba(226, 232, 240, 0.15);

          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: var(--border-radius);
          cursor: pointer;
          backdrop-blur: 16px;

          transition: all var(--transition) cubic-bezier(0.16, 1, 0.3, 1);
        }

        .veng-hero-btn::before {
          content: "";
          position: absolute;
          top: calc(0px - var(--padding));
          left: calc(0px - var(--padding));
          width: calc(100% + var(--padding) * 2);
          height: calc(100% + var(--padding) * 2);
          border-radius: calc(var(--border-radius) + var(--padding));
          pointer-events: none;
          background-image: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.6));
          z-index: -1;
          transition: all var(--transition);
          box-shadow:
            0 -8px 12px -6px rgba(0,0,0,0) inset,
            1px 1px 2px rgba(255,255,255,0.18),
            -1px -1px 2px rgba(0,0,0,0.4);
        }

        .veng-hero-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background-image: linear-gradient(
            0deg,
            #FFFFFF,
            rgba(226, 232, 240, 0.9),
            rgba(255, 255, 255, 0.3),
            12%,
            transparent
          );
          opacity: 0;
          transition: opacity var(--transition);
        }

        .veng-btn-letter {
          position: relative;
          display: inline-block;
          color: rgba(248, 250, 252, 0.75);
          animation: veng-letter-glow 2s ease-in-out infinite;
          transition: all var(--transition);
        }

        @keyframes veng-letter-glow {
          50% {
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.9), 0 0 16px rgba(226, 232, 240, 0.6);
            color: #FFFFFF;
          }
        }

        .veng-btn-icon {
          width: 22px;
          height: 22px;
          margin-right: 0.75rem;
          stroke: #F8FAFC;
          stroke-width: 2;
          fill: none;
          filter: drop-shadow(0 0 4px rgba(255,255,255,0.7));
          transition: all var(--transition);
        }

        .veng-txt-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          height: 1.5rem;
          min-width: 9.5rem;
        }

        .veng-txt-idle,
        .veng-txt-buffering {
          position: absolute;
          left: 0;
          white-space: nowrap;
          display: flex;
          align-items: center;
        }

        .veng-txt-idle {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .veng-txt-buffering {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        /* Hover states */
        .veng-hero-btn:hover {
          border-color: rgba(255, 255, 255, 0.55);
          box-shadow:
            inset 0px 1px 3px rgba(255, 255, 255, 0.6),
            0px 0px 30px rgba(226, 232, 240, 0.35),
            0px 8px 24px rgba(0, 0, 0, 0.7);
          transform: translateY(-1.5px) scale(1.02);
        }

        .veng-hero-btn:hover::after {
          opacity: 0.85;
          mask-image: linear-gradient(0deg, #fff, transparent);
        }

        .veng-hero-btn:hover .veng-btn-icon {
          filter: drop-shadow(0 0 8px #FFF) drop-shadow(0 0 14px rgba(226, 232, 240, 0.8));
          transform: scale(1.1);
        }

        /* Buffering / Generating Active State */
        .veng-hero-btn[data-buffering="true"] {
          border-color: rgba(255, 255, 255, 0.85);
          box-shadow:
            inset 0px 1px 4px rgba(255, 255, 255, 0.8),
            0px 0px 40px rgba(255, 255, 255, 0.5),
            0px 10px 30px rgba(0, 0, 0, 0.8);
        }

        .veng-hero-btn[data-buffering="true"] .veng-txt-idle {
          opacity: 0;
          transform: translateY(-8px);
        }

        .veng-hero-btn[data-buffering="true"] .veng-txt-buffering {
          opacity: 1;
          transform: translateY(0);
        }

        .veng-hero-btn[data-buffering="true"] .veng-btn-icon {
          animation: veng-icon-pulse 1s linear infinite;
        }

        @keyframes veng-icon-pulse {
          0%, 100% {
            stroke: #FFFFFF;
            filter: drop-shadow(0 0 8px #FFFFFF);
          }
          50% {
            stroke: #94A3B8;
            filter: drop-shadow(0 0 2px #94A3B8);
          }
        }

        .veng-hero-btn[data-buffering="true"] .veng-btn-letter {
          animation: veng-wave-glow 1.2s ease-in-out infinite;
        }

        @keyframes veng-wave-glow {
          0%, 100% {
            color: rgba(226, 232, 240, 0.35);
            text-shadow: 0 0 1px rgba(255, 255, 255, 0.2);
            transform: scale(1);
          }
          50% {
            color: #FFFFFF;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.95), 0 0 18px rgba(226, 232, 240, 0.75);
            transform: scale(1.12);
          }
        }

        /* Animation delays for letters */
        .veng-btn-letter:nth-child(1) { animation-delay: 0s; }
        .veng-btn-letter:nth-child(2) { animation-delay: 0.08s; }
        .veng-btn-letter:nth-child(3) { animation-delay: 0.16s; }
        .veng-btn-letter:nth-child(4) { animation-delay: 0.24s; }
        .veng-btn-letter:nth-child(5) { animation-delay: 0.32s; }
        .veng-btn-letter:nth-child(6) { animation-delay: 0.40s; }
        .veng-btn-letter:nth-child(7) { animation-delay: 0.48s; }
        .veng-btn-letter:nth-child(8) { animation-delay: 0.56s; }
        .veng-btn-letter:nth-child(9) { animation-delay: 0.64s; }
        .veng-btn-letter:nth-child(10) { animation-delay: 0.72s; }
        .veng-btn-letter:nth-child(11) { animation-delay: 0.80s; }
        .veng-btn-letter:nth-child(12) { animation-delay: 0.88s; }
        .veng-btn-letter:nth-child(13) { animation-delay: 0.96s; }
        .veng-btn-letter:nth-child(14) { animation-delay: 1.04s; }
        .veng-btn-letter:nth-child(15) { animation-delay: 1.12s; }
        .veng-btn-letter:nth-child(16) { animation-delay: 1.20s; }
      `}</style>

      <button
        type="button"
        className="veng-hero-btn"
        data-buffering={isBuffering}
        onClick={handleClick}
        {...props}
      >
        <svg className="veng-btn-icon" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>

        <div className="veng-txt-wrapper">
          <div className="veng-txt-idle">
            <span>Login / Sign-in</span>
          </div>
          <div className="veng-txt-buffering">
            {"Authenticating...".split("").map((letter, i) => (
              <span key={`b-${i}`} className="veng-btn-letter">{letter}</span>
            ))}
          </div>
        </div>
      </button>
    </div>
  );
}

export default HeroLoginGenerateButton;
