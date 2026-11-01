'use client';

import React, { useState, useEffect } from 'react';
import LandingPage from '../components/LandingPage';
import InfoModal from '../components/InfoModal';
import { AgentBentoGrid } from '../components/AgentBentoGrid';
import { ScrutinySpotlightDeck } from '../components/ScrutinySpotlightDeck';
import { DeficiencyReportModal } from '../components/DeficiencyReportModal';
import { ComplianceSpotlightDeck } from '../components/ComplianceSpotlightDeck';
import { ComplianceReportModal } from '../components/ComplianceReportModal';
import { DocumentSpotlightDeck } from '../components/DocumentSpotlightDeck';
import { DocumentNoticeModal } from '../components/DocumentNoticeModal';
import { EVCSpotlightDeck } from '../components/EVCSpotlightDeck';
import { EVCReportModal } from '../components/EVCReportModal';
import { AnimatedDropdown } from '../components/AnimatedDropdown';
import { VengeanceSearchModal } from '../components/VengeanceSearchModal';
import { apiClient } from '../lib/api-client';
import {
  UserRole,
  DashboardSummary,
  ApplicationSummary,
  ApplicationDetail,
  EVCItem,
  UndertakingItem,
  DocumentItem,
  NotificationItem,
  AuditEventItem
} from '../types/api';
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Scale,
  FileClock,
  History,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowLeft,
  ExternalLink,
  Clock,
  UserCheck,
  Globe,
  RefreshCw,
  X,
  ChevronRight,
  FileText,
  Check,
  Sparkles,
  Layers,
  Calendar,
  Send,
  UploadCloud,
  FileSpreadsheet,
  Lock,
  ArrowRight,
  LayoutGrid,
  Table,
  Flame,
  ShieldAlert,
  BadgeCheck,
  Compass,
  Command,
  FileCheck2
} from 'lucide-react';

const DEFAULT_SUMMARY: DashboardSummary = {
  total_applications: 18,
  pending_scrutiny: 6,
  pending_evc: 4,
  under_sac_shc: 3,
  returned_for_clarification: 2,
  approved_count: 2,
  rejected_count: 1,
  overdue_count: 2,
  upcoming_expiries: 3,
  pending_compliance: 5,
  stage_distribution: {
    SCRUTINY: 6,
    EVC: 4,
    SAC_SHC: 3,
    FINAL_REVIEW: 3,
    COMPLETED: 2,
  },
  status_distribution: {
    SUBMITTED: 4,
    IN_REVIEW: 9,
    RETURNED: 2,
    APPROVED: 2,
    REJECTED: 1,
  },
  regional_workload: {
    Eastern: 4,
    Western: 5,
    Northern: 4,
    Southern: 3,
    Central: 2,
  },
  ageing_buckets: {
    '< 7 Days': 5,
    '7 - 14 Days': 6,
    '15 - 30 Days': 4,
    '> 30 Days': 3,
  },
};

const DEFAULT_APPLICATIONS: ApplicationSummary[] = [
  {
    id: 'app-1',
    application_number: 'APP-2026-1001',
    institution_name: 'Apex Institute of Technology & Management',
    institution_code: 'AICTE-NR-1001',
    region: 'Northern Region',
    application_type: 'Extension of Approval (EoA)',
    current_stage: 'SCRUTINY',
    operational_status: 'IN_REVIEW',
    assigned_to: 'Er. Priya Sharma',
    route_code: 'ROUTE_EOA_STANDARD',
    academic_year: '2026-2027',
    submitted_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-25T14:30:00Z',
    days_in_current_stage: 6,
    is_overdue: false,
  },
  {
    id: 'app-2',
    application_number: 'APP-2026-1002',
    institution_name: 'Bengaluru Institute of Science & Technology',
    institution_code: 'AICTE-SWR-1002',
    region: 'South-Western Region',
    application_type: 'New Technical Institution',
    current_stage: 'EVC',
    operational_status: 'IN_REVIEW',
    assigned_to: 'Prof. A. K. Sen',
    route_code: 'ROUTE_NEW_INSTITUTE',
    academic_year: '2026-2027',
    submitted_at: '2026-10-14T09:15:00Z',
    updated_at: '2026-10-28T16:00:00Z',
    days_in_current_stage: 12,
    is_overdue: false,
  },
  {
    id: 'app-3',
    application_number: 'APP-2026-1003',
    institution_name: 'Delhi College of Engineering & Research',
    institution_code: 'AICTE-NR-1003',
    region: 'Northern Region',
    application_type: 'Course Expansion (CSE & IoT)',
    current_stage: 'SAC_SHC',
    operational_status: 'RETURNED',
    assigned_to: 'Justice (Retd.) M. K. Chawla',
    route_code: 'ROUTE_EXPANSION_UG',
    academic_year: '2026-2027',
    submitted_at: '2026-10-05T11:45:00Z',
    updated_at: '2026-10-29T18:20:00Z',
    days_in_current_stage: 19,
    is_overdue: true,
  },
  {
    id: 'app-4',
    application_number: 'APP-2026-1004',
    institution_name: 'Mumbai Academy of Technology',
    institution_code: 'AICTE-WR-1004',
    region: 'Western Region',
    application_type: 'Extension of Approval (EoA)',
    current_stage: 'FINAL_REVIEW',
    operational_status: 'IN_REVIEW',
    assigned_to: 'Dr. Anil S.',
    route_code: 'ROUTE_EOA_STANDARD',
    academic_year: '2026-2027',
    submitted_at: '2026-10-22T08:30:00Z',
    updated_at: '2026-10-30T12:00:00Z',
    days_in_current_stage: 4,
    is_overdue: false,
  },
  {
    id: 'app-5',
    application_number: 'APP-2026-1005',
    institution_name: 'Kolkata Institute of Engineering & Marine Sciences',
    institution_code: 'AICTE-ER-1005',
    region: 'Eastern Region',
    application_type: 'Closure & Re-alignment',
    current_stage: 'COMPLETED',
    operational_status: 'APPROVED',
    assigned_to: 'Dr. R. Iyer',
    route_code: 'ROUTE_CLOSURE_STD',
    academic_year: '2026-2027',
    submitted_at: '2026-09-28T14:00:00Z',
    updated_at: '2026-10-24T17:10:00Z',
    days_in_current_stage: 2,
    is_overdue: false,
  },
  {
    id: 'app-6',
    application_number: 'APP-2026-1006',
    institution_name: 'Hyderabad Technical University Campus',
    institution_code: 'AICTE-SC-1006',
    region: 'South-Central Region',
    application_type: 'New Technical Institution',
    current_stage: 'SCRUTINY',
    operational_status: 'IN_REVIEW',
    assigned_to: 'Er. Priya Sharma',
    route_code: 'ROUTE_NEW_INSTITUTE',
    academic_year: '2026-2027',
    submitted_at: '2026-10-27T10:15:00Z',
    updated_at: '2026-10-31T11:40:00Z',
    days_in_current_stage: 3,
    is_overdue: false,
  },
];

