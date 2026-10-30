/**
 * TypeScript API contracts matching ApprovalFlow AI FastAPI backend schemas.
 */

export type UserRole = 
  | 'INSTITUTION_REP' 
  | 'SCRUTINY_OFFICER' 
  | 'EVC_COORDINATOR' 
  | 'SUPERVISOR' 
  | 'ADMIN';

export type ApplicationStatus = 
  | 'SUBMITTED' 
  | 'IN_REVIEW' 
  | 'RETURNED' 
  | 'APPROVED' 
  | 'REJECTED';

export type WorkflowStage = 
  | 'SCRUTINY' 
  | 'EVC' 
  | 'SAC_SHC' 
  | 'FINAL_REVIEW' 
  | 'COMPLETED';

export type EVCStatus = 
  | 'PENDING_SCHEDULE' 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'OVERDUE';

export type ComplianceStatus = 
  | 'PENDING' 
  | 'EVIDENCE_SUBMITTED' 
  | 'AWAITING_REVIEW' 
  | 'CLARIFICATION_REQUIRED' 
  | 'VERIFIED_CLOSED' 
  | 'OVERDUE';

export type DocumentReviewStatus = 
  | 'VALID' 
  | 'APPROACHING_EXPIRY' 
  | 'EXPIRED' 
  | 'RENEWAL_SUBMITTED' 
  | 'AWAITING_VERIFICATION';

export interface Institution {
  id: string;
  institution_code: string;
  name: string;
  region: string;
  state: string;
  contact_email?: string;
  established_year?: number;
}

export interface WorkflowEvent {
  id: string;
  application_id: string;
  from_stage?: string;
  to_stage: string;
  action: string;
  reason?: string;
  actor_id: string;
  actor_name: string;
  actor_role?: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  application_id?: string;
  institution_id: string;
  document_type: string;
  filename: string;
  valid_from?: string;
  expires_on?: string;
  review_status: DocumentReviewStatus;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface UndertakingItem {
  id: string;
  application_id?: string;
  institution_id: string;
  institution_name?: string;
  title: string;
  description?: string;
  due_date: string;
  status: ComplianceStatus;
  evidence_filename?: string;
  submitted_at?: string;
  verified_by?: string;
  verified_at?: string;
  comments?: string;
  created_at: string;
}

export interface EVCItem {
  id: string;
  application_id: string;
  application_number: string;
  institution_name: string;
  region: string;
  status: EVCStatus;
  scheduled_at?: string;
  due_at?: string;
  completed_at?: string;
  assigned_team?: string;
  report_summary?: string;
  notes?: string;
  created_at: string;
}

export interface ApplicationSummary {
  id: string;
  application_number: string;
  institution_name: string;
  institution_code?: string;
  region: string;
  application_type: string;
  current_stage: WorkflowStage;
  operational_status: ApplicationStatus;
  assigned_to?: string;
  route_code: string;
  academic_year: string;
  submitted_at: string;
  due_date?: string;
  updated_at: string;
  days_in_current_stage: number;
  is_overdue: boolean;
}

export interface ApplicationDetail extends ApplicationSummary {
  institution: Institution;
  return_reason?: string;
  requested_items?: string[];
  resubmission_notes?: string;
  timeline: WorkflowEvent[];
  documents: DocumentItem[];
  evc_details?: EVCItem;
  undertakings: UndertakingItem[];
}

export interface PaginatedApplicationsResponse {
  items: ApplicationSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface DashboardSummary {
  total_applications: number;
  pending_scrutiny: number;
  pending_evc: number;
  under_sac_shc: number;
  returned_for_clarification: number;
  approved_count: number;
  rejected_count: number;
  overdue_count: number;
  upcoming_expiries: number;
  pending_compliance: number;
  stage_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  regional_workload: Record<string, number>;
  ageing_buckets: Record<string, number>;
}

export interface NotificationItem {
  id: string;
  recipient_role: string;
  entity_type: string;
  entity_id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  due_at?: string;
  read_at?: string;
  is_simulated: boolean;
  created_at: string;
}

export interface AuditEventItem {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_json?: Record<string, any>;
  after_json?: Record<string, any>;
  reason?: string;
  is_system_generated: boolean;
  created_at: string;
}
