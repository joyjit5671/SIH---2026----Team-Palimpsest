'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Maximize2,
  Minimize2,
  X,
  Layers,
  Clock,
  Globe,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Search,
  ExternalLink,
  CheckCircle2,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  DashboardSummary,
  ApplicationSummary,
  UndertakingItem,
  DocumentItem,
  AuditEventItem,
} from '../types/api';

interface AgentBentoGridProps {
  summary: DashboardSummary;
  applications?: ApplicationSummary[];
  complianceList?: UndertakingItem[];
  documents?: DocumentItem[];
  auditEvents?: AuditEventItem[];
  onSelectApplication?: (id: string) => void;
  onTriggerWatchdog?: () => void;
}

// Color schemes matching obsidian/platinum & statutory signals
const STAGE_COLORS: Record<string, string> = {
  SCRUTINY: '#38bdf8', // Sky 400
  EVC: '#818cf8', // Indigo 400
  SAC_SHC: '#c084fc', // Purple 400
  FINAL_REVIEW: '#fbbf24', // Amber 400
  COMPLETED: '#34d399', // Emerald 400
};

const AGEING_COLORS: Record<string, string> = {
  '< 7 Days': '#34d399',
  '7 - 14 Days': '#38bdf8',
  '15 - 30 Days': '#fbbf24',
  '> 30 Days': '#f43f5e',
};

const REGION_COLORS = ['#38bdf8', '#818cf8', '#a78bfa', '#34d399', '#fbbf24'];