export default function ApprovalFlowApp() {
  // Landing Page & Modal state
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [infoModalType, setInfoModalType] = useState<'privacy' | 'terms' | null>(null);

  // Current active role and navigation tab
  const [activeRole, setActiveRole] = useState<UserRole>('SCRUTINY_OFFICER');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'evc' | 'compliance' | 'documents' | 'audit'>('dashboard');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  // Applications view toggle ('cards' vs 'table')
  const [applicationsViewMode, setApplicationsViewMode] = useState<'cards' | 'table'>('cards');
  const [isDeficiencyModalOpen, setIsDeficiencyModalOpen] = useState(false);

  // Compliance view toggle & states
  const [complianceViewMode, setComplianceViewMode] = useState<'cards' | 'table'>('cards');
  const [complianceSearch, setComplianceSearch] = useState('');
  const [complianceStatusFilter, setComplianceStatusFilter] = useState('');
  const [selectedUndertakingDetail, setSelectedUndertakingDetail] = useState<UndertakingItem | null>(null);
  const [isComplianceDetailOpen, setIsComplianceDetailOpen] = useState(false);
  const [isComplianceReportOpen, setIsComplianceReportOpen] = useState(false);

  // Documents view toggle & states
  const [documentsViewMode, setDocumentsViewMode] = useState<'cards' | 'table'>('cards');
  const [documentsSearch, setDocumentsSearch] = useState('');
  const [documentsStatusFilter, setDocumentsStatusFilter] = useState('');
  const [selectedDocumentDetail, setSelectedDocumentDetail] = useState<DocumentItem | null>(null);
  const [isDocumentDetailOpen, setIsDocumentDetailOpen] = useState(false);
  const [isDocumentNoticeOpen, setIsDocumentNoticeOpen] = useState(false);

  // EVC view toggle & states
  const [evcViewMode, setEvcViewMode] = useState<'cards' | 'table'>('cards');
  const [evcSearch, setEvcSearch] = useState('');
  const [evcStatusFilter, setEvcStatusFilter] = useState('');
  const [selectedEVCDetail, setSelectedEVCDetail] = useState<EVCItem | null>(null);
  const [isEVCDetailOpen, setIsEVCDetailOpen] = useState(false);
  const [isEVCReportOpen, setIsEVCReportOpen] = useState(false);

  // Vengeance UI Search Command Palette Modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Backend state initialized with resilient demonstration baseline
  const [summary, setSummary] = useState<DashboardSummary>(DEFAULT_SUMMARY);
  const [applications, setApplications] = useState<ApplicationSummary[]>(DEFAULT_APPLICATIONS);
  const [evcQueue, setEvcQueue] = useState<EVCItem[]>([]);
  const [complianceList, setComplianceList] = useState<UndertakingItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Application search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedAppDetail, setSelectedAppDetail] = useState<ApplicationDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [isScheduleEvcModalOpen, setIsScheduleEvcModalOpen] = useState(false);
  const [isSubmitEvidenceModalOpen, setIsSubmitEvidenceModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Form states for modals
  const [returnReason, setReturnReason] = useState('');
  const [returnItems, setReturnItems] = useState('Updated Land Lease with Sub-Registrar stamp\nStructural stability affidavit');
  const [resubmitNotes, setResubmitNotes] = useState('');
  const [evcDate, setEvcDate] = useState('2026-11-12T10:00');
  const [evcTeam, setEvcTeam] = useState('Prof. A. K. Sen (Chairman), Dr. R. Iyer (Expert)');
  const [evcNotes, setEvcNotes] = useState('Inspection of academic laboratories and accessibility ramps');
  const [evidenceFilename, setEvidenceFilename] = useState('Endowed_Professor_Appointment_Order_2026.pdf');
  const [evidenceComments, setEvidenceComments] = useState('Gazetted appointment notifications attached.');
  const [selectedUndertakingId, setSelectedUndertakingId] = useState<string>('');

  // Feedback banner
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Fetch all core data from API with resilient fallback merging
  const refreshData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const results = await Promise.allSettled([
        apiClient.getDashboardSummary(selectedRegion),
        apiClient.getApplications({ region: selectedRegion, stage: stageFilter, status: statusFilter, search: searchQuery }),
        apiClient.getEVCQueue(),
        apiClient.getComplianceList(),
        apiClient.getDocuments(),
        apiClient.getNotifications(activeRole),
        apiClient.getAuditEvents('ALL'),
      ]);

      const [sumRes, appsRes, evcRes, compRes, docsRes, notifsRes, auditRes] = results;
      let connected = false;

      if (sumRes.status === 'fulfilled' && sumRes.value) {
        connected = true;
        setSummary(prev => ({
          ...prev,
          ...sumRes.value,
          stage_distribution: sumRes.value.stage_distribution || (sumRes.value as any).by_stage || prev.stage_distribution,
          status_distribution: sumRes.value.status_distribution || (sumRes.value as any).by_status || prev.status_distribution,
          regional_workload: sumRes.value.regional_workload || prev.regional_workload,
          ageing_buckets: sumRes.value.ageing_buckets || prev.ageing_buckets,
        }));
      }

      if (appsRes.status === 'fulfilled' && appsRes.value?.items) {
        connected = true;
        setApplications(appsRes.value.items);
      }

      if (evcRes.status === 'fulfilled' && Array.isArray(evcRes.value)) {
        connected = true;
        setEvcQueue(evcRes.value);
      }

      if (compRes.status === 'fulfilled' && Array.isArray(compRes.value)) {
        connected = true;
        setComplianceList(compRes.value);
      }

      if (docsRes.status === 'fulfilled' && Array.isArray(docsRes.value)) {
        connected = true;
        setDocuments(docsRes.value);
      }

      if (notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value)) {
        connected = true;
        setNotifications(notifsRes.value);
      }

      if (auditRes.status === 'fulfilled' && Array.isArray(auditRes.value)) {
        connected = true;
        setAuditEvents(auditRes.value);
      }

      setIsLiveConnected(connected);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to backend server. Using demonstrator state.');
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedRegion, stageFilter, statusFilter, activeRole]);

  // Handle open application detail with robust normalization
  const handleOpenDetail = async (appId: string) => {
    try {
      let detail: any = null;
      try {
        detail = await apiClient.getApplicationDetail(appId);
      } catch {
        // Fallback to match application from current applications list if direct query misses
        const found = applications.find(a => a.id === appId || a.application_number === appId);
        if (found) {
          detail = { ...found };
        }
      }

      if (detail) {
        const instName = detail.institution_name || detail.institution?.name || 'Technical Institution';
        const instRegion = detail.region || 'National';
        const normalizedDetail: ApplicationDetail = {
          ...detail,
          institution_name: instName,
          institution: {
            id: detail.institution_id || detail.id || 'inst-1',
            institution_code: detail.institution_code || (detail.institution && detail.institution.institution_code) || 'AICTE-INST',
            name: instName,
            region: instRegion,
            state: (detail.institution && detail.institution.state) || instRegion,
          },
          documents: detail.documents && detail.documents.length > 0 ? detail.documents : (documents.length > 0 ? documents : [
            { id: 'd-1', institution_id: 'inst-1', document_type: 'Campus Land Lease Deed (30-Year)', filename: 'Registered_Lease_Deed_2026.pdf', review_status: 'VALID', created_at: new Date().toISOString() },
            { id: 'd-2', institution_id: 'inst-1', document_type: 'Municipal Building Occupancy Certificate', filename: 'Building_Occupancy_NOC.pdf', review_status: 'VALID', created_at: new Date().toISOString() },
            { id: 'd-3', institution_id: 'inst-1', document_type: 'State Fire Department Safety Clearance', filename: 'Fire_Safety_NOC_2026.pdf', review_status: 'APPROACHING_EXPIRY', created_at: new Date().toISOString() }
          ]),
          timeline: detail.timeline && detail.timeline.length > 0 ? detail.timeline : [
            { id: 'tl-1', application_id: detail.id, action: 'APPLICATION_SUBMITTED', reason: 'Online application submitted with requisite processing fee.', actor_id: 'inst-01', actor_name: 'Institution Principal', actor_role: 'INSTITUTION_REP', created_at: detail.submitted_at || new Date().toISOString() },
            { id: 'tl-2', application_id: detail.id, action: 'SCRUTINY_COMMENCED', reason: 'Assigned to Scrutiny Committee for document verification.', actor_id: 'off-01', actor_name: 'Er. Priya Sharma', actor_role: 'SCRUTINY_OFFICER', created_at: new Date().toISOString() }
          ],
          undertakings: detail.undertakings || complianceList,
        };
        setSelectedAppDetail(normalizedDetail);
        setIsDetailModalOpen(true);
      } else {
        showToast('Application record not found.', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle open compliance undertaking detail
  const handleOpenUndertakingDetail = (undertaking: UndertakingItem) => {
    setSelectedUndertakingDetail(undertaking);
    setIsComplianceDetailOpen(true);
  };

  // Handle open document expiry detail
  const handleOpenDocumentDetail = (doc: DocumentItem) => {
    setSelectedDocumentDetail(doc);
    setIsDocumentDetailOpen(true);
  };

  // Handle open EVC inspection detail
  const handleOpenEVCDetail = (evc: EVCItem) => {
    setSelectedEVCDetail(evc);
    setIsEVCDetailOpen(true);
  };

  // Global Hotkey Listener: Ctrl+K / Cmd+K opens Vengeance Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Handle Return for clarification
  const handleConfirmReturn = async () => {
    if (!selectedAppDetail) return;
    if (returnReason.trim().length < 3) {
      showToast('Please provide a valid deficiency reason (minimum 3 characters).', 'error');
      return;
    }
    const itemsList = returnItems.split('\n').filter((i) => i.trim().length > 0);
    try {
      await apiClient.returnApplication(selectedAppDetail.id, returnReason, itemsList);
      showToast(`Application ${selectedAppDetail.application_number} returned for clarification.`);
      setIsReturnModalOpen(false);
      setIsDetailModalOpen(false);
      setReturnReason('');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle Resubmit
  const handleConfirmResubmit = async () => {
    if (!selectedAppDetail) return;
    if (resubmitNotes.trim().length < 3) {
      showToast('Please provide clarification notes regarding the updates made.', 'error');
      return;
    }
    try {
      await apiClient.resubmitApplication(selectedAppDetail.id, resubmitNotes, ['Updated_Deed_Signed.pdf']);
      showToast(`Application ${selectedAppDetail.application_number} resubmitted with clarifications.`);
      setIsResubmitModalOpen(false);
      setIsDetailModalOpen(false);
      setResubmitNotes('');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle Stage Transition
  const handleTransition = async (targetStage: string) => {
    if (!selectedAppDetail) return;
    try {
      await apiClient.transitionApplication(selectedAppDetail.id, targetStage, `Advanced from ${selectedAppDetail.current_stage} to ${targetStage}`);
      showToast(`Application ${selectedAppDetail.application_number} progressed to ${targetStage} stage.`);
      setIsDetailModalOpen(false);
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle Statutory Decision
  const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
    if (!selectedAppDetail) return;
    const remarks = window.prompt(`Enter statutory remarks for ${decision}:`, `Statutory ${decision.toLowerCase()} granted under AICTE Regulations 2026.`);
    if (!remarks) return;
    try {
      await apiClient.recordDecision(selectedAppDetail.id, decision, remarks);
      showToast(`Statutory ${decision} successfully recorded.`);
      setIsDetailModalOpen(false);
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle EVC Scheduling
  const handleConfirmScheduleEVC = async () => {
    if (!selectedAppDetail) return;
    try {
      await apiClient.scheduleEVC(selectedAppDetail.id, evcDate, evcTeam, evcNotes);
      showToast(`EVC inspection scheduled for ${selectedAppDetail.application_number}.`);
      setIsScheduleEvcModalOpen(false);
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle Compliance Submit Evidence
  const handleConfirmSubmitEvidence = async () => {
    if (!selectedUndertakingId) return;
    try {
      await apiClient.submitComplianceEvidence(selectedUndertakingId, evidenceFilename, evidenceComments);
      showToast('Compliance evidence uploaded and submitted for verification.');
      setIsSubmitEvidenceModalOpen(false);
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle Compliance Review
  const handleReviewCompliance = async (id: string, action: 'VERIFY' | 'REQUEST_CLARIFICATION') => {
    const reason = window.prompt(action === 'VERIFY' ? 'Enter verification remarks:' : 'Enter clarification required reason:', action === 'VERIFY' ? 'Documentation verified compliant with AICTE norms.' : 'Required laboratory clearance seal is missing.');
    if (!reason) return;
    try {
      await apiClient.reviewComplianceEvidence(id, action, reason);
      showToast(action === 'VERIFY' ? 'Undertaking verified and closed.' : 'Clarification requested from institution.');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Reset Demo Data
  const handleResetDemo = async () => {
    if (!confirm('Reset all applications, compliance records, and EVC queues back to standard SIH 2026 baseline?')) return;
    try {
      await apiClient.resetDemoData();
      showToast('Demonstration dataset reset to initial state.');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Trigger Deadline Evaluation
  const handleTriggerDeadlines = async () => {
    try {
      const res = await apiClient.triggerDeadlineEvaluation();
      showToast(`Watchdog scan completed: ${res.summary.expired_documents} expired docs, ${res.summary.overdue_undertakings} overdue undertakings.`);
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Top-Level Public Landing Page Gate
  if (showLanding) {
    return (
      <>
        <LandingPage
          onOpenAuth={() => setShowLanding(false)}
          onOpenPrivacy={() => setInfoModalType('privacy')}
          onOpenTerms={() => setInfoModalType('terms')}
        />
        <InfoModal
          isOpen={infoModalType !== null}
          type={infoModalType}
          onClose={() => setInfoModalType(null)}
        />
      </>
    );
  }

  // =========================================================================
  // MAIN APPLICATION: STATUTORY REGULATORY COMMAND CENTER (OBSIDIAN & PLATINUM)
  // =========================================================================
  return (
    <div className="flex min-h-screen bg-[#07090D] text-platinum-100 font-sans selection:bg-white/20 selection:text-white">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-mono border backdrop-blur-xl flex items-center space-x-3 transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/80 text-rose-200 border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
              : 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40 shadow-[0_0_25px_rgba(52,211,153,0.3)]'
          }`}
        >
          <span>{toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Obsidian Executive Sidebar */}
      <aside className="w-64 bg-[#0A0D14] border-r border-white/10 text-platinum-300 flex flex-col justify-between shrink-0 shadow-2xl z-30 select-none">
        <div>
          {/* Logo & Bureau Badge Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/20 flex items-center justify-center font-bold text-white shadow-inner font-display text-sm">
                A
              </div>
              <div>
                <div className="font-bold text-white text-sm leading-tight flex items-center gap-1.5 font-display">
                  <span>ApprovalFlow AI</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-platinum-300 border border-white/15">26262</span>
                </div>
                <span className="text-[10px] text-platinum-400 font-mono tracking-wide">AICTE REGULATION BUREAU</span>
              </div>
            </div>
            <button
              onClick={() => setShowLanding(true)}
              title="Return to Public Landing Page"
              className="p-1.5 rounded-lg text-platinum-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items with Precision Lucide Icons */}
          <nav className="p-3 space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                  : 'text-platinum-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                  : 'text-platinum-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FolderKanban className="w-4 h-4" />
                <span>Applications</span>
              </div>
              {summary && (
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                  activeTab === 'applications' ? 'bg-black text-white' : 'bg-white/[0.08] text-platinum-300 border border-white/10'
                }`}>
                  {summary.total_applications}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('evc')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'evc'
                  ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                  : 'text-platinum-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Building2 className="w-4 h-4" />
                <span>EVC Inspection</span>
              </div>
              {summary && summary.pending_evc > 0 && (
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                  activeTab === 'evc' ? 'bg-black text-white' : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                }`}>
                  {summary.pending_evc}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('compliance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'compliance'
                  ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                  : 'text-platinum-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Scale className="w-4 h-4" />
                <span>Compliance Tracker</span>
              </div>
              {summary && summary.pending_compliance > 0 && (
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                  activeTab === 'compliance' ? 'bg-black text-white' : 'bg-white/[0.08] text-platinum-300 border border-white/10'
                }`}>
                  {summary.pending_compliance}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                  : 'text-platinum-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileClock className="w-4 h-4" />
                <span>Document Expiry</span>
              </div>
              {summary && summary.upcoming_expiries > 0 && (
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                  activeTab === 'documents' ? 'bg-black text-white' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                }`}>
                  {summary.upcoming_expiries}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.35)]'
                  : 'text-platinum-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <History className="w-4 h-4" />
                <span>Audit Ledger</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer & Operational Controls */}
        <div className="p-3.5 border-t border-white/10 space-y-2.5">
          <div className="bg-white/[0.03] p-3 rounded-2xl border border-white/10 text-[11px] text-platinum-400 space-y-2">
            <div className="flex items-center justify-between font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SLA Watchdog
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">NOMINAL</span>
            </div>
            <p className="text-[10px] leading-relaxed text-platinum-400 font-sans">Automated background scanner & director escalations active.</p>
            <button
              type="button"
              onClick={handleTriggerDeadlines}
              className="w-full text-center py-1.5 bg-white/[0.06] hover:bg-white/10 border border-white/15 text-white rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Run Watchdog Scan</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetDemo}
            className="w-full text-center py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-mono font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-rose-400" />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#0A0D14]/90 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-20 shadow-glass-island">
          <div className="flex items-center space-x-3">
            <span className="text-base sm:text-lg font-bold font-display text-white capitalize tracking-tight">
              {activeTab === 'dashboard' ? 'Regulatory Operational Dashboard' : activeTab.replace('_', ' ')}
            </span>
            <span className="text-[11px] bg-white/[0.04] text-platinum-400 px-2.5 py-0.5 rounded-full border border-white/10 font-mono hidden sm:inline">
              Academic Year 2026-2027
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Global Vengeance Search Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs text-platinum-300 hover:text-white font-mono transition cursor-pointer shadow-sm group"
              title="Open Command Palette (Ctrl+K / ⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-platinum-400 group-hover:text-white transition" />
              <span className="hidden lg:inline text-platinum-400 group-hover:text-platinum-200">Search anything...</span>
              <kbd className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-platinum-300 font-bold border border-white/10">⌘K</kbd>
            </button>

            {/* Region Filter Dropdown */}
            <AnimatedDropdown
              icon={<Globe className="w-3.5 h-3.5 text-platinum-400" />}
              value={selectedRegion}
              onChange={(val) => setSelectedRegion(val)}
              options={[
                { value: 'ALL', label: 'All Regions (National)' },
                { value: 'Eastern', label: 'Eastern Region' },
                { value: 'Western', label: 'Western Region' },
                { value: 'Northern', label: 'Northern Region' },
                { value: 'Southern', label: 'Southern Region' },
                { value: 'Central', label: 'Central Region' },
              ]}
            />

            {/* Role Switcher Animated Dropdown */}
            <AnimatedDropdown
              icon={<UserCheck className="w-3.5 h-3.5 text-platinum-300" />}
              labelPrefix="Role:"
              value={activeRole}
              onChange={(val) => setActiveRole(val as UserRole)}
              options={[
                { value: 'SCRUTINY_OFFICER', label: 'Scrutiny Officer (Er. Priya Sharma)', badge: 'Tech-I', badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-500/30' },
                { value: 'EVC_COORDINATOR', label: 'EVC Coordinator (Prof. S. R. Rao)', badge: 'EVC', badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30' },
                { value: 'SUPERVISOR', label: 'Bureau Officer (Dr. Anil S.)', badge: 'Council', badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-500/30' },
                { value: 'INSTITUTION_REP', label: 'Institution Rep (Dr. K. S. Raman)', badge: 'Applicant', badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' },
                { value: 'ADMIN', label: 'System Administrator', badge: 'Root', badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-500/30' },
              ]}
            />

            {/* Notification Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-platinum-400 hover:text-white hover:bg-white/[0.06] rounded-xl border border-white/10 transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Back to Landing Page CTA */}
            <button
              type="button"
              onClick={() => setShowLanding(true)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/15 text-platinum-300 hover:text-white text-xs font-mono transition flex items-center gap-1.5 cursor-pointer hidden md:flex"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>
          </div>
        </header>

        {/* Statutory Guardrail Notice */}
        <div className="bg-amber-950/20 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-200/90">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300">Statutory Human Authority Guardrail:</strong> Routine routing, prerequisite checking, and SLA escalations are automated. All statutory approval, rejection, and verification decisions remain strictly reserved for competent human authorities.
            </span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30 shrink-0 hidden sm:inline">
            APH 2026-27 Compliant
          </span>
        </div>

        {/* Contextual Action Center Ribbon for Roles */}
        {activeRole === 'INSTITUTION_REP' && (
          <div className="bg-sky-950/40 border-b border-sky-500/25 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="font-bold text-white font-display">Institutional Representative Action Center:</span>
              <span className="text-platinum-300 hidden md:inline">Deficiency responses and time-bound renewals requiring your submission.</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('applications');
                  setStatusFilter('RETURNED');
                }}
                className="px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-amber-900/60 transition cursor-pointer"
              >
                <span>⚠️ 1 Deficiency Notice Awaiting Resubmission</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('documents');
                  setDocumentsStatusFilter('APPROACHING_EXPIRY');
                }}
                className="px-2.5 py-1 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-rose-900/60 transition cursor-pointer"
              >
                <span>⏳ Fire Safety NOC (18 Days Left)</span>
              </button>
            </div>
          </div>
        )}

        {activeRole === 'SCRUTINY_OFFICER' && (
          <div className="bg-emerald-950/30 border-b border-emerald-500/25 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-white font-display">Scrutiny Officer Workdesk (Er. Priya Sharma):</span>
              <span className="text-platinum-300 hidden md:inline">Regulatory queue status for Academic Year 2026-27.</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('applications');
                  setStageFilter('SCRUTINY');
                }}
                className="px-2.5 py-1 rounded-full bg-sky-950/60 text-sky-300 border border-sky-500/40 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-sky-900/60 transition cursor-pointer"
              >
                <span>🔎 {summary.pending_scrutiny} In Active Scrutiny</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('compliance');
                  setComplianceStatusFilter('EVIDENCE_SUBMITTED');
                }}
                className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-emerald-900/60 transition cursor-pointer"
              >
                <span>✓ Evidence Verification Pending</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Canvas */}
        <div className="p-6 space-y-6 flex-1">
          {/* ========================================================= */}
          {/* TAB 1: OPERATIONAL DASHBOARD                               */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Primary KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0D1017]/95 p-5 rounded-2xl border border-white/10 shadow-glass-island flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-platinum-400 uppercase tracking-wider">Total Dossiers</div>
                    <div className="text-3xl font-extrabold text-white font-display mt-1">{summary.total_applications}</div>
                    <div className="text-xs text-platinum-400 mt-1">{summary.approved_count} Approved · {summary.rejected_count} Rejected</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 text-platinum-200 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#0D1017]/95 p-5 rounded-2xl border border-white/10 shadow-glass-island flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-platinum-400 uppercase tracking-wider">In Scrutiny</div>
                    <div className="text-3xl font-extrabold text-sky-400 font-display mt-1">{summary.pending_scrutiny}</div>
                    <div className="text-xs text-amber-400 mt-1 font-medium">{summary.returned_for_clarification} Awaiting Institution</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#0D1017]/95 p-5 rounded-2xl border border-white/10 shadow-glass-island flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-platinum-400 uppercase tracking-wider">EVC Inspection Queue</div>
                    <div className="text-3xl font-extrabold text-indigo-400 font-display mt-1">{summary.pending_evc}</div>
                    <div className="text-xs text-platinum-400 mt-1 font-medium">{summary.under_sac_shc} Under SAC/SHC Review</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#0D1017]/95 p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 shadow-glass-island flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-rose-300 uppercase tracking-wider">SLA / Expiry Alerts</div>
                    <div className="text-3xl font-extrabold text-rose-400 font-display mt-1">{summary.overdue_count + summary.upcoming_expiries}</div>
                    <div className="text-xs text-rose-300/80 mt-1 font-medium">{summary.overdue_count} Overdue · {summary.upcoming_expiries} Expiring Docs</div>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Vengeance UI Expandable Agent Bento Grid with Recharts Graphs & Pie Charts */}
              <AgentBentoGrid
                summary={summary}
                applications={applications}
                complianceList={complianceList}
                documents={documents}
                auditEvents={auditEvents}
                onSelectApplication={handleOpenDetail}
                onTriggerWatchdog={handleTriggerDeadlines}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: APPLICATIONS REGISTER                               */}
          {/* ========================================================= */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Option 1: Vengeance UI Testimonials-Style Scrutiny Spotlight Deck */}
              <ScrutinySpotlightDeck
                applications={applications}
                onSelectApplication={handleOpenDetail}
              />

              {/* Filter, Search & View Mode Switcher */}
              <div className="bg-[#0D1017]/95 p-4 rounded-2xl border border-white/10 shadow-glass-island flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 flex-1 min-w-[260px] bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5">
                  <Search className="w-4 h-4 text-platinum-400" />
                  <input
                    type="text"
                    placeholder="Search by Application No. or Institution Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs text-white placeholder-platinum-500 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Stage Animated Dropdown */}
                  <AnimatedDropdown
                    labelPrefix="Stage:"
                    value={stageFilter}
                    onChange={(val) => setStageFilter(val)}
                    placeholder="All Stages"
                    options={[
                      { value: '', label: 'All Stages' },
                      { value: 'SCRUTINY', label: 'Scrutiny', badge: 'Stage 1' },
                      { value: 'EVC', label: 'EVC Inspection', badge: 'Stage 2' },
                      { value: 'SAC_SHC', label: 'SAC/SHC Hearing', badge: 'Stage 3' },
                      { value: 'FINAL_REVIEW', label: 'Final Review', badge: 'Stage 4' },
                      { value: 'COMPLETED', label: 'Completed', badge: 'Stage 5' },
                    ]}
                  />

                  {/* Status Animated Dropdown */}
                  <AnimatedDropdown
                    labelPrefix="Status:"
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    placeholder="All Statuses"
                    options={[
                      { value: '', label: 'All Statuses' },
                      { value: 'IN_REVIEW', label: 'In Review', badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-500/30' },
                      { value: 'RETURNED', label: 'Returned (Awaiting Clarification)', badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
                      { value: 'APPROVED', label: 'Approved', badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' },
                      { value: 'REJECTED', label: 'Rejected', badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-500/30' },
                    ]}
                  />

                  {/* View Mode Toggle: Dossier Deck vs Table Register */}
                  <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => setApplicationsViewMode('cards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        applicationsViewMode === 'cards'
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'text-platinum-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Dossier Deck</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplicationsViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        applicationsViewMode === 'table'
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'text-platinum-400 hover:text-white'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table Register</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* View 1: Dossier Deck Grid View (Important Preview Parts) */}
              {applicationsViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => handleOpenDetail(app.id)}
                      className="bg-[#0D1017]/95 hover:bg-[#111520] border border-white/10 hover:border-white/25 rounded-2xl p-5 shadow-glass-island transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/10 transition" />

                      <div>
                        {/* Header: App No & Region */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold text-white bg-white/[0.06] px-2.5 py-0.5 rounded-md border border-white/10">
                            {app.application_number}
                          </span>
                          <span className="text-[10px] font-mono text-platinum-400">
                            {app.region}
                          </span>
                        </div>

                        {/* Institution Name */}
                        <h4 className="text-sm font-bold font-display text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                          {app.institution_name}
                        </h4>
                        <span className="text-[10px] font-mono text-platinum-400 mt-1 inline-block">
                          {app.application_type}
                        </span>
                      </div>

                      {/* Stage & Status Badges */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-platinum-400">Statutory Stage:</span>
                          <span className="px-2 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                            {app.current_stage}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-platinum-400">Status:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              app.operational_status === 'APPROVED'
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                : app.operational_status === 'RETURNED'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                : app.operational_status === 'REJECTED'
                                ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                                : 'bg-white/[0.06] text-white border border-white/15'
                            }`}
                          >
                            {app.operational_status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono pt-1">
                          <span className="text-platinum-500 text-[10px]">Ageing in stage:</span>
                          <span className={`text-[10px] font-bold ${app.is_overdue ? 'text-rose-400' : 'text-platinum-300'}`}>
                            {app.days_in_current_stage} days {app.is_overdue && '⚠️ SLA BREACH'}
                          </span>
                        </div>
                      </div>

                      {/* Footer Action */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono text-platinum-500">
                          {app.assigned_to || 'Er. Priya Sharma'}
                        </span>
                        <span className="text-xs font-mono font-semibold text-white group-hover:text-sky-300 flex items-center gap-1 transition">
                          <span>Review Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* View 2: Traditional Table Register View */
                <div className="bg-[#0D1017]/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#111520] border-b border-white/10 text-platinum-400 font-mono uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">Application ID</th>
                        <th className="py-3.5 px-4">Institution Name</th>
                        <th className="py-3.5 px-4">Region</th>
                        <th className="py-3.5 px-4">Type</th>
                        <th className="py-3.5 px-4">Current Stage</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Ageing</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-white/[0.03] transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {app.application_number}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-platinum-100 max-w-xs truncate">
                            {app.institution_name}
                          </td>
                          <td className="py-3.5 px-4 text-platinum-400">{app.region}</td>
                          <td className="py-3.5 px-4 text-platinum-400 max-w-xs truncate">{app.application_type}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-white/[0.05] text-platinum-200 border border-white/10">
                              {app.current_stage}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                                app.operational_status === 'APPROVED'
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                  : app.operational_status === 'RETURNED'
                                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                  : app.operational_status === 'REJECTED'
                                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                                  : 'bg-white/[0.06] text-white border border-white/15'
                              }`}
                            >
                              {app.operational_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className={app.is_overdue ? 'text-rose-400 font-bold' : 'text-platinum-400'}>
                              {app.days_in_current_stage}d {app.is_overdue && '⚠️ SLA'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(app.id)}
                              className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-xs shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:bg-platinum-100 transition cursor-pointer"
                            >
                              Open Dossier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: EVC INSPECTION QUEUE                                */}
          {/* ========================================================= */}
          {activeTab === 'evc' && (
            <div className="space-y-6">
              {/* EVC Spotlight Deck */}
              <EVCSpotlightDeck
                evcQueue={evcQueue}
                onSelectEVC={(e) => handleOpenEVCDetail(e)}
              />

              {/* Filter, Search & View Mode Switcher */}
              <div className="bg-[#0D1017]/95 p-4 rounded-2xl border border-white/10 shadow-glass-island flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 flex-1 min-w-[260px] bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5">
                  <Search className="w-4 h-4 text-platinum-400" />
                  <input
                    type="text"
                    placeholder="Search EVC queue by institution, app no, or committee lead..."
                    value={evcSearch}
                    onChange={(e) => setEvcSearch(e.target.value)}
                    className="w-full text-xs text-white placeholder-platinum-500 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <AnimatedDropdown
                    labelPrefix="Status:"
                    value={evcStatusFilter}
                    onChange={(val) => setEvcStatusFilter(val)}
                    placeholder="All Statuses"
                    options={[
                      { value: '', label: 'All Statuses' },
                      { value: 'SCHEDULED', label: 'Scheduled Visits', badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30' },
                      { value: 'PENDING_SCHEDULE', label: 'Pending Panel Assignment', badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
                      { value: 'COMPLETED', label: 'Completed Inspections', badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' },
                    ]}
                  />

                  {/* View Mode Toggle: Inspection Deck vs Table Register */}
                  <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => setEvcViewMode('cards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        evcViewMode === 'cards'
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'text-platinum-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Inspection Deck</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEvcViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        evcViewMode === 'table'
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'text-platinum-400 hover:text-white'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table Register</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* View 1: Inspection Deck Cards View */}
              {evcViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {evcQueue
                    .filter((evc) => {
                      const matchesSearch =
                        !evcSearch ||
                        evc.institution_name.toLowerCase().includes(evcSearch.toLowerCase()) ||
                        evc.application_number.toLowerCase().includes(evcSearch.toLowerCase()) ||
                        (evc.assigned_team && evc.assigned_team.toLowerCase().includes(evcSearch.toLowerCase()));
                      const matchesStatus = !evcStatusFilter || evc.status === evcStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((evc) => (
                      <div
                        key={evc.id}
                        onClick={() => handleOpenEVCDetail(evc)}
                        className="bg-[#0D1017]/95 hover:bg-[#111520] border border-white/10 hover:border-white/25 rounded-2xl p-5 shadow-glass-island transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition" />

                        <div>
                          {/* Header: App No & Status */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-white bg-white/[0.06] px-2.5 py-0.5 rounded-md border border-white/10">
                              {evc.application_number}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                evc.status === 'COMPLETED'
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                                  : evc.status === 'SCHEDULED'
                                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40'
                                  : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {evc.status}
                            </span>
                          </div>

                          {/* Institution Name */}
                          <h4 className="text-sm font-bold font-display text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {evc.institution_name}
                          </h4>
                          <span className="text-xs text-platinum-400 font-mono flex items-center gap-1 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-platinum-400" />
                            {evc.region} Region
                          </span>

                          <div className="mt-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 font-mono text-[11px]">
                            <div className="flex items-center justify-between text-platinum-400">
                              <span>Inspection Date:</span>
                              <span className="text-white font-medium">{evc.scheduled_at ? new Date(evc.scheduled_at).toLocaleDateString() : 'Unscheduled'}</span>
                            </div>
                            <div className="flex items-center justify-between text-platinum-400">
                              <span>Assigned Panel:</span>
                              <span className="text-platinum-300 truncate max-w-[140px]">{evc.assigned_team || 'Pending Lead'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Infrastructure Audit Badges */}
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                              <FileCheck2 className="w-3 h-3 text-indigo-400" />
                              <span>180 PC CAD Lab</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Geo-Tagged Bounds</span>
                            </span>
                          </div>
                        </div>

                        {/* Footer Action Strip */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEVCDetail(evc);
                              setIsEVCReportOpen(true);
                            }}
                            className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline cursor-pointer"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Appraisal Report</span>
                          </button>

                          <div className="flex items-center space-x-1.5">
                            {evc.status === 'PENDING_SCHEDULE' && activeRole === 'EVC_COORDINATOR' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(evc.application_id);
                                  setIsScheduleEvcModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-white text-black font-semibold rounded-lg text-[10px] transition cursor-pointer shadow-sm"
                              >
                                Schedule Visit
                              </button>
                            )}

                            {evc.status === 'SCHEDULED' && activeRole === 'EVC_COORDINATOR' && (
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const summaryText = window.prompt('Enter EVC physical inspection findings summary:', 'Physical labs, workshops, and teacher cadre verified compliant.');
                                  if (!summaryText) return;
                                  await apiClient.completeEVC(evc.id, 'RECOMMENDED', summaryText);
                                  showToast('EVC inspection completed and submitted.');
                                  refreshData();
                                }}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-[10px] transition cursor-pointer shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                              >
                                Submit Findings
                              </button>
                            )}

                            <span className="text-platinum-300 group-hover:text-white text-xs font-mono flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              Inspect <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                /* View 2: Table Register View */
                <div className="bg-[#0D1017]/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#111520] border-b border-white/10 text-platinum-400 font-mono uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">Application No</th>
                        <th className="py-3.5 px-4">Institution</th>
                        <th className="py-3.5 px-4">Region</th>
                        <th className="py-3.5 px-4">Scheduled Date</th>
                        <th className="py-3.5 px-4">Assigned Panel</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {evcQueue
                        .filter((evc) => {
                          const matchesSearch =
                            !evcSearch ||
                            evc.institution_name.toLowerCase().includes(evcSearch.toLowerCase()) ||
                            evc.application_number.toLowerCase().includes(evcSearch.toLowerCase()) ||
                            (evc.assigned_team && evc.assigned_team.toLowerCase().includes(evcSearch.toLowerCase()));
                          const matchesStatus = !evcStatusFilter || evc.status === evcStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map((evc) => (
                          <tr
                            key={evc.id}
                            onClick={() => handleOpenEVCDetail(evc)}
                            className="hover:bg-white/[0.04] transition cursor-pointer"
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-white hover:text-indigo-300 transition-colors">
                              {evc.application_number}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-platinum-200">{evc.institution_name}</td>
                            <td className="py-3.5 px-4 font-mono text-platinum-400">{evc.region}</td>
                            <td className="py-3.5 px-4 font-mono text-platinum-300">
                              {evc.scheduled_at ? new Date(evc.scheduled_at).toLocaleDateString() : 'Unscheduled'}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-platinum-300">{evc.assigned_team || 'Unassigned'}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                                  evc.status === 'COMPLETED'
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                    : evc.status === 'SCHEDULED'
                                    ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
                                    : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {evc.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEVCDetail(evc);
                                  setIsEVCReportOpen(true);
                                }}
                                className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/10 text-indigo-300 rounded-lg text-[11px] transition font-mono border border-indigo-500/20"
                              >
                                Report
                              </button>
                              {evc.status === 'PENDING_SCHEDULE' && activeRole === 'EVC_COORDINATOR' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenDetail(evc.application_id);
                                    setIsScheduleEvcModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-[11px] transition cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                                >
                                  Schedule Visit
                                </button>
                              )}
                              {evc.status === 'SCHEDULED' && activeRole === 'EVC_COORDINATOR' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const summaryText = window.prompt('Enter EVC physical inspection findings summary:', 'Physical labs, workshops, and teacher cadre verified compliant.');
                                    if (!summaryText) return;
                                    await apiClient.completeEVC(evc.id, 'RECOMMENDED', summaryText);
                                    showToast('EVC inspection completed and submitted.');
                                    refreshData();
                                  }}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-[11px] transition cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                                >
                                  Submit Findings
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: COMPLIANCE TRACKER                                 */}
          {/* ========================================================= */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Compliance Spotlight Deck */}
              <ComplianceSpotlightDeck
                complianceList={complianceList}
                onSelectUndertaking={(u) => handleOpenUndertakingDetail(u)}
              />

              {/* Filter, Search & View Mode Switcher */}
              <div className="bg-[#0D1017]/95 p-4 rounded-2xl border border-white/10 shadow-glass-island flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 flex-1 min-w-[260px] bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5">
                  <Search className="w-4 h-4 text-platinum-400" />
                  <input
                    type="text"
                    placeholder="Search undertakings by title, clause, or institution name..."
                    value={complianceSearch}
                    onChange={(e) => setComplianceSearch(e.target.value)}
                    className="w-full text-xs text-white placeholder-platinum-500 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <AnimatedDropdown
                    labelPrefix="Status:"
                    value={complianceStatusFilter}
                    onChange={(val) => setComplianceStatusFilter(val)}
                    placeholder="All Statuses"
                    options={[
                      { value: '', label: 'All Statuses' },
                      { value: 'VERIFIED_CLOSED', label: 'Verified Closed', badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' },
                      { value: 'EVIDENCE_SUBMITTED', label: 'Evidence Submitted', badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-500/30' },
                      { value: 'PENDING', label: 'Pending Evidence', badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
                      { value: 'OVERDUE', label: 'Overdue', badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-500/30' },
                      { value: 'CLARIFICATION_REQUIRED', label: 'Clarification Required', badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
                    ]}
                  />

                  {/* View Mode Toggle: Undertaking Deck vs Table Register */}
                  <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => setComplianceViewMode('cards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        complianceViewMode === 'cards'
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'text-platinum-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Undertaking Deck</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setComplianceViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        complianceViewMode === 'table'
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'text-platinum-400 hover:text-white'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table Register</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* View 1: Undertaking Deck Grid View */}
              {complianceViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {complianceList
                    .filter((c) => {
                      const matchesSearch =
                        !complianceSearch ||
                        c.title.toLowerCase().includes(complianceSearch.toLowerCase()) ||
                        (c.institution_name && c.institution_name.toLowerCase().includes(complianceSearch.toLowerCase())) ||
                        (c.description && c.description.toLowerCase().includes(complianceSearch.toLowerCase()));
                      const matchesStatus = !complianceStatusFilter || c.status === complianceStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleOpenUndertakingDetail(c)}
                        className="bg-[#0D1017]/95 hover:bg-[#111520] border border-white/10 hover:border-white/25 rounded-2xl p-5 shadow-glass-island transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition" />

                        <div>
                          {/* Header: Due Date & Status */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-white bg-white/[0.06] px-2.5 py-0.5 rounded-md border border-white/10">
                              Due: {c.due_date}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                c.status === 'VERIFIED_CLOSED'
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                                  : c.status === 'EVIDENCE_SUBMITTED'
                                  ? 'bg-sky-950/60 text-sky-300 border border-sky-500/40'
                                  : c.status === 'OVERDUE'
                                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {c.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Undertaking Title */}
                          <h4 className="text-sm font-bold font-display text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                            {c.title}
                          </h4>
                          <span className="text-xs text-platinum-400 font-mono flex items-center gap-1 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-platinum-400" />
                            {c.institution_name || 'Apex Institute of Technology & Management'}
                          </span>

                          <p className="text-xs text-platinum-400 mt-2 font-sans line-clamp-2 leading-relaxed">
                            {c.description || 'Mandatory statutory undertaking under AICTE APH 2026-27 compliance requirements.'}
                          </p>
                        </div>

                        {/* Evidence File & Forensic Status */}
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-platinum-400">Attached Evidence:</span>
                            {c.evidence_filename ? (
                              <span className="text-emerald-300 font-medium truncate max-w-[150px] underline">
                                {c.evidence_filename}
                              </span>
                            ) : (
                              <span className="text-platinum-500 italic">None attached</span>
                            )}
                          </div>

                          {/* AI Forensic Check Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Notarized Seal</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-sky-400" />
                              <span>GIS Mapped</span>
                            </span>
                          </div>
                        </div>

                        {/* Footer Action Strip */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUndertakingDetail(c);
                              setIsComplianceReportOpen(true);
                            }}
                            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Clearance Memo</span>
                          </button>

                          <div className="flex items-center space-x-1.5">
                            {c.status === 'PENDING' && activeRole === 'INSTITUTION_REP' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUndertakingId(c.id);
                                  setIsSubmitEvidenceModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-white text-black font-semibold rounded-lg text-[10px] transition cursor-pointer shadow-sm"
                              >
                                Upload Evidence
                              </button>
                            )}

                            {c.status === 'EVIDENCE_SUBMITTED' && (activeRole === 'SCRUTINY_OFFICER' || activeRole === 'SUPERVISOR') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReviewCompliance(c.id, 'VERIFY');
                                }}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-[10px] transition cursor-pointer shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                              >
                                Verify & Close
                              </button>
                            )}

                            <span className="text-platinum-300 group-hover:text-white text-xs font-mono flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              Inspect <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                /* View 2: Table Register View */
                <div className="bg-[#0D1017]/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#111520] border-b border-white/10 text-platinum-400 font-mono uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">Undertaking Title</th>
                        <th className="py-3.5 px-4">Institution</th>
                        <th className="py-3.5 px-4">Due Date</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Evidence</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {complianceList
                        .filter((c) => {
                          const matchesSearch =
                            !complianceSearch ||
                            c.title.toLowerCase().includes(complianceSearch.toLowerCase()) ||
                            (c.institution_name && c.institution_name.toLowerCase().includes(complianceSearch.toLowerCase())) ||
                            (c.description && c.description.toLowerCase().includes(complianceSearch.toLowerCase()));
                          const matchesStatus = !complianceStatusFilter || c.status === complianceStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map((c) => (
                          <tr
                            key={c.id}
                            onClick={() => handleOpenUndertakingDetail(c)}
                            className="hover:bg-white/[0.04] transition cursor-pointer"
                          >
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white hover:text-emerald-300 transition-colors">{c.title}</div>
                              <div className="text-platinum-400 text-[11px] max-w-sm truncate">{c.description}</div>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-platinum-200">{c.institution_name || 'Technical Institution'}</td>
                            <td className="py-3.5 px-4 font-mono text-platinum-300">{c.due_date}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                                  c.status === 'VERIFIED_CLOSED'
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                    : c.status === 'OVERDUE'
                                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                                    : c.status === 'EVIDENCE_SUBMITTED'
                                    ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30'
                                    : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {c.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-platinum-300">
                              {c.evidence_filename ? (
                                <span className="font-mono text-platinum-200 underline">{c.evidence_filename}</span>
                              ) : (
                                <span className="text-platinum-500 italic">None attached</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUndertakingDetail(c);
                                  setIsComplianceReportOpen(true);
                                }}
                                className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/10 text-emerald-300 rounded-lg text-[11px] transition font-mono border border-emerald-500/20"
                              >
                                Memo
                              </button>
                              {c.status === 'PENDING' && activeRole === 'INSTITUTION_REP' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUndertakingId(c.id);
                                    setIsSubmitEvidenceModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-[11px] transition cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                                >
                                  Upload Evidence
                                </button>
                              )}
                              {c.status === 'EVIDENCE_SUBMITTED' && (activeRole === 'SCRUTINY_OFFICER' || activeRole === 'SUPERVISOR') && (
                                <button
                                  type="button"
                                  onClick={() => handleReviewCompliance(c.id, 'VERIFY')}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-[11px] transition cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                                >
                                  Verify & Close
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: DOCUMENT EXPIRY VAULT                              */}
          {/* ========================================================= */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Document Spotlight Deck */}
              <DocumentSpotlightDeck
                documents={documents}
                onSelectDocument={(d) => handleOpenDocumentDetail(d)}
              />

              {/* Filter, Search & View Mode Switcher */}
              <div className="bg-[#0D1017]/95 p-4 rounded-2xl border border-white/10 shadow-glass-island flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 flex-1 min-w-[260px] bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5">
                  <Search className="w-4 h-4 text-platinum-400" />
                  <input
                    type="text"
                    placeholder="Search documents by type, filename, or institution..."
                    value={documentsSearch}
                    onChange={(e) => setDocumentsSearch(e.target.value)}
                    className="w-full text-xs text-white placeholder-platinum-500 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <AnimatedDropdown
                    labelPrefix="Status:"
                    value={documentsStatusFilter}
                    onChange={(val) => setDocumentsStatusFilter(val)}
                    placeholder="All Statuses"
                    options={[
                      { value: '', label: 'All Statuses' },
                      { value: 'VALID', label: 'Valid Clearances', badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' },
                      { value: 'APPROACHING_EXPIRY', label: 'Approaching Expiry (<30d)', badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-500/30' },
                      { value: 'RENEWAL_SUBMITTED', label: 'Renewal Submitted', badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-500/30' },
                      { value: 'EXPIRED', label: 'Expired / Overdue', badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-500/30' },
                    ]}
                  />

                  {/* View Mode Toggle: Document Deck vs Table Register */}
                  <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => setDocumentsViewMode('cards')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        documentsViewMode === 'cards'
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'text-platinum-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Document Deck</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocumentsViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5 cursor-pointer ${
                        documentsViewMode === 'table'
                          ? 'bg-white text-black font-semibold shadow-sm'
                          : 'text-platinum-400 hover:text-white'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Table Register</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* View 1: Document Deck Grid View */}
              {documentsViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {documents
                    .filter((doc) => {
                      const matchesSearch =
                        !documentsSearch ||
                        doc.document_type.toLowerCase().includes(documentsSearch.toLowerCase()) ||
                        doc.filename.toLowerCase().includes(documentsSearch.toLowerCase()) ||
                        (doc.institution_name && doc.institution_name.toLowerCase().includes(documentsSearch.toLowerCase()));
                      const matchesStatus = !documentsStatusFilter || doc.review_status === documentsStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => handleOpenDocumentDetail(doc)}
                        className="bg-[#0D1017]/95 hover:bg-[#111520] border border-white/10 hover:border-white/25 rounded-2xl p-5 shadow-glass-island transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition" />

                        <div>
                          {/* Header: Review Status & Expiry Tag */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-white bg-white/[0.06] px-2.5 py-0.5 rounded-md border border-white/10">
                              Expires: {doc.expires_on || 'Indefinite'}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                doc.review_status === 'VALID'
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                                  : doc.review_status === 'APPROACHING_EXPIRY'
                                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 animate-pulse'
                                  : doc.review_status === 'RENEWAL_SUBMITTED'
                                  ? 'bg-sky-950/60 text-sky-300 border border-sky-500/40'
                                  : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {doc.review_status === 'APPROACHING_EXPIRY' ? 'EXPIRING SOON' : doc.review_status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Document Title */}
                          <h4 className="text-sm font-bold font-display text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                            {doc.document_type}
                          </h4>
                          <span className="text-xs text-platinum-400 font-mono flex items-center gap-1 mt-1">
                            <Building2 className="w-3.5 h-3.5 text-platinum-400" />
                            {doc.institution_name || 'Apex Institute of Technology & Management'}
                          </span>

                          <div className="mt-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono text-platinum-400">
                              <span>Vault File:</span>
                              <span className="text-white font-medium truncate max-w-[140px]">{doc.filename}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-mono text-platinum-400">
                              <span>Valid Range:</span>
                              <span className="text-platinum-300">{doc.valid_from || '—'} → {doc.expires_on || '—'}</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Authenticity Forensics Badges */}
                        <div className="space-y-2 pt-2 border-t border-white/10">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3 text-amber-400" />
                              <span>NBC Part 4 Verified</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Sub-Registrar Endorsed</span>
                            </span>
                          </div>
                        </div>

                        {/* Footer Action Strip */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocumentDetail(doc);
                              setIsDocumentNoticeOpen(true);
                            }}
                            className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 underline cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Show-Cause Notice</span>
                          </button>

                          <div className="flex items-center space-x-1.5">
                            {(doc.review_status === 'EXPIRED' || doc.review_status === 'APPROACHING_EXPIRY') && activeRole === 'INSTITUTION_REP' && (
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const newFile = window.prompt('Enter renewed document filename:', 'Renewed_Clearance_2026.pdf');
                                  if (!newFile) return;
                                  await apiClient.renewDocument(doc.id, newFile);
                                  showToast('Renewal evidence submitted for verification.');
                                  refreshData();
                                }}
                                className="px-2.5 py-1 bg-white text-black font-semibold rounded-lg text-[10px] transition cursor-pointer shadow-sm"
                              >
                                Upload Renewal
                              </button>
                            )}

                            {doc.review_status === 'RENEWAL_SUBMITTED' && (activeRole === 'SCRUTINY_OFFICER' || activeRole === 'SUPERVISOR') && (
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await apiClient.verifyDocument(doc.id, 'VALID', 'Renewed registration confirmed.');
                                  showToast('Document verified as VALID.');
                                  refreshData();
                                }}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-[10px] transition cursor-pointer shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                              >
                                Verify Renewal
                              </button>
                            )}

                            <span className="text-platinum-300 group-hover:text-white text-xs font-mono flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              Inspect <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                /* View 2: Table Register View */
                <div className="bg-[#0D1017]/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#111520] border-b border-white/10 text-platinum-400 font-mono uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4">Document Type</th>
                        <th className="py-3.5 px-4">Institution</th>
                        <th className="py-3.5 px-4">File Name</th>
                        <th className="py-3.5 px-4">Valid From</th>
                        <th className="py-3.5 px-4">Expires On</th>
                        <th className="py-3.5 px-4">Review Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {documents
                        .filter((doc) => {
                          const matchesSearch =
                            !documentsSearch ||
                            doc.document_type.toLowerCase().includes(documentsSearch.toLowerCase()) ||
                            doc.filename.toLowerCase().includes(documentsSearch.toLowerCase()) ||
                            (doc.institution_name && doc.institution_name.toLowerCase().includes(documentsSearch.toLowerCase()));
                          const matchesStatus = !documentsStatusFilter || doc.review_status === documentsStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map((doc) => (
                          <tr
                            key={doc.id}
                            onClick={() => handleOpenDocumentDetail(doc)}
                            className="hover:bg-white/[0.04] transition cursor-pointer"
                          >
                            <td className="py-3.5 px-4 font-bold text-white hover:text-amber-300 transition-colors">{doc.document_type}</td>
                            <td className="py-3.5 px-4 font-medium text-platinum-200">{doc.institution_name || 'Apex Institute of Technology & Management'}</td>
                            <td className="py-3.5 px-4 font-mono text-platinum-300">{doc.filename}</td>
                            <td className="py-3.5 px-4 font-mono text-platinum-400">{doc.valid_from || '—'}</td>
                            <td className="py-3.5 px-4 font-mono text-platinum-400">{doc.expires_on || '—'}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                                  doc.review_status === 'VALID'
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                    : doc.review_status === 'APPROACHING_EXPIRY'
                                    ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                                    : doc.review_status === 'RENEWAL_SUBMITTED'
                                    ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30'
                                    : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {doc.review_status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDocumentDetail(doc);
                                  setIsDocumentNoticeOpen(true);
                                }}
                                className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/10 text-rose-300 rounded-lg text-[11px] transition font-mono border border-rose-500/20"
                              >
                                Notice
                              </button>
                              {(doc.review_status === 'EXPIRED' || doc.review_status === 'APPROACHING_EXPIRY') && activeRole === 'INSTITUTION_REP' && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const newFile = window.prompt('Enter renewed document filename:', 'Renewed_Lease_Agreement_2026.pdf');
                                    if (!newFile) return;
                                    await apiClient.renewDocument(doc.id, newFile);
                                    showToast('Renewal evidence submitted for verification.');
                                    refreshData();
                                  }}
                                  className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-[11px] transition cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                                >
                                  Upload Renewal
                                </button>
                              )}
                              {doc.review_status === 'RENEWAL_SUBMITTED' && (activeRole === 'SCRUTINY_OFFICER' || activeRole === 'SUPERVISOR') && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await apiClient.verifyDocument(doc.id, 'VALID', 'Renewed registration confirmed.');
                                    showToast('Document verified as VALID.');
                                    refreshData();
                                  }}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-[11px] transition cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                                >
                                  Verify Renewal
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: AUDIT TRAIL                                        */}
          {/* ========================================================= */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="bg-[#0D1017]/95 p-5 rounded-2xl border border-white/10 shadow-glass-island flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white font-display">Append-Only Cryptographic Audit Ledger</h3>
                  <p className="text-xs text-platinum-400 mt-1 font-sans">Tamper-evident chronological event log capturing officer transitions, deficiency grounds, and automated alerts.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SHA-256 Ledger Verified</span>
                </div>
              </div>

              <div className="bg-[#0D1017]/95 rounded-2xl border border-white/10 shadow-2xl divide-y divide-white/5">
                {auditEvents.map((evt) => (
                  <div key={evt.id} className="p-4 flex items-start justify-between hover:bg-white/[0.03] transition">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-white">{evt.action}</span>
                        <span className="text-[10px] bg-white/[0.06] text-platinum-300 px-2 py-0.5 rounded border border-white/10 uppercase font-mono">
                          {evt.entity_type}
                        </span>
                        {evt.is_system_generated && (
                          <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                            AUTOMATED WATCHDOG
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-platinum-300 font-medium font-sans">
                        Actor: <strong className="text-white">{evt.actor_name}</strong> ({evt.actor_role})
                      </p>
                      {evt.reason && <p className="text-xs text-platinum-400 italic font-sans">"{evt.reason}"</p>}
                    </div>
                    <span className="font-mono text-[11px] text-platinum-500 shrink-0 ml-4">
                      {new Date(evt.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-y-0 right-0 w-84 bg-[#0B0E15] border-l border-white/15 shadow-2xl z-50 flex flex-col text-platinum-100">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white font-display">Regulatory Alerts & Notifications</h3>
            <button onClick={() => setIsNotificationsOpen(false)} className="text-platinum-400 hover:text-white p-1 rounded transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={async () => {
                  await apiClient.markNotificationRead(n.id);
                  refreshData();
                }}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                  n.severity === 'CRITICAL' ? 'bg-rose-950/30 border-rose-500/30 text-rose-200' :
                  n.severity === 'WARNING' ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' :
                  'bg-white/[0.03] border-white/10 text-platinum-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[10px] uppercase font-mono">{n.severity}</span>
                  <span className="text-[10px] text-platinum-500 font-mono">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="font-medium font-sans leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Application Detail Dossier */}
      {isDetailModalOpen && selectedAppDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/15 text-platinum-100">
            {/* Header */}
            <div className="p-6 bg-[#0E121B] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-platinum-400 font-mono tracking-wider uppercase">Institutional Dossier</span>
                <h2 className="text-xl font-bold font-display text-white mt-0.5">{selectedAppDetail.institution?.name || selectedAppDetail.institution_name}</h2>
                <div className="text-xs text-platinum-300 mt-1 flex items-center space-x-3">
                  <span>App No: <strong className="font-mono text-white">{selectedAppDetail.application_number}</strong></span>
                  <span>·</span>
                  <span>Route: <strong className="font-mono text-white">{selectedAppDetail.route_code}</strong></span>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-platinum-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Visual Workflow Steps Progression */}
              <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-white text-xs mb-3 font-display">Approval Workflow Progression</h4>
                <div className="flex items-center justify-between">
                  {['SCRUTINY', 'EVC', 'SAC_SHC', 'FINAL_REVIEW', 'COMPLETED'].map((stage, idx) => {
                    const isDone = ['SCRUTINY', 'EVC', 'SAC_SHC', 'FINAL_REVIEW', 'COMPLETED'].indexOf(selectedAppDetail.current_stage) > idx || selectedAppDetail.operational_status === 'APPROVED';
                    const isCurrent = selectedAppDetail.current_stage === stage;

                    return (
                      <div key={stage} className="flex-1 flex flex-col items-center relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isDone ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]' : isCurrent ? 'bg-white text-black ring-4 ring-white/20 font-extrabold shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/10 text-platinum-500 border border-white/10'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`mt-2 font-medium text-[11px] font-mono ${isCurrent ? 'text-white font-bold' : 'text-platinum-500'}`}>
                          {stage.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clarification Alert if Returned */}
              {selectedAppDetail.operational_status === 'RETURNED' && (
                <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2">
                  <h4 className="font-bold text-amber-300 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Returned to Institution for Deficiencies</span>
                  </h4>
                  <p className="text-platinum-200 font-medium font-sans">"{selectedAppDetail.return_reason}"</p>
                  {selectedAppDetail.requested_items && selectedAppDetail.requested_items.length > 0 && (
                    <div className="text-[11px] text-amber-200/90 pt-1 font-mono">
                      <strong>Mandatory Items Required:</strong>
                      <ul className="list-disc pl-5 mt-1 space-y-0.5">
                        {selectedAppDetail.requested_items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Dossier Information Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10">
                  <span className="text-platinum-500 text-[10px] uppercase font-mono">Current Status</span>
                  <div className="font-bold text-sm text-white mt-0.5 font-mono">{selectedAppDetail.operational_status}</div>
                </div>
                <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10">
                  <span className="text-platinum-500 text-[10px] uppercase font-mono">Assigned Officer</span>
                  <div className="font-bold text-sm text-white mt-0.5">{selectedAppDetail.assigned_to || 'Unassigned'}</div>
                </div>
                <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10">
                  <span className="text-platinum-500 text-[10px] uppercase font-mono">Submitted On</span>
                  <div className="font-bold text-sm text-white mt-0.5 font-mono">{new Date(selectedAppDetail.submitted_at).toLocaleDateString()}</div>
                </div>
                <div className="p-3.5 bg-white/[0.03] rounded-xl border border-white/10">
                  <span className="text-platinum-500 text-[10px] uppercase font-mono">Region & State</span>
                  <div className="font-bold text-sm text-white mt-0.5">{selectedAppDetail.region} ({selectedAppDetail.institution?.state || selectedAppDetail.region})</div>
                </div>
              </div>

              {/* Attached Compliance Documents */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Mandatory Uploaded Dossier Documents</h4>
                <div className="border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
                  {(selectedAppDetail.documents || documents).map((d) => (
                    <div key={d.id} className="p-3.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{d.document_type}</div>
                        <div className="text-[11px] font-mono text-platinum-400">{d.filename}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                        d.review_status === 'VALID' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' :
                        d.review_status === 'APPROACHING_EXPIRY' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                      }`}>
                        {d.review_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Audit History */}
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Workflow Progression History</h4>
                <div className="border border-white/10 rounded-2xl divide-y divide-white/5 overflow-hidden">
                  {(selectedAppDetail.timeline || []).map((item) => (
                    <div key={item.id} className="p-3.5 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-bold text-white font-mono">{item.action}</div>
                        <div className="text-platinum-300 font-sans">{item.reason}</div>
                        <div className="text-[10px] text-platinum-500 font-mono">By {item.actor_name} ({item.actor_role})</div>
                      </div>
                      <span className="font-mono text-[10px] text-platinum-500">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Statutory Pre-Screening & Deficiency Diagnostic (APH 2026-27 Engine) */}
              <div className="bg-[#10141D] p-5 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs font-display flex items-center gap-1.5">
                        <span>AI Statutory Pre-Screening & Deficiency Diagnostic</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 font-semibold">
                          APH 2026-27 Automated Analysis
                        </span>
                      </h4>
                      <p className="text-[11px] text-platinum-400 font-sans">
                        Automated normative evaluation against AICTE Approval Process Handbook criteria.
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>DEFICIENCIES DETECTED (ACTION REQUIRED)</span>
                  </span>
                </div>

                {/* Clause-by-Clause Findings */}
                <div className="space-y-2.5 text-xs font-sans">
                  <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-amber-300">Clause 7.4 · Faculty Cadre Ratio Deficit</span>
                      <span className="text-[10px] font-mono text-rose-400 font-semibold">HIGH PRIORITY</span>
                    </div>
                    <p className="text-platinum-200 text-[11px] leading-relaxed">
                      <strong>Identified Flaw:</strong> Cadre ratio in Computer Science & Engineering department is 1:2.4 vs mandated 1:2 (Professor : Assoc. Professor). Deficit of 1 Endowed Professor.
                    </p>
                    <p className="text-platinum-400 text-[11px] italic">
                      <strong>Prescribed Remediation:</strong> Submit selection committee appointment notification with gazetted minutes for 1 Endowed Professor.
                    </p>
                  </div>

                  <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-amber-300">Clause 4.12 · Land Lease Deed Endorsement</span>
                      <span className="text-[10px] font-mono text-amber-400 font-semibold">DEFICIENT NOTARIZATION</span>
                    </div>
                    <p className="text-platinum-200 text-[11px] leading-relaxed">
                      <strong>Identified Flaw:</strong> Sub-Registrar registration seal on Annexure 4 perpetual lease deed is missing the official registration serial number.
                    </p>
                    <p className="text-platinum-400 text-[11px] italic">
                      <strong>Prescribed Remediation:</strong> Upload registered deed endorsement issued by Tehsil/Sub-Registrar office.
                    </p>
                  </div>
                </div>

                {/* One-Click Memorandum Generation & Auto-fill Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 text-xs">
                  <span className="text-[10px] font-mono text-platinum-400">
                    Guardrail: AI findings are advisory. Final statutory return or approval requires human officer authorization.
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsDeficiencyModalOpen(true)}
                      className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-mono text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Generate Official AICTE Deficiency Report (PDF)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReturnReason('AICTE APH 2026-27 Normative Deficiencies Observed: Clause 7.4 (Faculty Cadre Ratio Deficit in CSE); Clause 4.12 (Sub-Registrar Registration Endorsement Missing on 30-Year Lease).');
                        setReturnItems('Selection Committee appointment order for 1 Professor in CSE\nCertified Sub-Registrar lease registration endorsement\nUpdated building safety affidavit');
                        setIsReturnModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Auto-Fill Return Notice</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons based on Role & Status */}
            <div className="p-4 bg-[#0E121B] border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-platinum-400 font-mono">Authorized actions for: <strong className="text-white">{activeRole}</strong></span>
              <div className="flex space-x-2">
                {/* Scrutiny Officer Actions */}
                {activeRole === 'SCRUTINY_OFFICER' && selectedAppDetail.operational_status === 'IN_REVIEW' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsReturnModalOpen(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition cursor-pointer"
                    >
                      Return for Clarification
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransition('EVC')}
                      className="px-4 py-2 bg-white hover:bg-platinum-100 text-black font-semibold rounded-xl text-xs transition shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-pointer"
                    >
                      Pass Scrutiny → Route to EVC
                    </button>
                  </>
                )}

                {/* Institution Actions */}
                {activeRole === 'INSTITUTION_REP' && selectedAppDetail.operational_status === 'RETURNED' && (
                  <button
                    type="button"
                    onClick={() => setIsResubmitModalOpen(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                  >
                    Resubmit Clarification & Documents
                  </button>
                )}

                {/* Bureau Supervisor Statutory Decision */}
                {activeRole === 'SUPERVISOR' && selectedAppDetail.operational_status === 'IN_REVIEW' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDecision('REJECT')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                    >
                      Statutory Rejection
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision('APPROVE')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                    >
                      Grant Statutory Approval
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Return for Clarification */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/15 text-platinum-100">
            <h3 className="font-bold text-base text-white font-display">Return Application for Clarification</h3>
            <p className="text-xs text-platinum-400 font-sans">Record specific statutory deficiencies observed. Application moves to 'RETURNED' status awaiting institution compliance.</p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-platinum-300 font-mono">Deficiency Observation (Mandatory):</label>
              <textarea
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="State the regulatory deficiency observed (e.g. Land Lease endorsement missing)..."
                className="w-full text-xs p-3 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder-platinum-500 focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-platinum-300 font-mono">Requested Clarification Items (One per line):</label>
              <textarea
                rows={3}
                value={returnItems}
                onChange={(e) => setReturnItems(e.target.value)}
                className="w-full text-xs p-3 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder-platinum-500 focus:outline-none focus:border-white/40 font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-platinum-300 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Resubmit Application */}
      {isResubmitModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/15 text-platinum-100">
            <h3 className="font-bold text-base text-white font-display">Resubmit Clarification & Evidence</h3>
            <p className="text-xs text-platinum-400 font-sans">Explain how the recorded deficiencies have been rectified by the institution.</p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-platinum-300 font-mono">Institution Response Notes:</label>
              <textarea
                rows={4}
                value={resubmitNotes}
                onChange={(e) => setResubmitNotes(e.target.value)}
                placeholder="Provide detailed explanation of corrections and uploaded rectified documents..."
                className="w-full text-xs p-3 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder-platinum-500 focus:outline-none focus:border-white/40 font-sans"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResubmitModalOpen(false)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-platinum-300 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResubmit}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_20px_rgba(52,211,153,0.3)]"
              >
                Confirm Resubmission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Schedule EVC */}
      {isScheduleEvcModalOpen && selectedAppDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/15 text-platinum-100">
            <h3 className="font-bold text-base text-white font-display">Schedule Expert Visit Committee (EVC)</h3>
            <p className="text-xs text-platinum-400 font-sans">Assign inspection panel and lock on-site inspection timetable.</p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-platinum-300 font-mono">Scheduled Date & Time:</label>
              <input
                type="datetime-local"
                value={evcDate}
                onChange={(e) => setEvcDate(e.target.value)}
                className="w-full text-xs p-3 bg-white/[0.04] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/40 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-platinum-300 font-mono">Inspection Panel Team:</label>
              <input
                type="text"
                value={evcTeam}
                onChange={(e) => setEvcTeam(e.target.value)}
                placeholder="Senior Expert Members..."
                className="w-full text-xs p-3 bg-white/[0.04] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-platinum-300 font-mono">Inspection Directives & Focus:</label>
              <textarea
                rows={3}
                value={evcNotes}
                onChange={(e) => setEvcNotes(e.target.value)}
                className="w-full text-xs p-3 bg-white/[0.04] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleEvcModalOpen(false)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-platinum-300 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmScheduleEVC}
                className="px-4 py-2 bg-white hover:bg-platinum-100 text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Confirm Inspection Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Submit Compliance Evidence */}
      {isSubmitEvidenceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-white/15 text-platinum-100">
            <h3 className="font-bold text-base text-white font-display">Submit Undertaking Compliance Evidence</h3>
            <p className="text-xs text-platinum-400 font-sans">Upload authenticated regulatory documentation satisfying statutory conditions.</p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-platinum-300 font-mono">Evidence File Name:</label>
              <input
                type="text"
                value={evidenceFilename}
                onChange={(e) => setEvidenceFilename(e.target.value)}
                className="w-full text-xs p-3 bg-white/[0.04] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/40 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-platinum-300 font-mono">Submission Remarks & Endorsements:</label>
              <textarea
                rows={3}
                value={evidenceComments}
                onChange={(e) => setEvidenceComments(e.target.value)}
                className="w-full text-xs p-3 bg-white/[0.04] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitEvidenceModalOpen(false)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-platinum-300 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitEvidence}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_20px_rgba(52,211,153,0.3)]"
              >
                Upload & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official AICTE Statutory Deficiency Memorandum Modal */}
      {isDeficiencyModalOpen && selectedAppDetail && (
        <DeficiencyReportModal
          isOpen={isDeficiencyModalOpen}
          onClose={() => setIsDeficiencyModalOpen(false)}
          application={selectedAppDetail}
          onApplyToReturn={(reason, items) => {
            setReturnReason(reason);
            setReturnItems(items.join('\n'));
            setIsReturnModalOpen(true);
          }}
        />
      )}

      {/* Modal: Compliance Undertaking Detailed Dossier */}
      {isComplianceDetailOpen && selectedUndertakingDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/15 text-platinum-100">
            {/* Header */}
            <div className="p-6 bg-[#0E121B] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-mono tracking-wider uppercase font-semibold">
                  Statutory Compliance Dossier
                </span>
                <h2 className="text-xl font-bold font-display text-white mt-0.5">
                  {selectedUndertakingDetail.title}
                </h2>
                <div className="text-xs text-platinum-300 mt-1 flex items-center space-x-3 font-mono">
                  <span>Institution: <strong className="text-white">{selectedUndertakingDetail.institution_name || 'Apex Institute of Technology & Management'}</strong></span>
                  <span>·</span>
                  <span>Due: <strong className="text-white">{selectedUndertakingDetail.due_date}</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComplianceDetailOpen(false)}
                className="text-platinum-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Compliance Lifecycle Progression */}
              <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-white text-xs mb-3 font-display">Compliance Lifecycle Progression</h4>
                <div className="flex items-center justify-between">
                  {['Registered Mandate', 'Evidence Uploaded', 'Forensic & GIS Audit', 'Verified & Closed'].map((step, idx) => {
                    const isClosed = selectedUndertakingDetail.status === 'VERIFIED_CLOSED';
                    const isSubmitted = isClosed || selectedUndertakingDetail.status === 'EVIDENCE_SUBMITTED';
                    const isStepActive = idx === 0 || (idx === 1 && isSubmitted) || (idx === 2 && isSubmitted) || (idx === 3 && isClosed);

                    return (
                      <div key={step} className="flex-1 flex flex-col items-center relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isStepActive ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]' : 'bg-white/10 text-platinum-500 border border-white/10'
                        }`}>
                          {isStepActive ? '✓' : idx + 1}
                        </div>
                        <span className={`mt-2 font-medium text-[11px] font-mono text-center ${isStepActive ? 'text-white font-bold' : 'text-platinum-500'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Regulatory Mandate Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-platinum-400">Undertaking Status</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                      selectedUndertakingDetail.status === 'VERIFIED_CLOSED'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : selectedUndertakingDetail.status === 'EVIDENCE_SUBMITTED'
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-500/40'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                    }`}>
                      {selectedUndertakingDetail.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-platinum-400">Statutory Deadline</span>
                  <div className="text-white font-mono font-bold text-xs">{selectedUndertakingDetail.due_date}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Enforceable under APH 2026-27 Section 6</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10 space-y-1.5">
                <h5 className="font-bold text-white text-xs font-display">Undertaking Description & Statutory Scope</h5>
                <p className="text-platinum-300 leading-relaxed font-sans">
                  {selectedUndertakingDetail.description || 'Mandatory institutional undertaking registered during approval application process. Failure to satisfy within stipulated timeframe triggers automatic escalation to Standing Hearing Committee (SHC).'}
                </p>
              </div>

              {/* Attached Evidence Block */}
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10 space-y-2">
                <h5 className="font-bold text-white text-xs font-display flex items-center justify-between">
                  <span>Evidentiary Instruments Uploaded</span>
                  <span className="text-[10px] font-mono text-platinum-400">SHA-256 Verified</span>
                </h5>
                {selectedUndertakingDetail.evidence_filename ? (
                  <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-mono text-white text-xs font-semibold">{selectedUndertakingDetail.evidence_filename}</div>
                        <div className="text-[10px] text-platinum-400 font-mono">Uploaded on {selectedUndertakingDetail.submitted_at || '2026-10-28'} · Tamper-evident hash logged</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      Valid File
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>No evidentiary documents uploaded yet by the institution.</span>
                  </div>
                )}
              </div>

              {/* AI Statutory Forensics Diagnostic Module */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h5 className="font-bold text-white text-xs font-display">
                      AI Statutory Forensic Pre-Screening Diagnostic (APH 2026-27)
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    Confidence: 98.4%
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <strong className="text-white font-mono">1. Sub-Registrar Notarized Seal Authentication</strong>
                      <p className="text-platinum-300 text-[11px] mt-0.5">Official registration stamp OCR matches State Revenue Department digital format. Serial code #ND-4921 authenticated.</p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[10px] shrink-0 ml-2">CONFIRMED</span>
                  </div>
                  <div className="flex items-start justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <strong className="text-white font-mono">2. Mandatory Survey Coordinates & GIS Land Parcel Check</strong>
                      <p className="text-platinum-300 text-[11px] mt-0.5">Plot boundary coordinates align within 0.05m tolerance of sanctioned master layout. No overlap with protected government reserve.</p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[10px] shrink-0 ml-2">VERIFIED</span>
                  </div>
                  <div className="flex items-start justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <strong className="text-white font-mono">3. Governing Body Resolution & Authorized Signatory Match</strong>
                      <p className="text-platinum-300 text-[11px] mt-0.5">Signatory signature matches Trust President record in AICTE Permanent Institutional Repository.</p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[10px] shrink-0 ml-2">MATCHED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 bg-[#0E121B] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsComplianceReportOpen(true);
                }}
                className="px-4 py-2 bg-white/[0.08] hover:bg-white/15 text-emerald-300 font-semibold font-mono rounded-xl text-xs transition border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Official AICTE Clearance Memorandum (PDF)</span>
              </button>

              <div className="flex items-center space-x-2">
                {selectedUndertakingDetail.status === 'PENDING' && activeRole === 'INSTITUTION_REP' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUndertakingId(selectedUndertakingDetail.id);
                      setIsSubmitEvidenceModalOpen(true);
                      setIsComplianceDetailOpen(false);
                    }}
                    className="px-4 py-2 bg-white text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                  >
                    Upload Evidence
                  </button>
                )}

                {selectedUndertakingDetail.status === 'EVIDENCE_SUBMITTED' && (activeRole === 'SCRUTINY_OFFICER' || activeRole === 'SUPERVISOR') && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleReviewCompliance(selectedUndertakingDetail.id, 'VERIFY');
                      setIsComplianceDetailOpen(false);
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  >
                    Verify & Close Undertaking
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsComplianceDetailOpen(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-platinum-300 rounded-xl text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Document Clearance Detailed Dossier */}
      {isDocumentDetailOpen && selectedDocumentDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/15 text-platinum-100">
            {/* Header */}
            <div className="p-6 bg-[#0E121B] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 font-mono tracking-wider uppercase font-semibold">
                  Statutory Life-Safety & Clearance Vault
                </span>
                <h2 className="text-xl font-bold font-display text-white mt-0.5">
                  {selectedDocumentDetail.document_type}
                </h2>
                <div className="text-xs text-platinum-300 mt-1 flex items-center space-x-3 font-mono">
                  <span>Institution: <strong className="text-white">{selectedDocumentDetail.institution_name || 'Apex Institute of Technology & Management'}</strong></span>
                  <span>·</span>
                  <span>File: <strong className="text-white">{selectedDocumentDetail.filename}</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDocumentDetailOpen(false)}
                className="text-platinum-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Validity Radar Meter */}
              <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs font-display">Statutory Validity Surveillance Radar</h4>
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                    selectedDocumentDetail.review_status === 'VALID'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                      : selectedDocumentDetail.review_status === 'APPROACHING_EXPIRY'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 animate-pulse'
                      : selectedDocumentDetail.review_status === 'RENEWAL_SUBMITTED'
                      ? 'bg-sky-950/60 text-sky-300 border border-sky-500/40'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  }`}>
                    {selectedDocumentDetail.review_status.replace('_', ' ')}
                  </span>
                </div>

                {/* Meter Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedDocumentDetail.review_status === 'VALID'
                        ? 'w-4/5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                        : selectedDocumentDetail.review_status === 'APPROACHING_EXPIRY'
                        ? 'w-1/4 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                        : selectedDocumentDetail.review_status === 'RENEWAL_SUBMITTED'
                        ? 'w-3/5 bg-sky-400'
                        : 'w-1/12 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-platinum-400">
                  <span>Valid From: <strong className="text-white">{selectedDocumentDetail.valid_from || '2023-11-20'}</strong></span>
                  <span>Expires On: <strong className="text-white">{selectedDocumentDetail.expires_on || '2026-11-19'}</strong></span>
                </div>
              </div>

              {/* Document Clearance Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-platinum-400">Issuing Regulatory Authority</span>
                  <div className="text-white font-mono font-bold text-xs">State Fire & Safety Directorate / Sub-Registrar</div>
                  <div className="text-[10px] text-platinum-400">Authority jurisdiction validated against State Gazette</div>
                </div>

                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-platinum-400">Statutory Chapter Mandate</span>
                  <div className="text-white font-mono font-bold text-xs">APH 2026-27 Chapter IV / NBC Part 4</div>
                  <div className="text-[10px] text-amber-400 font-mono">Mandatory condition for Extension of Approval (EoA)</div>
                </div>
              </div>

              {/* AI Authenticity & Life-Safety Diagnostic Module */}
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h5 className="font-bold text-white text-xs font-display">
                      AI Document Authenticity & Safety Forensics (APH 2026-27)
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    Forensics: PASSED
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <strong className="text-white font-mono">1. Certificate QR / Serial Code Verification</strong>
                      <p className="text-platinum-300 text-[11px] mt-0.5">State portal API ping returns matching issuance timestamp and authorized officer digital token.</p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[10px] shrink-0 ml-2">VERIFIED</span>
                  </div>
                  <div className="flex items-start justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <strong className="text-white font-mono">2. Life-Safety & Mandatory Fire Pressure Tests</strong>
                      <p className="text-platinum-300 text-[11px] mt-0.5">On-site hydrant pressure test cert 3.5 bar satisfied. Evacuation egress routes compliant with NBC Chapter 4.</p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[10px] shrink-0 ml-2">COMPLIANT</span>
                  </div>
                  <div className="flex items-start justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <strong className="text-white font-mono">3. 30/60/90-Day Early Warning Dispatch Trigger</strong>
                      <p className="text-platinum-300 text-[11px] mt-0.5">Automated background scanner has scheduled institutional alert dispatches 30 days prior to expiry.</p>
                    </div>
                    <span className="text-amber-400 font-mono font-bold text-[10px] shrink-0 ml-2">ARMED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 bg-[#0E121B] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDocumentNoticeOpen(true);
                }}
                className="px-4 py-2 bg-white/[0.08] hover:bg-white/15 text-rose-300 font-semibold font-mono rounded-xl text-xs transition border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Generate Official AICTE Show-Cause Notice (PDF)</span>
              </button>

              <div className="flex items-center space-x-2">
                {(selectedDocumentDetail.review_status === 'EXPIRED' || selectedDocumentDetail.review_status === 'APPROACHING_EXPIRY') && activeRole === 'INSTITUTION_REP' && (
                  <button
                    type="button"
                    onClick={async () => {
                      const newFile = window.prompt('Enter renewed document filename:', 'Renewed_Clearance_2026.pdf');
                      if (!newFile) return;
                      await apiClient.renewDocument(selectedDocumentDetail.id, newFile);
                      showToast('Renewal evidence submitted for verification.');
                      setIsDocumentDetailOpen(false);
                      refreshData();
                    }}
                    className="px-4 py-2 bg-white text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                  >
                    Upload Renewal
                  </button>
                )}

                {selectedDocumentDetail.review_status === 'RENEWAL_SUBMITTED' && (activeRole === 'SCRUTINY_OFFICER' || activeRole === 'SUPERVISOR') && (
                  <button
                    type="button"
                    onClick={async () => {
                      await apiClient.verifyDocument(selectedDocumentDetail.id, 'VALID', 'Renewed registration confirmed.');
                      showToast('Document verified as VALID.');
                      setIsDocumentDetailOpen(false);
                      refreshData();
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  >
                    Verify Renewal
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsDocumentDetailOpen(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-platinum-300 rounded-xl text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official AICTE Statutory Compliance Clearance Memorandum Modal */}
      {isComplianceReportOpen && selectedUndertakingDetail && (
        <ComplianceReportModal
          isOpen={isComplianceReportOpen}
          onClose={() => setIsComplianceReportOpen(false)}
          undertaking={selectedUndertakingDetail}
        />
      )}

      {/* Official AICTE Statutory Document Expiry Warning & Show-Cause Notice Modal */}
      {isDocumentNoticeOpen && selectedDocumentDetail && (
        <DocumentNoticeModal
          isOpen={isDocumentNoticeOpen}
          onClose={() => setIsDocumentNoticeOpen(false)}
          documentItem={selectedDocumentDetail}
        />
      )}

      {/* Modal: EVC Inspection Detailed Dossier */}
      {isEVCDetailOpen && selectedEVCDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C0F17] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/15 text-platinum-100">
            {/* Header */}
            <div className="p-6 bg-[#0E121B] border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-400 font-mono tracking-wider uppercase font-semibold">
                  EVC Physical Inspection Dossier
                </span>
                <h2 className="text-xl font-bold font-display text-white mt-0.5">
                  {selectedEVCDetail.institution_name}
                </h2>
                <div className="text-xs text-platinum-300 mt-1 flex items-center space-x-3 font-mono">
                  <span>App No: <strong className="text-white">{selectedEVCDetail.application_number}</strong></span>
                  <span>·</span>
                  <span>Region: <strong className="text-white">{selectedEVCDetail.region}</strong></span>
                  <span>·</span>
                  <span>Date: <strong className="text-white">{selectedEVCDetail.scheduled_at ? new Date(selectedEVCDetail.scheduled_at).toLocaleDateString() : 'Unscheduled'}</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEVCDetailOpen(false)}
                className="text-platinum-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* EVC Inspection Progression */}
              <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-white text-xs mb-3 font-display">EVC On-Site Inspection Progression</h4>
                <div className="flex items-center justify-between">
                  {['Panel Assigned', 'On-Site Visit', 'Laboratory Benchmark', 'Appraisal Submitted'].map((step, idx) => {
                    const isDone = selectedEVCDetail.status === 'COMPLETED';
                    const isScheduled = isDone || selectedEVCDetail.status === 'SCHEDULED';
                    const isStepActive = idx === 0 || (idx === 1 && isScheduled) || (idx === 2 && isScheduled) || (idx === 3 && isDone);

                    return (
                      <div key={step} className="flex-1 flex flex-col items-center relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isStepActive ? 'bg-indigo-500 text-black shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/10 text-platinum-500 border border-white/10'
                        }`}>
                          {isStepActive ? '✓' : idx + 1}
                        </div>
                        <span className={`mt-2 font-medium text-[11px] font-mono text-center ${isStepActive ? 'text-white font-bold' : 'text-platinum-500'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Committee Panel & Scheduling Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 space-y-1.5 font-mono">
                  <span className="text-[10px] uppercase text-platinum-400">Assigned Inspection Committee</span>
                  <div className="text-white font-bold text-xs">{selectedEVCDetail.assigned_team || 'Prof. A. K. Sen (Chairman), Dr. R. Iyer (Expert)'}</div>
                  <div className="text-[10px] text-platinum-400">Appointed under AICTE Regulation Bureau mandate</div>
                </div>

                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 space-y-1.5 font-mono">
                  <span className="text-[10px] uppercase text-platinum-400">Inspection Status & SLA</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedEVCDetail.status === 'COMPLETED'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : selectedEVCDetail.status === 'SCHEDULED'
                        ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                    }`}>
                      {selectedEVCDetail.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-400">Physical on-site appraisal mandatory for APH Chapter 5</div>
                </div>
              </div>

              {/* Summary of Report */}
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10 space-y-1.5">
                <h5 className="font-bold text-white text-xs font-display">Inspection Findings Summary</h5>
                <p className="text-platinum-300 leading-relaxed font-sans">
                  {selectedEVCDetail.report_summary || 'Physical campus inspection validated. 180 computing workstations active with licensed CAD/CAM software and 1 Gbps NMEICT connectivity. Accessibility ramps confirmed.'}
                </p>
              </div>

              {/* AI Geo-Tagging & Infrastructure Benchmarks Diagnostic Module */}
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h5 className="font-bold text-white text-xs font-display">
                      AI Drone Geo-Tagging & Lab Benchmark Diagnostic (APH 2026-27)
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                    Inspection: SATISFIED
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <strong className="text-white font-mono">1. GPS Geo-Fencing & Campus Perimeter Integrity</strong>
                      <p className="text-platinum-300 text-[11px] mt-0.5">On-site GPS token (12.9716° N, 77.5946° E) confirmed inside registered title deed boundaries. Contiguous area verified.</p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[10px] shrink-0 ml-2">CONFIRMED</span>
                  </div>
                  <div className="flex items-start justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <strong className="text-white font-mono">2. Computing Workstation & Software Licensing Audit</strong>
                      <p className="text-platinum-300 text-[11px] mt-0.5">180 networked PCs with legitimate OEM OS and SolidWorks/MATLAB institutional volume licenses inspected.</p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[10px] shrink-0 ml-2">VERIFIED</span>
                  </div>
                  <div className="flex items-start justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                    <div>
                      <strong className="text-white font-mono">3. Barrier-Free Accessibility & Life-Safety Egress</strong>
                      <p className="text-platinum-300 text-[11px] mt-0.5">1:12 slope ramps, Braille elevators, and wet riser test at 3.5 bar compliant with NBC 2016 Part 4.</p>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold text-[10px] shrink-0 ml-2">COMPLIANT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-5 bg-[#0E121B] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEVCReportOpen(true);
                }}
                className="px-4 py-2 bg-white/[0.08] hover:bg-white/15 text-indigo-300 font-semibold font-mono rounded-xl text-xs transition border border-indigo-500/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Generate Official AICTE EVC Appraisal Report (PDF)</span>
              </button>

              <div className="flex items-center space-x-2">
                {selectedEVCDetail.status === 'PENDING_SCHEDULE' && activeRole === 'EVC_COORDINATOR' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenDetail(selectedEVCDetail.application_id);
                      setIsScheduleEvcModalOpen(true);
                      setIsEVCDetailOpen(false);
                    }}
                    className="px-4 py-2 bg-white text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                  >
                    Schedule Visit
                  </button>
                )}

                {selectedEVCDetail.status === 'SCHEDULED' && activeRole === 'EVC_COORDINATOR' && (
                  <button
                    type="button"
                    onClick={async () => {
                      const summaryText = window.prompt('Enter EVC physical inspection findings summary:', 'Physical labs, workshops, and teacher cadre verified compliant.');
                      if (!summaryText) return;
                      await apiClient.completeEVC(selectedEVCDetail.id, 'RECOMMENDED', summaryText);
                      showToast('EVC inspection completed and submitted.');
                      setIsEVCDetailOpen(false);
                      refreshData();
                    }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs transition cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  >
                    Submit Findings
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsEVCDetailOpen(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/10 text-platinum-300 rounded-xl text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official AICTE EVC Physical Inspection Appraisal Report Modal */}
      {isEVCReportOpen && selectedEVCDetail && (
        <EVCReportModal
          isOpen={isEVCReportOpen}
          onClose={() => setIsEVCReportOpen(false)}
          evcItem={selectedEVCDetail}
        />
      )}

      {/* Vengeance UI Search Command Palette Modal */}
      <VengeanceSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        applications={applications}
        complianceList={complianceList}
        documents={documents}
        evcQueue={evcQueue}
        onSelectApplication={handleOpenDetail}
        onSelectUndertaking={handleOpenUndertakingDetail}
        onSelectDocument={handleOpenDocumentDetail}
        onSelectEVC={handleOpenEVCDetail}
        onTriggerWatchdog={handleTriggerDeadlines}
        onSelectRole={(role) => setActiveRole(role)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
