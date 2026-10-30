'use client';

import React, { useState, useEffect } from 'react';
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

export default function ApprovalFlowApp() {
  // Current active role and navigation tab
  const [activeRole, setActiveRole] = useState<UserRole>('SCRUTINY_OFFICER');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'evc' | 'compliance' | 'documents' | 'audit'>('dashboard');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  // Backend state
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [evcQueue, setEvcQueue] = useState<EVCItem[]>([]);
  const [complianceList, setComplianceList] = useState<UndertakingItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  // Fetch all core data from API
  const refreshData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [sumData, appsData, evcData, compData, docsData, notifsData, auditData] = await Promise.all([
        apiClient.getDashboardSummary(selectedRegion),
        apiClient.getApplications({ region: selectedRegion, stage: stageFilter, status: statusFilter, search: searchQuery }),
        apiClient.getEVCQueue(),
        apiClient.getComplianceList(),
        apiClient.getDocuments(),
        apiClient.getNotifications(activeRole),
        apiClient.getAuditEvents('ALL'),
      ]);

      setSummary(sumData);
      setApplications(appsData.items);
      setEvcQueue(evcData);
      setComplianceList(compData);
      setDocuments(docsData);
      setNotifications(notifsData);
      setAuditEvents(auditData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to backend server. Using demonstrator state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedRegion, stageFilter, statusFilter, activeRole]);

  // Handle open application detail
  const handleOpenDetail = async (appId: string) => {
    try {
      const detail = await apiClient.getApplicationDetail(appId);
      setSelectedAppDetail(detail);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle Return for clarification
  const handleConfirmReturn = async () => {
    if (!selectedAppDetail) return;
    if (returnReason.trim().length < 3) {
      showToast('Please provide a valid deficiency reason (minimum 3 characters).', 'error');
      return;
    }
    const itemsList = returnItems.split('\n').filter(i => i.trim().length > 0);
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

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-xl text-sm font-medium border flex items-center space-x-3 transition-all ${
          toastMessage.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <span>{toastMessage.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Deep-Navy Sidebar */}
      <aside className="w-64 bg-[#0B192C] text-slate-200 flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          {/* Logo & Emblem Header */}
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md text-lg">
              AF
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">ApprovalFlow AI</h1>
              <span className="text-[11px] text-blue-400 font-medium tracking-wide">AICTE PS4 2026</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>📊</span>
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'applications' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>📂</span>
                <span>Applications</span>
              </div>
              {summary && (
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {summary.total_applications}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('evc')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'evc' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>🏛️</span>
                <span>EVC Inspection</span>
              </div>
              {summary && summary.pending_evc > 0 && (
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                  {summary.pending_evc}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'compliance' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>⚖️</span>
                <span>Compliance Tracker</span>
              </div>
              {summary && summary.pending_compliance > 0 && (
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  {summary.pending_compliance}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'documents' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>📑</span>
                <span>Document Expiry</span>
              </div>
              {summary && summary.upcoming_expiries > 0 && (
                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono">
                  {summary.upcoming_expiries}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'audit' ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span>🛡️</span>
                <span>Audit Trail</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer & Demonstration Controls */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
              <span>SLA Engine</span>
              <span className="text-emerald-400">● Active</span>
            </div>
            <p>Automated pendency scanner & SLA alerts active.</p>
            <button
              onClick={handleTriggerDeadlines}
              className="mt-2 w-full text-center py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition"
            >
              ⚡ Run Watchdog Scan
            </button>
          </div>

          <button
            onClick={handleResetDemo}
            className="w-full text-center py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/50 rounded-lg text-xs font-medium transition"
          >
            🔄 Reset Demo Data
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-slate-900 capitalize">
              {activeTab === 'dashboard' ? 'Regulatory Operational Dashboard' : activeTab.replace('_', ' ')}
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-mono">
              Academic Year 2026-2027
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Region Filter */}
            <div className="flex items-center space-x-2 text-xs text-slate-600">
              <span>Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Regions (National)</option>
                <option value="Eastern">Eastern Region</option>
                <option value="Western">Western Region</option>
                <option value="Northern">Northern Region</option>
                <option value="Southern">Southern Region</option>
                <option value="Central">Central Region</option>
              </select>
            </div>

            {/* Role Switcher (PRD FEAT-01 mandated for demonstration) */}
            <div className="flex items-center space-x-2 bg-blue-50/70 border border-blue-200 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide">Demo Role:</span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="bg-white border border-blue-300 rounded px-2 py-0.5 text-xs font-semibold text-blue-900 focus:outline-none"
              >
                <option value="SCRUTINY_OFFICER">Scrutiny Officer (Er. Priya Sharma)</option>
                <option value="EVC_COORDINATOR">EVC Coordinator (Prof. S. R. Rao)</option>
                <option value="SUPERVISOR">Bureau Officer (Dr. Anil S.)</option>
                <option value="INSTITUTION_REP">Institution Rep (Dr. K. S. Raman)</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>

            {/* Notification Drawer Trigger */}
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            >
              <span className="text-lg">🔔</span>
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Statutory Guardrail Notice */}
        <div className="bg-amber-50/80 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <span>🛡️</span>
            <span>
              <strong>Statutory Human Authority Guardrail:</strong> Routine routing, prerequisite checking, and SLA escalations are automated. All statutory approval, rejection, and verification decisions remain reserved for competent human authorities.
            </span>
          </div>
          <span className="text-[11px] text-amber-700 font-mono">APH 2026-27 Compliant</span>
        </div>

        {/* Tab Content Canvas */}
        <div className="p-6 space-y-6">
          {activeTab === 'dashboard' && summary && (
            <div className="space-y-6">
              {/* Primary KPI Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Dossiers</div>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">{summary.total_applications}</div>
                    <div className="text-xs text-slate-500 mt-1">{summary.approved_count} Approved · {summary.rejected_count} Rejected</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                    📁
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Scrutiny</div>
                    <div className="text-3xl font-extrabold text-blue-600 mt-1">{summary.pending_scrutiny}</div>
                    <div className="text-xs text-amber-600 mt-1 font-medium">{summary.returned_for_clarification} Awaiting Institution</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                    🔍
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">EVC Inspection Queue</div>
                    <div className="text-3xl font-extrabold text-indigo-600 mt-1">{summary.pending_evc}</div>
                    <div className="text-xs text-indigo-500 mt-1 font-medium">{summary.under_sac_shc} Under SAC/SHC Review</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                    🏛️
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA / Expiry Alerts</div>
                    <div className="text-3xl font-extrabold text-red-600 mt-1">{summary.overdue_count + summary.upcoming_expiries}</div>
                    <div className="text-xs text-red-500 mt-1 font-medium">{summary.overdue_count} Overdue · {summary.upcoming_expiries} Expiring Docs</div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold">
                    ⚠️
                  </div>
                </div>
              </div>

              {/* Stage Progression & Ageing Analysis Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stage Distribution */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span>📈</span>
                    <span>Application Stage Distribution</span>
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(summary.stage_distribution).map(([stage, count]) => {
                      const pct = Math.round((count / summary.total_applications) * 100) || 0;
                      return (
                        <div key={stage} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-slate-700">
                            <span>{stage.replace('_', ' ')}</span>
                            <span className="font-mono text-slate-500">{count} cases ({pct}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, 5)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ageing & Bottleneck Monitoring */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span>⏱️</span>
                    <span>Pendency Ageing Breakdown (SLA Monitoring)</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(summary.ageing_buckets).map(([bucket, count]) => (
                      <div
                        key={bucket}
                        className={`p-3.5 rounded-lg border flex flex-col justify-between ${
                          bucket.includes('>') || bucket.includes('15')
                            ? 'bg-red-50/50 border-red-200 text-red-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="text-xs font-medium text-slate-500">{bucket}</span>
                        <span className="text-2xl font-black mt-1 font-mono">{count}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5">Active applications</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Regional Distribution */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span>🗺️</span>
                  <span>National Regional Office Workload</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(summary.regional_workload).map(([region, count]) => (
                    <div key={region} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <div className="text-xs font-medium text-slate-500">{region}</div>
                      <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2 flex-1 min-w-[260px]">
                  <span className="text-slate-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by Application No. or Institution Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span>Stage:</span>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700"
                  >
                    <option value="">All Stages</option>
                    <option value="SCRUTINY">Scrutiny</option>
                    <option value="EVC">EVC</option>
                    <option value="SAC_SHC">SAC/SHC</option>
                    <option value="FINAL_REVIEW">Final Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <span>Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700"
                  >
                    <option value="">All Statuses</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="RETURNED">Returned (Awaiting Clarification)</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Application ID</th>
                      <th className="py-3 px-4">Institution Name</th>
                      <th className="py-3 px-4">Region</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Current Stage</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Ageing</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {app.application_number}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                          {app.institution_name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{app.region}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{app.application_type}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full font-mono text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                            {app.current_stage}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                              app.operational_status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.operational_status === 'RETURNED'
                                ? 'bg-amber-100 text-amber-800'
                                : app.operational_status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {app.operational_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className={app.is_overdue ? 'text-red-600 font-bold' : 'text-slate-600'}>
                            {app.days_in_current_stage}d {app.is_overdue && '⚠️ SLA'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenDetail(app.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition"
                          >
                            Open Dossier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVC Queue Tab */}
          {activeTab === 'evc' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Expert Visit Committee (EVC) Queue</h3>
                    <p className="text-xs text-slate-500 mt-1">Manage physical inspection scheduling, committee composition, and report findings.</p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 font-semibold font-mono">
                    {evcQueue.length} Active Records
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evcQueue.map((evc) => (
                  <div key={evc.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600">{evc.application_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        evc.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        evc.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {evc.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{evc.institution_name}</h4>
                      <p className="text-xs text-slate-500">{evc.region} Region</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div><strong>Scheduled Date:</strong> {evc.scheduled_at ? new Date(evc.scheduled_at).toLocaleDateString() : 'Pending Scheduling'}</div>
                      <div><strong>Assigned Team:</strong> {evc.assigned_team || 'Unassigned'}</div>
                      {evc.report_summary && (
                        <div className="text-slate-700 mt-2 pt-2 border-t border-slate-200">
                          <strong>Report Summary:</strong> {evc.report_summary}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end space-x-2">
                      {evc.status === 'PENDING_SCHEDULE' && activeRole === 'EVC_COORDINATOR' && (
                        <button
                          onClick={() => {
                            handleOpenDetail(evc.application_id);
                            setIsScheduleEvcModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
                        >
                          Schedule Inspection Visit
                        </button>
                      )}
                      {evc.status === 'SCHEDULED' && activeRole === 'EVC_COORDINATOR' && (
                        <button
                          onClick={async () => {
                            const summaryText = window.prompt('Enter EVC physical inspection findings summary:', 'Physical labs, workshops, and teacher cadre verified compliant.');
                            if (!summaryText) return;
                            await apiClient.completeEVC(evc.id, 'RECOMMENDED', summaryText);
                            showToast('EVC inspection completed and submitted.');
                            refreshData();
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                        >
                          Submit Inspection Findings
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance & Undertakings Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Institutional Undertakings & Compliance</h3>
                  <p className="text-xs text-slate-500 mt-1">Track regulatory conditions, evidence submissions, and officer verification outcomes.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Undertaking Title</th>
                      <th className="py-3 px-4">Institution</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Evidence</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {complianceList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{c.title}</div>
                          <div className="text-slate-500 text-[11px] max-w-sm truncate">{c.description}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{c.institution_name}</td>
                        <td className="py-3.5 px-4 font-mono">{c.due_date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                            c.status === 'VERIFIED_CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                            c.status === 'EVIDENCE_SUBMITTED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {c.evidence_filename ? (
                            <span className="font-mono text-blue-600 underline cursor-pointer">{c.evidence_filename}</span>
                          ) : (
                            <span className="text-slate-400 italic">None attached</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          {c.status === 'PENDING' && activeRole === 'INSTITUTION_REP' && (
                            <button
                              onClick={() => {
                                setSelectedUndertakingId(c.id);
                                setIsSubmitEvidenceModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium"
                            >
                              Upload Evidence
                            </button>
                          )}
                          {c.status === 'EVIDENCE_SUBMITTED' && (activeRole === 'SCRUTINY_OFFICER' || activeRole === 'SUPERVISOR') && (
                            <button
                              onClick={() => handleReviewCompliance(c.id, 'VERIFY')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
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
            </div>
          )}

          {/* Document Expiry Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Document Expiry & Lease Validity Vault</h3>
                  <p className="text-xs text-slate-500 mt-1">Lifecycle monitoring for Land Leases, Building Approvals, and Safety NOCs.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Document Type</th>
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-4">Valid From</th>
                      <th className="py-3 px-4">Expires On</th>
                      <th className="py-3 px-4">Review Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{doc.document_type}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{doc.filename}</td>
                        <td className="py-3.5 px-4 font-mono">{doc.valid_from || '—'}</td>
                        <td className="py-3.5 px-4 font-mono">{doc.expires_on || '—'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                            doc.review_status === 'VALID' ? 'bg-emerald-100 text-emerald-800' :
                            doc.review_status === 'APPROACHING_EXPIRY' ? 'bg-amber-100 text-amber-800' :
                            doc.review_status === 'RENEWAL_SUBMITTED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {doc.review_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          {(doc.review_status === 'EXPIRED' || doc.review_status === 'APPROACHING_EXPIRY') && activeRole === 'INSTITUTION_REP' && (
                            <button
                              onClick={async () => {
                                const newFile = window.prompt('Enter renewed document filename:', 'Renewed_Lease_Agreement_2026.pdf');
                                if (!newFile) return;
                                await apiClient.renewDocument(doc.id, newFile);
                                showToast('Renewal evidence submitted for verification.');
                                refreshData();
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium"
                            >
                              Upload Renewal
                            </button>
                          )}
                          {doc.review_status === 'RENEWAL_SUBMITTED' && (activeRole === 'SCRUTINY_OFFICER' || activeRole === 'SUPERVISOR') && (
                            <button
                              onClick={async () => {
                                await apiClient.verifyDocument(doc.id, 'VALID', 'Renewed registration confirmed.');
                                showToast('Document verified as VALID.');
                                refreshData();
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
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
            </div>
          )}

          {/* Audit Trail Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Immutable Digital Audit Trail</h3>
                  <p className="text-xs text-slate-500 mt-1">Tamper-evident chronological log of all workflow actions, deficiency returns, and committee decisions.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                {auditEvents.map((evt) => (
                  <div key={evt.id} className="p-4 flex items-start justify-between hover:bg-slate-50/70 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{evt.action}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase font-mono">
                          {evt.entity_type}
                        </span>
                        {evt.is_system_generated && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                            AUTOMATED SLA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">Actor: <strong>{evt.actor_name}</strong> ({evt.actor_role})</p>
                      {evt.reason && <p className="text-xs text-slate-500 italic">"{evt.reason}"</p>}
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
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
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Notification Alerts</h3>
            <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={async () => {
                  await apiClient.markNotificationRead(n.id);
                  refreshData();
                }}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                  n.severity === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-900' :
                  n.severity === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[10px] uppercase font-mono">{n.severity}</span>
                  <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="font-medium">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Application Detail Dossier */}
      {isDetailModalOpen && selectedAppDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-400 font-mono tracking-wider uppercase">Institutional Dossier</span>
                <h2 className="text-xl font-bold mt-0.5">{selectedAppDetail.institution.name}</h2>
                <div className="text-xs text-slate-300 mt-1 flex items-center space-x-3">
                  <span>App No: <strong className="font-mono text-white">{selectedAppDetail.application_number}</strong></span>
                  <span>·</span>
                  <span>Route: <strong>{selectedAppDetail.route_code}</strong></span>
                </div>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Visual Workflow Steps Progression */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-3">Approval Workflow Progress</h4>
                <div className="flex items-center justify-between">
                  {['SCRUTINY', 'EVC', 'SAC_SHC', 'FINAL_REVIEW', 'COMPLETED'].map((stage, idx) => {
                    const isDone = ['SCRUTINY', 'EVC', 'SAC_SHC', 'FINAL_REVIEW', 'COMPLETED'].indexOf(selectedAppDetail.current_stage) > idx || selectedAppDetail.operational_status === 'APPROVED';
                    const isCurrent = selectedAppDetail.current_stage === stage;
                    return (
                      <div key={stage} className="flex-1 flex flex-col items-center relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`mt-2 font-medium text-[11px] ${isCurrent ? 'text-blue-600 font-bold' : 'text-slate-600'}`}>
                          {stage.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clarification Alert if Returned */}
              {selectedAppDetail.operational_status === 'RETURNED' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-900 flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Returned to Institution for Deficiencies</span>
                  </h4>
                  <p className="text-amber-800 font-medium">"{selectedAppDetail.return_reason}"</p>
                  {selectedAppDetail.requested_items && selectedAppDetail.requested_items.length > 0 && (
                    <div className="text-[11px] text-amber-900 pt-1">
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
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Current Status</span>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{selectedAppDetail.operational_status}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Officer</span>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{selectedAppDetail.assigned_to || 'Unassigned'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Submitted On</span>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{new Date(selectedAppDetail.submitted_at).toLocaleDateString()}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Region & State</span>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{selectedAppDetail.region} ({selectedAppDetail.institution.state})</div>
                </div>
              </div>

              {/* Attached Compliance Documents */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Mandatory Uploaded Dossier Documents</h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {selectedAppDetail.documents.map((d) => (
                    <div key={d.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{d.document_type}</div>
                        <div className="text-[11px] font-mono text-slate-500">{d.filename}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        d.review_status === 'VALID' ? 'bg-emerald-100 text-emerald-800' :
                        d.review_status === 'APPROACHING_EXPIRY' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {d.review_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Audit History */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Workflow Progression History</h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                  {selectedAppDetail.timeline.map((item) => (
                    <div key={item.id} className="p-3 flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800">{item.action}</div>
                        <div className="text-slate-600">{item.reason}</div>
                        <div className="text-[10px] text-slate-400">By {item.actor_name} ({item.actor_role})</div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Action Buttons based on Role & Status */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Authorized actions for: <strong>{activeRole}</strong></span>
              <div className="flex space-x-2">
                {/* Scrutiny Officer Actions */}
                {activeRole === 'SCRUTINY_OFFICER' && selectedAppDetail.operational_status === 'IN_REVIEW' && (
                  <>
                    <button
                      onClick={() => setIsReturnModalOpen(true)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow-sm"
                    >
                      Return for Clarification
                    </button>
                    <button
                      onClick={() => handleTransition('EVC')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-sm"
                    >
                      Pass Scrutiny → Route to EVC
                    </button>
                  </>
                )}

                {/* Institution Actions */}
                {activeRole === 'INSTITUTION_REP' && selectedAppDetail.operational_status === 'RETURNED' && (
                  <button
                    onClick={() => setIsResubmitModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm"
                  >
                    Resubmit Clarification & Documents
                  </button>
                )}

                {/* Bureau Supervisor Statutory Decision */}
                {activeRole === 'SUPERVISOR' && selectedAppDetail.operational_status === 'IN_REVIEW' && (
                  <>
                    <button
                      onClick={() => handleDecision('REJECT')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-xs shadow-sm"
                    >
                      Statutory Rejection
                    </button>
                    <button
                      onClick={() => handleDecision('APPROVE')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Return Application for Clarification</h3>
            <p className="text-xs text-slate-500">Record specific deficiencies observed. Application moves to 'RETURNED' status awaiting institution compliance.</p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Deficiency Observation (Mandatory):</label>
              <textarea
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="State the regulatory deficiency observed (e.g. Land Lease endorsement missing)..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Requested Clarification Items (One per line):</label>
              <textarea
                rows={3}
                value={returnItems}
                onChange={(e) => setReturnItems(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Resubmit Application */}
      {isResubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Resubmit Clarification & Evidence</h3>
            <p className="text-xs text-slate-500">Explain how the recorded deficiencies have been rectified by the institution.</p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Institution Response Notes:</label>
              <textarea
                rows={4}
                value={resubmitNotes}
                onChange={(e) => setResubmitNotes(e.target.value)}
                placeholder="Provide detailed explanation of corrections and uploaded rectified documents..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsResubmitModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
              >
                Confirm Resubmission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
