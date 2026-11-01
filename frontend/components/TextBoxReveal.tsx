"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextBoxRevealProps {
  children: string;
  className?: string;
  highlightWords?: string[];
  highlightClass?: string;
}

export function TextBoxReveal({
  children,
  className,
  highlightWords = ["Autonomous", "Statutory", "AICTE", "Human", "Integrity", "Architecture"],
  highlightClass = "text-transparent bg-clip-text bg-gradient-to-b from-white via-platinum-100 to-platinum-300 font-extrabold drop-shadow-[0_2px_20px_rgba(255,255,255,0.35)]",
}: TextBoxRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.45"],
  });

  const words = children.split(" ");

  return (
    <div ref={containerRef} className={cn("relative py-6 max-w-4xl mx-auto", className)}>
      <p className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-2xl sm:text-4xl lg:text-5xl font-display tracking-tight leading-tight text-center">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          const cleanWord = word.replace(/[^a-zA-Z]/g, "");
          const isHighlight = highlightWords.some(
            (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
          );

          return (
            <WordReveal
              key={i}
              word={word}
              progress={scrollYProgress}
              range={[start, end]}
              isHighlight={isHighlight}
              highlightClass={highlightClass}
            />
          );
        })}
      </p>
    </div>
  );
}

function WordReveal({
  word,
  progress,
  range,
  isHighlight,
  highlightClass,
}: {
  word: string;
  progress: any;
  range: [number, number];
  isHighlight: boolean;
  highlightClass: string;
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  const y = useTransform(progress, range, [10, 0]);

  return (
    <motion.span
      style={{ opacity, y }}
      className={cn(
        "transition-all duration-150 inline-block",
        isHighlight
          ? highlightClass
          : "text-platinum-300/80 font-medium drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
      )}
    >
      {word}
    </motion.span>
  );
}

export default TextBoxReveal;
