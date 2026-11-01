'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  FileText,
  Building2,
  FolderKanban,
  Scale,
  Flame,
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Command,
  CornerDownLeft,
  Tag,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { ApplicationSummary, UndertakingItem, DocumentItem, EVCItem } from '../types/api';

export interface VengeanceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: ApplicationSummary[];
  complianceList: UndertakingItem[];
  documents: DocumentItem[];
  evcQueue: EVCItem[];
  onSelectApplication: (id: string) => void;
  onSelectUndertaking: (u: UndertakingItem) => void;
  onSelectDocument: (doc: DocumentItem) => void;
  onSelectEVC: (evc: EVCItem) => void;
  onTriggerWatchdog: () => void;
  onSelectRole: (role: any) => void;
  onNavigateTab: (tab: any) => void;
}

export const VengeanceSearchModal: React.FC<VengeanceSearchModalProps> = ({
  isOpen,
  onClose,
  applications,
  complianceList,
  documents,
  evcQueue,
  onSelectApplication,
  onSelectUndertaking,
  onSelectDocument,
  onSelectEVC,
  onTriggerWatchdog,
  onSelectRole,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedCategory('ALL');
    }
  }, [isOpen]);

  // Handle global Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'All Items' },
    { id: 'APPLICATIONS', label: 'Applications', count: applications.length },
    { id: 'COMPLIANCE', label: 'Compliance', count: complianceList.length },
    { id: 'DOCUMENTS', label: 'Documents Vault', count: documents.length },
    { id: 'EVC', label: 'EVC Inspections', count: evcQueue.length },
    { id: 'ACTIONS', label: 'Quick Actions' },
  ];

  // Search Results Filtering
  const cleanQ = query.trim().toLowerCase();

  const filteredApps = (selectedCategory === 'ALL' || selectedCategory === 'APPLICATIONS')
    ? applications.filter(
        (a) =>
          !cleanQ ||
          a.application_number.toLowerCase().includes(cleanQ) ||
          a.institution_name.toLowerCase().includes(cleanQ) ||
          a.current_stage.toLowerCase().includes(cleanQ) ||
          a.region.toLowerCase().includes(cleanQ)
      )
    : [];

  const filteredCompliance = (selectedCategory === 'ALL' || selectedCategory === 'COMPLIANCE')
    ? complianceList.filter(
        (c) =>
          !cleanQ ||
          c.title.toLowerCase().includes(cleanQ) ||
          (c.institution_name && c.institution_name.toLowerCase().includes(cleanQ)) ||
          c.status.toLowerCase().includes(cleanQ)
      )
    : [];

  const filteredDocs = (selectedCategory === 'ALL' || selectedCategory === 'DOCUMENTS')
    ? documents.filter(
        (d) =>
          !cleanQ ||
          d.document_type.toLowerCase().includes(cleanQ) ||
          d.filename.toLowerCase().includes(cleanQ) ||
          (d.institution_name && d.institution_name.toLowerCase().includes(cleanQ))
      )
    : [];

  const filteredEVC = (selectedCategory === 'ALL' || selectedCategory === 'EVC')
    ? evcQueue.filter(
        (e) =>
          !cleanQ ||
          e.institution_name.toLowerCase().includes(cleanQ) ||
          e.status.toLowerCase().includes(cleanQ) ||
          (e.assigned_team && e.assigned_team.toLowerCase().includes(cleanQ))
      )
    : [];

  const quickActions = [
    {
      id: 'act-watchdog',
      label: 'Run Background SLA Watchdog & Escalation Scan',
      meta: 'Automated background audit across all active pipelines',
      shortcut: 'W',
      category: 'System',
      icon: <Activity className="w-4 h-4 text-rose-400" />,
      action: () => {
        onTriggerWatchdog();
        onClose();
      },
    },
    {
      id: 'act-role-scrutiny',
      label: 'Switch Active Role: Scrutiny Officer (Er. Priya Sharma)',
      meta: 'Conduct prerequisite audits & clause-by-clause scrutiny',
      shortcut: 'S',
      category: 'RBAC',
      icon: <ShieldCheck className="w-4 h-4 text-sky-400" />,
      action: () => {
        onSelectRole('SCRUTINY_OFFICER');
        onClose();
      },
    },
    {
      id: 'act-role-inst',
      label: 'Switch Active Role: Institutional Representative',
      meta: 'Upload deficiency rectification documents & renew NOCs',
      shortcut: 'I',
      category: 'RBAC',
      icon: <Building2 className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectRole('INSTITUTION_REP');
        onClose();
      },
    },
    {
      id: 'act-role-super',
      label: 'Switch Active Role: Regulatory Supervisor (Council Lead)',
      meta: 'Grant statutory approvals or council ratifications',
      shortcut: 'R',
      category: 'RBAC',
      icon: <Scale className="w-4 h-4 text-purple-400" />,
      action: () => {
        onSelectRole('SUPERVISOR');
        onClose();
      },
    },
    {
      id: 'act-nav-evc',
      label: 'Navigate to EVC On-Site Inspection Queue',
      meta: 'Schedule expert inspection teams & examine CAD lab metrics',
      shortcut: 'E',
      category: 'Navigation',
      icon: <Calendar className="w-4 h-4 text-indigo-400" />,
      action: () => {
        onNavigateTab('evc');
        onClose();
      },
    },
  ];

  const filteredActions = (selectedCategory === 'ALL' || selectedCategory === 'ACTIONS')
    ? quickActions.filter((a) => !cleanQ || a.label.toLowerCase().includes(cleanQ) || a.meta.toLowerCase().includes(cleanQ))
    : [];

  const totalResultsCount = filteredApps.length + filteredCompliance.length + filteredDocs.length + filteredEVC.length + filteredActions.length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-start justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-[#0B0E15]/95 border border-white/20 rounded-3xl max-w-3xl w-full shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-platinum-100 my-auto"
      >
        {/* Top Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center space-x-3 bg-[#0E121C]">
          <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-platinum-300 shrink-0">
            <Search className="w-4 h-4 text-white" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications, institutions, clauses, actions (or press Esc to exit)..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-platinum-500 focus:outline-none font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-platinum-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] font-mono text-platinum-400 shrink-0">
            <span>ESC</span>
          </div>
        </div>

        {/* Filter Category Tags */}
        <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/10 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'bg-white/[0.04] text-platinum-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              <span>{cat.label}</span>
              {cat.count !== undefined && <span className="ml-1 opacity-70">({cat.count})</span>}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5 text-xs">
          {totalResultsCount === 0 && (
            <div className="py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-platinum-500 mx-auto opacity-50" />
              <p className="text-white font-display text-sm font-semibold">No regulatory records found</p>
              <p className="text-platinum-400 text-xs">Try searching for an institution name, application number, or APH clause reference.</p>
            </div>
          )}

          {/* Section: Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-platinum-400 mb-2 px-2 flex items-center justify-between">
                <span>Quick Actions & Shortcuts</span>
                <span>{filteredActions.length} Actions</span>
              </div>
              <div className="space-y-1">
                {filteredActions.map((act) => (
                  <div
                    key={act.id}
                    onClick={act.action}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                        {act.icon}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-sky-300 transition-colors">{act.label}</div>
                        <div className="text-[11px] text-platinum-400">{act.meta}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-platinum-300">
                        {act.shortcut}
                      </span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-platinum-500 group-hover:text-white transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Applications */}
          {filteredApps.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-sky-400 mb-2 px-2 flex items-center justify-between">
                <span>Applications Dossiers</span>
                <span>{filteredApps.length} Results</span>
              </div>
              <div className="space-y-1">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      onSelectApplication(app.id);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-sky-950/30 border border-white/5 hover:border-sky-500/30 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-xl bg-sky-950/50 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                        <FolderKanban className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-sky-300 transition-colors">
                          {app.institution_name}
                        </div>
                        <div className="text-[11px] text-platinum-400 font-mono">
                          {app.application_number} · {app.region} · {app.application_type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/50 text-sky-300 border border-sky-500/30 font-bold">
                        {app.current_stage}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-platinum-500 group-hover:text-white transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Compliance Undertakings */}
          {filteredCompliance.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-2 px-2 flex items-center justify-between">
                <span>Compliance Obligations & Undertakings</span>
                <span>{filteredCompliance.length} Results</span>
              </div>
              <div className="space-y-1">
                {filteredCompliance.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => {
                      onSelectUndertaking(comp);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-emerald-950/30 border border-white/5 hover:border-emerald-500/30 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <Scale className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {comp.title}
                        </div>
                        <div className="text-[11px] text-platinum-400 font-mono">
                          {comp.institution_name || 'Technical Institution'} · Due: {comp.due_date}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-bold">
                        {comp.status.replace('_', ' ')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-platinum-500 group-hover:text-white transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Document Clearances */}
          {filteredDocs.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-2 px-2 flex items-center justify-between">
                <span>Statutory Life-Safety & Land Documents</span>
                <span>{filteredDocs.length} Results</span>
              </div>
              <div className="space-y-1">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onSelectDocument(doc);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-amber-950/30 border border-white/5 hover:border-amber-500/30 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-xl bg-amber-950/50 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Flame className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                          {doc.document_type}
                        </div>
                        <div className="text-[11px] text-platinum-400 font-mono">
                          {doc.filename} · Expires: {doc.expires_on || 'Indefinite'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-500/30 font-bold">
                        {doc.review_status.replace('_', ' ')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-platinum-500 group-hover:text-white transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: EVC Inspections */}
          {filteredEVC.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 mb-2 px-2 flex items-center justify-between">
                <span>EVC Inspection Queue</span>
                <span>{filteredEVC.length} Results</span>
              </div>
              <div className="space-y-1">
                {filteredEVC.map((evc) => (
                  <div
                    key={evc.id}
                    onClick={() => {
                      onSelectEVC(evc);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-indigo-950/30 border border-white/5 hover:border-indigo-500/30 transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {evc.institution_name}
                        </div>
                        <div className="text-[11px] text-platinum-400 font-mono">
                          {evc.application_number} · Team: {evc.assigned_team || 'Pending Team Assignment'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-500/30 font-bold">
                        {evc.status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-platinum-500 group-hover:text-white transition" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Hotkey Hint Bar */}
        <div className="p-3 bg-[#0A0D14] border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] font-mono text-platinum-400 px-5">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">ESC</kbd>
              <span>Close</span>
            </span>
          </div>
          <div className="text-platinum-500">
            Vengeance UI Command Palette · Regulatory Engine
          </div>
        </div>
      </motion.div>
    </div>
  );
};