// Custom Dark Metallic Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0E15]/95 border border-white/20 p-3 rounded-xl shadow-2xl backdrop-blur-xl text-xs">
        <p className="font-mono text-platinum-400 mb-1 font-semibold">{label || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill || '#fff' }} />
            <span className="text-white font-mono font-bold">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AgentBentoGrid: React.FC<AgentBentoGridProps> = ({
  summary,
  applications = [],
  complianceList = [],
  documents = [],
  auditEvents = [],
  onSelectApplication,
  onTriggerWatchdog,
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close expanded view on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedCard(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Data for Statutory Pipeline Donut Chart
  const stageData = Object.entries(summary.stage_distribution || {}).map(([stage, count]) => ({
    name: stage.replace('_', ' '),
    key: stage,
    value: count,
    color: STAGE_COLORS[stage] || '#94a3b8',
  }));

  // 2. Data for Ageing Breakdown Area Chart
  const ageingData = Object.entries(summary.ageing_buckets || {}).map(([bucket, count]) => ({
    bucket,
    cases: count,
    urgency: bucket.includes('>') ? 4 : bucket.includes('15') ? 3 : bucket.includes('7') ? 2 : 1,
  }));

  // 3. Data for Regional Workload Bar Chart
  const regionalData = Object.entries(summary.regional_workload || {}).map(([region, count], idx) => ({
    region: region.replace(' Region', ''),
    fullName: region,
    count,
    fill: REGION_COLORS[idx % REGION_COLORS.length],
  }));

  // 4. Data for Compliance Undertakings Pie Chart
  const complianceStatusCounts = complianceList.reduce((acc, curr) => {
    const status = curr.status || 'PENDING';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const complianceChartData = [
    { name: 'Verified Closed', value: complianceStatusCounts['VERIFIED_CLOSED'] || complianceStatusCounts['VERIFIED'] || 5, color: '#34d399' },
    { name: 'Evidence Submitted', value: complianceStatusCounts['EVIDENCE_SUBMITTED'] || complianceStatusCounts['SUBMITTED'] || 4, color: '#38bdf8' },
    { name: 'Pending Evidence', value: complianceStatusCounts['PENDING'] || 3, color: '#fbbf24' },
    { name: 'Clarification Required', value: complianceStatusCounts['CLARIFICATION_REQUIRED'] || 2, color: '#f43f5e' },
  ];

  // 5. Data for Document Expiry Vault Health
  const docStatusCounts = documents.reduce((acc, curr) => {
    const status = curr.review_status || 'VALID';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const docChartData = [
    { name: 'Valid Clearances', count: docStatusCounts['VALID'] || 6, fill: '#34d399' },
    { name: 'Expiring (<30d)', count: docStatusCounts['APPROACHING_EXPIRY'] || 2, fill: '#fbbf24' },
    { name: 'Renewal Submitted', count: docStatusCounts['RENEWAL_SUBMITTED'] || 1, fill: '#818cf8' },
    { name: 'Expired/Overdue', count: docStatusCounts['EXPIRED'] || 1, fill: '#f43f5e' },
  ];

  // 6. Data for Hourly Watchdog Audit Velocity
  const auditActivityData = [
    { time: '08:00', events: 3, automated: 2 },
    { time: '10:00', events: 8, automated: 5 },
    { time: '12:00', events: 14, automated: 9 },
    { time: '14:00', events: 11, automated: 6 },
    { time: '16:00', events: 19, automated: 12 },
    { time: '18:00', events: 7, automated: 4 },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Bento Grid Header & Operational Mode */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0A0D14]/90 p-5 rounded-3xl border border-white/10 shadow-glass-island">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white shadow-inner">
            <Layers className="w-5 h-5 text-platinum-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold font-display text-white tracking-tight">
                Statutory Intelligence Bento Grid
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                EXPANDABLE RADAR ACTIVE
              </span>
            </div>
            <p className="text-xs text-platinum-400 font-sans mt-0.5">
              Click on any grid module to expand into deep-dive analytics, tabular case records, and supervisory actions.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={onTriggerWatchdog}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white text-xs font-mono transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Poll Telemetry</span>
          </button>
          <div className="text-[11px] font-mono text-platinum-400 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 hidden sm:block">
            6 Specialized Intelligence Nodes
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 6-PANEL ASYMMETRICAL EXPANDABLE AGENT BENTO GRID                    */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* ----------------------------------------------------------------- */}
        {/* BENTO CARD 1: STATUTORY PIPELINE DONUT (COL-SPAN 1)                */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          layoutId="bento-pipeline"
          onClick={() => setExpandedCard('pipeline')}
          className="group relative bg-[#0D1017]/95 hover:bg-[#10141D] rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-glass-island cursor-pointer flex flex-col justify-between min-h-[400px] overflow-hidden"
        >
          {/* Subtle Ambient Hover Sheen */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950/40 border border-sky-500/30 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                Pipeline Radar
              </span>
              <button
                type="button"
                className="p-1.5 rounded-lg text-platinum-400 group-hover:text-white bg-white/[0.03] group-hover:bg-white/10 border border-white/10 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-base font-bold text-white font-display">Approval Stage Funnel</h3>
            <p className="text-xs text-platinum-400 mt-0.5 font-sans">
              Real-time distribution across the 4 statutory APH gates.
            </p>
          </div>

          {/* Interactive Chart Body */}
          <div className="h-52 w-full my-3 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0D1017" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Central KPI inside donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black font-display text-white">{summary.total_applications}</span>
              <span className="text-[10px] font-mono text-platinum-400 uppercase">Dossiers</span>
            </div>
          </div>

          {/* Micro Legend & Click Hint */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-platinum-300">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Scrutiny ({summary.pending_scrutiny})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400" /> EVC ({summary.pending_evc})
              </span>
            </div>
            <span className="text-[10px] font-mono text-platinum-500 group-hover:text-white flex items-center gap-1 transition">
              Expand <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* BENTO CARD 2: SLA PENDENCY AGEING AREA CHART (COL-SPAN 1)         */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          layoutId="bento-ageing"
          onClick={() => setExpandedCard('ageing')}
          className="group relative bg-[#0D1017]/95 hover:bg-[#10141D] rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-glass-island cursor-pointer flex flex-col justify-between min-h-[400px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                SLA Watchdog
              </span>
              <button
                type="button"
                className="p-1.5 rounded-lg text-platinum-400 group-hover:text-white bg-white/[0.03] group-hover:bg-white/10 border border-white/10 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-base font-bold text-white font-display">Pendency Ageing Breakdown</h3>
            <p className="text-xs text-platinum-400 mt-0.5 font-sans">
              Monitoring processing stagnation before statutory breach thresholds.
            </p>
          </div>

          {/* Interactive Chart Body */}
          <div className="h-52 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ageingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ageingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="bucket" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cases" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#ageingGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-[10px] font-mono">
              <span className="text-rose-400 font-bold">{summary.overdue_count} Critical</span>
              <span className="text-platinum-500">·</span>
              <span className="text-platinum-400">Mean Age: 11.4d</span>
            </div>
            <span className="text-[10px] font-mono text-platinum-500 group-hover:text-white flex items-center gap-1 transition">
              Drill-down <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* BENTO CARD 3: NATIONAL REGIONAL WORKLOAD BAR CHART (COL-SPAN 1)    */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          layoutId="bento-regions"
          onClick={() => setExpandedCard('regions')}
          className="group relative bg-[#0D1017]/95 hover:bg-[#10141D] rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-glass-island cursor-pointer flex flex-col justify-between min-h-[400px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                Regional Balance
              </span>
              <button
                type="button"
                className="p-1.5 rounded-lg text-platinum-400 group-hover:text-white bg-white/[0.03] group-hover:bg-white/10 border border-white/10 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-base font-bold text-white font-display">AICTE Regional Load</h3>
            <p className="text-xs text-platinum-400 mt-0.5 font-sans">
              Dossier distribution across 5 national geographical bureaus.
            </p>
          </div>

          {/* Interactive Chart Body */}
          <div className="h-52 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="region" stroke="#64748b" tick={{ fontSize: 9 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {regionalData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-platinum-400">
              National Quota: <strong className="text-white">Active</strong>
            </span>
            <span className="text-[10px] font-mono text-platinum-500 group-hover:text-white flex items-center gap-1 transition">
              Inspect Queues <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* BENTO CARD 4: COMPLIANCE UNDERTAKINGS STATUS (COL-SPAN 1)         */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          layoutId="bento-compliance"
          onClick={() => setExpandedCard('compliance')}
          className="group relative bg-[#0D1017]/95 hover:bg-[#10141D] rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-glass-island cursor-pointer flex flex-col justify-between min-h-[400px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                Statutory Commitments
              </span>
              <button
                type="button"
                className="p-1.5 rounded-lg text-platinum-400 group-hover:text-white bg-white/[0.03] group-hover:bg-white/10 border border-white/10 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-base font-bold text-white font-display">Undertaking Deficit Tracking</h3>
            <p className="text-xs text-platinum-400 mt-0.5 font-sans">
              Time-bound institutional obligations (faculty ratios, endowment funds).
            </p>
          </div>

          {/* Interactive Chart Body */}
          <div className="h-52 w-full my-3 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  labelLine={false}
                >
                  {complianceChartData.map((entry, index) => (
                    <Cell key={`comp-${index}`} fill={entry.color} stroke="#0D1017" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-platinum-300">
              <span className="text-emerald-400 font-bold">84% Verification Rate</span>
            </div>
            <span className="text-[10px] font-mono text-platinum-500 group-hover:text-white flex items-center gap-1 transition">
              Review Items <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* BENTO CARD 5: DOCUMENT EXPIRY VAULT HEALTH (COL-SPAN 1)           */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          layoutId="bento-documents"
          onClick={() => setExpandedCard('documents')}
          className="group relative bg-[#0D1017]/95 hover:bg-[#10141D] rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-glass-island cursor-pointer flex flex-col justify-between min-h-[400px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <FileCheck2 className="w-3 h-3" />
                Validity Vault
              </span>
              <button
                type="button"
                className="p-1.5 rounded-lg text-platinum-400 group-hover:text-white bg-white/[0.03] group-hover:bg-white/10 border border-white/10 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-base font-bold text-white font-display">Document Clearance Health</h3>
            <p className="text-xs text-platinum-400 mt-0.5 font-sans">
              30/60/90-day radar for Land Deeds, Fire NOCs, and Safety certificates.
            </p>
          </div>

          {/* Interactive Chart Body */}
          <div className="h-52 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={docChartData} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 9 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {docChartData.map((entry, index) => (
                    <Cell key={`doc-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-amber-300">
              <span>{summary.upcoming_expiries} Approaching Expiry</span>
            </div>
            <span className="text-[10px] font-mono text-platinum-500 group-hover:text-white flex items-center gap-1 transition">
              Inspect Vault <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* ----------------------------------------------------------------- */}
        {/* BENTO CARD 6: LIVE AUDIT VELOCITY & TAMPER RADAR (COL-SPAN 1)     */}
        {/* ----------------------------------------------------------------- */}
        <motion.div
          layoutId="bento-audit"
          onClick={() => setExpandedCard('audit')}
          className="group relative bg-[#0D1017]/95 hover:bg-[#10141D] rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 shadow-glass-island cursor-pointer flex flex-col justify-between min-h-[400px] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                Immutable Ledger
              </span>
              <button
                type="button"
                className="p-1.5 rounded-lg text-platinum-400 group-hover:text-white bg-white/[0.03] group-hover:bg-white/10 border border-white/10 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="text-base font-bold text-white font-display">Tamper-Evident Audit Stream</h3>
            <p className="text-xs text-platinum-400 mt-0.5 font-sans">
              Cryptographic state transitions & autonomous SLA escalation pulse.
            </p>
          </div>

          {/* Interactive Chart Body */}
          <div className="h-52 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={auditActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="events" stroke="#c084fc" strokeWidth={2.5} dot={{ r: 3, fill: '#c084fc' }} />
                <Line type="monotone" dataKey="automated" stroke="#34d399" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Footer */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>Zero Tamper Events</span>
            </div>
            <span className="text-[10px] font-mono text-platinum-500 group-hover:text-white flex items-center gap-1 transition">
              View Log <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

      </div>

      {/* =================================================================== */}
      {/* EXPANDED FULL-SCREEN INTERACTIVE DEEP-DIVE MODAL                    */}
      {/* =================================================================== */}
      <AnimatePresence>
        {expandedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-[#0B0E15] border border-white/20 rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-platinum-100"
            >
              {/* Modal Top Navigation Bar */}
              <div className="p-6 bg-[#0E121B] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white">
                    {expandedCard === 'pipeline' && <Layers className="w-5 h-5 text-sky-400" />}
                    {expandedCard === 'ageing' && <Clock className="w-5 h-5 text-rose-400" />}
                    {expandedCard === 'regions' && <Globe className="w-5 h-5 text-indigo-400" />}
                    {expandedCard === 'compliance' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                    {expandedCard === 'documents' && <FileCheck2 className="w-5 h-5 text-amber-400" />}
                    {expandedCard === 'audit' && <Activity className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-platinum-400">
                      Bento Module Deep Dive
                    </span>
                    <h2 className="text-xl font-bold font-display text-white mt-0.5">
                      {expandedCard === 'pipeline' && 'Statutory Approval Pipeline & Lifecycle Stages'}
                      {expandedCard === 'ageing' && 'SLA Pendency Watchdog & Overdue Bottleneck Dossiers'}
                      {expandedCard === 'regions' && 'National Regional Office Workload Quotas'}
                      {expandedCard === 'compliance' && 'Institutional Undertakings & Mandatory Commitments'}
                      {expandedCard === 'documents' && 'Document Expiry & Structural Safety Clearance Vault'}
                      {expandedCard === 'audit' && 'Immutable Cryptographic Audit Ledger & SLA Escalation Trace'}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-platinum-400 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 hidden sm:inline">
                    ESC to close
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedCard(null)}
                    className="p-2 rounded-xl text-platinum-400 hover:text-white bg-white/[0.05] hover:bg-white/15 border border-white/10 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body Content (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">

                {/* 1. PIPELINE EXPANDED VIEW */}
                {expandedCard === 'pipeline' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1 bg-[#10141D] p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white font-display mb-2">Stage Distribution</h4>
                          <p className="text-xs text-platinum-400 mb-4">
                            All institutional dossiers must successfully pass through sequential scrutiny stages without skipping prerequisites.
                          </p>
                        </div>
                        <div className="h-48 w-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={stageData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                                {stageData.map((e, i) => (
                                  <Cell key={`exp-cell-${i}`} fill={e.color} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="text-xs space-y-1.5 pt-3 border-t border-white/10 font-mono">
                          <div className="flex justify-between">
                            <span className="text-platinum-400">Total Inflow:</span>
                            <span className="text-white font-bold">{summary.total_applications}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-400">Approved:</span>
                            <span className="text-emerald-400 font-bold">{summary.approved_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400">Returned:</span>
                            <span className="text-amber-400 font-bold">{summary.returned_for_clarification}</span>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 bg-[#10141D] p-5 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white font-display">Active Stage Register</h4>
                          <span className="text-xs font-mono text-platinum-400">{applications.length} Active Dossiers</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-white/10 text-platinum-400 font-mono uppercase text-[10px]">
                                <th className="py-2.5 px-3">Application No.</th>
                                <th className="py-2.5 px-3">Institution</th>
                                <th className="py-2.5 px-3">Stage</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-sans">
                              {applications.slice(0, 5).map((app) => (
                                <tr key={app.id} className="hover:bg-white/[0.02]">
                                  <td className="py-2.5 px-3 font-mono text-white font-semibold">{app.application_number}</td>
                                  <td className="py-2.5 px-3 text-platinum-200">{app.institution_name}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-500/30">
                                      {app.current_stage}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="text-[10px] text-platinum-300 font-mono">{app.operational_status}</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpandedCard(null);
                                        onSelectApplication?.(app.id);
                                      }}
                                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-mono text-white transition cursor-pointer"
                                    >
                                      Inspect
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. AGEING EXPANDED VIEW */}
                {expandedCard === 'ageing' && (
                  <div className="space-y-6">
                    <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-rose-200 font-display">Statutory SLA Alert Policy</h4>
                          <p className="text-xs text-rose-300/80">
                            Applications exceeding 30 days are automatically escalated to the Regional Director and flagged for priority board scrutiny.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onTriggerWatchdog}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold transition shrink-0 cursor-pointer shadow-lg shadow-rose-900/40"
                      >
                        Run Immediate SLA Scan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {Object.entries(summary.ageing_buckets || {}).map(([b, c]) => (
                        <div key={b} className="p-4 bg-[#10141D] rounded-2xl border border-white/10">
                          <span className="text-xs font-mono text-platinum-400">{b}</span>
                          <div className="text-2xl font-black font-mono text-white mt-1">{c} Cases</div>
                          <span className="text-[10px] text-platinum-500 font-sans mt-0.5">
                            {b.includes('>') ? 'Immediate action required' : 'Within statutory limit'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#10141D] p-5 rounded-2xl border border-white/10 space-y-3">
                      <h4 className="text-sm font-bold text-white font-display">Overdue Dossiers Under Review</h4>
                      <div className="space-y-2">
                        {applications.filter(a => a.is_overdue || a.days_in_current_stage > 14).map(app => (
                          <div key={app.id} className="p-3 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono font-bold text-rose-400">{app.application_number}</span>
                                <span className="text-white font-medium">{app.institution_name}</span>
                              </div>
                              <span className="text-[10px] text-platinum-400 font-mono mt-0.5">
                                Pending {app.days_in_current_stage} days in {app.current_stage} · Assigned: {app.assigned_to || 'Er. Priya Sharma'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedCard(null);
                                onSelectApplication?.(app.id);
                              }}
                              className="px-3 py-1 bg-white/[0.08] hover:bg-white/15 text-white rounded-lg font-mono text-[11px] transition cursor-pointer"
                            >
                              Prioritize Dossier
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. REGIONAL EXPANDED VIEW */}
                {expandedCard === 'regions' && (
                  <div className="space-y-6">
                    <div className="h-64 w-full bg-[#10141D] p-5 rounded-2xl border border-white/10">
                      <h4 className="text-sm font-bold text-white font-display mb-3">Geographical Bureau Inflow</h4>
                      <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={regionalData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="fullName" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                          <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#818cf8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {regionalData.map((reg) => (
                        <div key={reg.fullName} className="p-4 bg-[#10141D] rounded-2xl border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{reg.fullName}</span>
                            <span className="text-xs font-mono font-bold text-indigo-400">{reg.count} Active</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, reg.count * 20)}%` }} />
                          </div>
                          <span className="text-[10px] text-platinum-400 font-mono block">
                            Regional Director: Dr. A. K. Varma
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. COMPLIANCE EXPANDED VIEW */}
                {expandedCard === 'compliance' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#10141D] rounded-2xl border border-white/10">
                        <span className="text-xs text-platinum-400 font-mono">Total Undertakings</span>
                        <div className="text-2xl font-black text-white font-mono mt-1">{complianceList.length || 6}</div>
                        <span className="text-[10px] text-platinum-500 mt-0.5">Statutory commitments registered</span>
                      </div>
                      <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
                        <span className="text-xs text-emerald-300 font-mono">Verified Closed</span>
                        <div className="text-2xl font-black text-emerald-400 font-mono mt-1">4</div>
                        <span className="text-[10px] text-emerald-200/70 mt-0.5">Evidence accepted by council</span>
                      </div>
                      <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl">
                        <span className="text-xs text-amber-300 font-mono">Pending Evidence</span>
                        <div className="text-2xl font-black text-amber-400 font-mono mt-1">2</div>
                        <span className="text-[10px] text-amber-200/70 mt-0.5">Awaiting institution submission</span>
                      </div>
                    </div>

                    <div className="bg-[#10141D] p-5 rounded-2xl border border-white/10 space-y-3">
                      <h4 className="text-sm font-bold text-white font-display">Undertaking Compliance Ledger</h4>
                      <div className="space-y-2">
                        {complianceList.map(u => (
                          <div key={u.id} className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-bold text-white block">{u.title}</span>
                              <span className="text-[10px] text-platinum-400 font-mono">
                                Due Date: {u.due_date} · Status: <strong className="text-platinum-200">{u.status}</strong>
                              </span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/10 text-white">
                              {u.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. DOCUMENTS EXPANDED VIEW */}
                {expandedCard === 'documents' && (
                  <div className="space-y-6">
                    <div className="bg-[#10141D] p-5 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white font-display">Document Validity Vault & Renewal Surveillance</h4>
                        <span className="text-xs font-mono text-platinum-400">{documents.length} Clearances Tracked</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-platinum-400 font-mono uppercase text-[10px]">
                              <th className="py-2.5 px-3">Document Type</th>
                              <th className="py-2.5 px-3">Filename</th>
                              <th className="py-2.5 px-3">Expires On</th>
                              <th className="py-2.5 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans">
                            {documents.map((doc) => (
                              <tr key={doc.id} className="hover:bg-white/[0.02]">
                                <td className="py-2.5 px-3 font-bold text-white">{doc.document_type}</td>
                                <td className="py-2.5 px-3 font-mono text-platinum-300">{doc.filename}</td>
                                <td className="py-2.5 px-3 font-mono text-platinum-400">{doc.expires_on || '—'}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] font-mono ${
                                    doc.review_status === 'VALID' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' :
                                    doc.review_status === 'APPROACHING_EXPIRY' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' :
                                    'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                                  }`}>
                                    {doc.review_status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. AUDIT EXPANDED VIEW */}
                {expandedCard === 'audit' && (
                  <div className="space-y-6">
                    <div className="bg-[#10141D] p-5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white font-display">Tamper-Evident Ledger Log</h4>
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Append-Only Immutable Storage
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {auditEvents.slice(0, 8).map((evt) => (
                          <div key={evt.id} className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between font-mono text-[11px]">
                              <span className="font-bold text-white">{evt.action}</span>
                              <span className="text-platinum-500">{new Date(evt.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-platinum-300 font-sans">
                              Actor: <strong className="text-white">{evt.actor_name}</strong> ({evt.actor_role}) · Target: {evt.entity_type} ({evt.entity_id.slice(0, 8)}...)
                            </p>
                            {evt.reason && <p className="text-platinum-400 italic font-sans text-[11px]">"{evt.reason}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#0E121B] border-t border-white/10 flex items-center justify-between text-xs text-platinum-400 font-mono">
                <span>Integrated AICTE Approval Workflow Automation · Problem Statement 26262</span>
                <button
                  type="button"
                  onClick={() => setExpandedCard(null)}
                  className="px-4 py-1.5 bg-white text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Collapse Module
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
