'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export default function InfoModal({ isOpen, type, onClose }: InfoModalProps) {
  if (!isOpen || !type) return null;

  const isPrivacy = type === 'privacy';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md"
        />

        {/* Floating Modal Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-charcoal-900 border border-platinum-200/20 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 text-platinum-200 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-platinum-200/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-charcoal-800 border border-white/15 text-platinum-200">
                {isPrivacy ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isPrivacy ? 'Privacy & Data Governance Policy' : 'Terms & Regulatory Conditions of Use'}
                </h3>
                <span className="text-[11px] font-mono text-platinum-400">AICTE PS4 26262 Regulatory Framework</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-platinum-400 hover:text-white hover:bg-charcoal-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="py-5 space-y-4 text-xs sm:text-sm text-platinum-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
            {isPrivacy ? (
              <>
                <div className="p-3.5 rounded-xl bg-charcoal-950 border border-platinum-200/10 text-platinum-200">
                  <strong className="text-white block mb-1">1. Statutory Data Confidentiality</strong>
                  All institution application dossiers, architectural blueprints, land lease agreements, and expert visit evaluations are strictly confidential regulatory records under the jurisdiction of the AICTE Regulation Bureau.
                </div>
                <div className="p-3.5 rounded-xl bg-charcoal-950 border border-platinum-200/10 text-platinum-200">
                  <strong className="text-white block mb-1">2. Private Storage Keys & Access Controls</strong>
                  No sensitive documents are accessible via public URLs. In compliance with TRD Section 9, all document retrieval employs short-lived, authorization-verified private storage references.
                </div>
                <div className="p-3.5 rounded-xl bg-charcoal-950 border border-platinum-200/10 text-platinum-200">
                  <strong className="text-white block mb-1">3. Immutable Audit Trails</strong>
                  Every login, document review, deficiency return, and approval transition logs the actor identity, IP, and UTC timestamp into an append-only audit registry that cannot be modified or purged by any officer.
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-charcoal-950 border border-platinum-200/10 text-platinum-200">
                  <strong className="text-white block mb-1">1. Statutory Decision Boundary (APH 2026-27)</strong>
                  ApprovalFlow AI is an administrative coordination platform. Automation assists with stage eligibility, document expiry radar, and deadline escalation. All statutory approvals or rejections require explicit, authorized human signature.
                </div>
                <div className="p-3.5 rounded-xl bg-charcoal-950 border border-platinum-200/10 text-platinum-200">
                  <strong className="text-white block mb-1">2. Mandatory Return Justification</strong>
                  Officers returning an application for clarification are legally required to provide specific factual deficiency grounds and an explicit checklist of items for institutional rectification.
                </div>
                <div className="p-3.5 rounded-xl bg-charcoal-950 border border-platinum-200/10 text-platinum-200">
                  <strong className="text-white block mb-1">3. False Disclosure Penalties</strong>
                  Any uploaded falsified land lease, faculty roster, or structural safety affidavit constitutes a breach of the Approval Process Handbook and initiates automatic regulatory escalation.
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-platinum-200/10 flex items-center justify-between">
            <span className="text-[11px] text-platinum-500 font-mono">Last updated: Academic Year 2026-27</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-charcoal-700 border border-platinum-200/20 transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
