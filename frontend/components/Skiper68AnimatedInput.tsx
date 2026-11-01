"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Skiper68AnimatedInputProps {
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  isError?: boolean;
  className?: string;
}

export function Skiper68AnimatedInput({
  value,
  onChange,
  maxLength = 6,
  isError = false,
  className,
}: Skiper68AnimatedInputProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Focus hidden input on click of the container
  const handleContainerClick = () => {
    hiddenInputRef.current?.focus();
  };

  useEffect(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const chars = value.split("");

  return (
    <div
      onClick={handleContainerClick}
      className={cn(
        "relative flex items-center justify-center gap-2.5 sm:gap-3 py-3 px-2 cursor-text select-none",
        className
      )}
    >
      {/* Hidden native input for mobile and keyboard capture */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={maxLength}
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/[^0-9]/g, "");
          onChange(val);
        }}
        className="absolute inset-0 opacity-0 pointer-events-auto cursor-text"
      />

      {/* 6 Animated Pin Slots (skiper68 rolling tumbler animation) */}
      {Array.from({ length: maxLength }).map((_, index) => {
        const char = chars[index] || "";
        const isCurrent = index === chars.length;

        return (
          <div
            key={index}
            className={cn(
              "relative w-12 h-16 sm:w-14 sm:h-18 rounded-2xl flex items-center justify-center overflow-hidden",
              "bg-[#0E121A] border transition-all duration-300",
              isError
                ? "border-red-500/80 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                : isCurrent
                ? "border-white/80 bg-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                : char
                ? "border-white/30 bg-charcoal-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                : "border-white/10 hover:border-white/20"
            )}
          >
            {/* Ambient metallic inner bevel */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-black/60" />

            {/* Tumbler Slot for Digit */}
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="popLayout" initial={false}>
                {char ? (
                  <motion.span
                    key={`${index}-${char}`}
                    initial={{ y: 28, opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ y: -28, opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 28,
                      mass: 0.6,
                    }}
                    className={cn(
                      "font-mono text-2xl sm:text-3xl font-extrabold tracking-tight",
                      isError ? "text-red-300" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    )}
                  >
                    {char}
                  </motion.span>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center"
                  >
                    {/* Blinking vertical cursor line for active slot */}
                    {isCurrent ? (
                      <motion.div
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                        className="w-0.5 h-6 rounded-full bg-white shadow-[0_0_8px_#FFF]"
                      />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Skiper68AnimatedInput;
