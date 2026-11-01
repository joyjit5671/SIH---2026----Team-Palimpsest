'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface AnimatedDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  labelPrefix?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  placeholder?: string;
}

export const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
  options,
  value,
  onChange,
  labelPrefix,
  icon,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  placeholder = 'Select option',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs text-white font-medium transition-all duration-200 cursor-pointer shadow-sm select-none ${buttonClassName} ${
          isOpen ? 'ring-2 ring-white/20 border-white/30 bg-white/[0.08]' : ''
        }`}
      >
        {icon && <span className="text-platinum-400 shrink-0">{icon}</span>}
        {labelPrefix && (
          <span className="text-platinum-400 font-mono text-[11px] uppercase tracking-wider">{labelPrefix}</span>
        )}
        <span className="truncate max-w-[200px] font-sans font-semibold">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {selectedOption?.badge && (
          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${selectedOption.badgeColor || 'bg-white/10 text-platinum-300 border-white/15'}`}>
            {selectedOption.badge}
          </span>
        )}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="text-platinum-400 ml-1 shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={`absolute right-0 mt-1.5 z-50 min-w-[220px] bg-[#0C0F17]/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-1.5 space-y-0.5 overflow-hidden ${menuClassName}`}
          >
            <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors duration-150 cursor-pointer text-left ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-platinum-200 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      {opt.icon && <span className={isSelected ? 'text-black' : 'text-platinum-400'}>{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      {opt.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${
                            isSelected
                              ? 'bg-black/10 text-black border-black/20'
                              : opt.badgeColor || 'bg-white/10 text-platinum-300 border-white/15'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[2.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
