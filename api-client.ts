/**
 * ApprovalFlow AI — Centralized Typed API Client.
 * Communicates with FastAPI backend (/api/v1).
 */
import {
  DashboardSummary,
  PaginatedApplicationsResponse,
  ApplicationDetail,
  WorkflowEvent,
  EVCItem,
  UndertakingItem,
  DocumentItem,
  NotificationItem,
  AuditEventItem,
} from '../types/api';

const API_BASE_URL = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) 
    ? process.env.NEXT_PUBLIC_API_BASE_URL 
    : 'http://127.0.0.1:8000/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<{ status: string; service: string }>(res);
  },

  async getDashboardSummary(region?: string): Promise<DashboardSummary> {
    const url = new URL(`${API_BASE_URL}/dashboard/summary`);
    if (region && region !== 'ALL') url.searchParams.append('region', region);
    const res = await fetch(url.toString());
    return handleResponse<DashboardSummary>(res);
  },

  async getApplications(params: {
    stage?: string;
    status?: string;
    region?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedApplicationsResponse> {
    const url = new URL(`${API_BASE_URL}/applications`);
    if (params.stage) url.searchParams.append('stage', params.stage);
    if (params.status) url.searchParams.append('status', params.status);
    if (params.region && params.region !== 'ALL') url.searchParams.append('region', params.region);
    if (params.search) url.searchParams.append('search', params.search);
    if (params.page) url.searchParams.append('page', params.page.toString());
    if (params.page_size) url.searchParams.append('page_size', params.page_size.toString());

    const res = await fetch(url.toString());
    return handleResponse<PaginatedApplicationsResponse>(res);
  },

  async getApplicationDetail(id: string): Promise<ApplicationDetail> {
    const res = await fetch(`${API_BASE_URL}/applications/${id}`);
    return handleResponse<ApplicationDetail>(res);
  },

  async getApplicationTimeline(id: string): Promise<WorkflowEvent[]> {
    const res = await fetch(`${API_BASE_URL}/applications/${id}/timeline`);
    return handleResponse<WorkflowEvent[]>(res);
  },

  async transitionApplication(id: string, target_stage: string, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/applications/${id}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_stage, notes }),
    });
    return handleResponse<{ success: boolean; message: string; current_stage: string }>(res);
  },

  async returnApplication(id: string, reason: string, requested_items: string[]) {
    const res = await fetch(`${API_BASE_URL}/applications/${id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, requested_items }),
    });
    return handleResponse<{ success: boolean; message: string; operational_status: string }>(res);
  },

  async resubmitApplication(id: string, resubmission_notes: string, updated_documents: string[]) {
    const res = await fetch(`${API_BASE_URL}/applications/${id}/resubmit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resubmission_notes, updated_documents }),
    });
    return handleResponse<{ success: boolean; message: string; operational_status: string }>(res);
  },

  async recordDecision(id: string, decision: 'APPROVE' | 'REJECT', remarks: string) {
    const url = new URL(`${API_BASE_URL}/applications/${id}/decision`);
    url.searchParams.append('decision', decision);
    url.searchParams.append('remarks', remarks);
    const res = await fetch(url.toString(), { method: 'POST' });
    return handleResponse<{ success: boolean; message: string; operational_status: string }>(res);
  },

  async getEVCQueue(status?: string): Promise<EVCItem[]> {
    const url = new URL(`${API_BASE_URL}/evc`);
    if (status) url.searchParams.append('status', status);
    const res = await fetch(url.toString());
    return handleResponse<EVCItem[]>(res);
  },

  async scheduleEVC(id: string, scheduled_at: string, assigned_team: string, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/evc/${id}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_at, assigned_team, notes }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async completeEVC(id: string, outcome: string, report_summary: string, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/evc/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome, report_summary, notes }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getComplianceList(status?: string): Promise<UndertakingItem[]> {
    const url = new URL(`${API_BASE_URL}/compliance`);
    if (status) url.searchParams.append('status', status);
    const res = await fetch(url.toString());
    return handleResponse<UndertakingItem[]>(res);
  },

  async submitComplianceEvidence(id: string, evidence_filename: string, comments?: string) {
    const res = await fetch(`${API_BASE_URL}/compliance/${id}/submit-evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evidence_filename, comments }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async reviewComplianceEvidence(id: string, action: 'VERIFY' | 'REQUEST_CLARIFICATION', reason: string) {
    const res = await fetch(`${API_BASE_URL}/compliance/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getDocuments(status?: string): Promise<DocumentItem[]> {
    const url = new URL(`${API_BASE_URL}/documents`);
    if (status) url.searchParams.append('status', status);
    const res = await fetch(url.toString());
    return handleResponse<DocumentItem[]>(res);
  },

  async renewDocument(id: string, filename: string, valid_from?: string, expires_on?: string) {
    const res = await fetch(`${API_BASE_URL}/documents/${id}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, valid_from, expires_on }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async verifyDocument(id: string, status: string, comments?: string) {
    const res = await fetch(`${API_BASE_URL}/documents/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comments }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getNotifications(role?: string, unread_only?: boolean): Promise<NotificationItem[]> {
    const url = new URL(`${API_BASE_URL}/notifications`);
    if (role && role !== 'ALL') url.searchParams.append('role', role);
    if (unread_only) url.searchParams.append('unread_only', 'true');
    const res = await fetch(url.toString());
    return handleResponse<NotificationItem[]>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return handleResponse<{ success: boolean }>(res);
  },

  async getAuditEvents(entityId: string = 'ALL'): Promise<AuditEventItem[]> {
    const res = await fetch(`${API_BASE_URL}/audit/${entityId}`);
    return handleResponse<AuditEventItem[]>(res);
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE_URL}/reset-demo`, {
      method: 'POST',
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async triggerDeadlineEvaluation() {
    const res = await fetch(`${API_BASE_URL}/evaluate-deadlines`, {
      method: 'POST',
    });
    return handleResponse<{ success: boolean; summary: any; message: string }>(res);
  },
};
