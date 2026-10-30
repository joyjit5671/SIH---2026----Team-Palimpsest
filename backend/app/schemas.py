from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from enum import Enum
from typing import List, Optional, Dict, Any

# ================= Enums =================

class ApplicationStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    IN_REVIEW = "IN_REVIEW"
    RETURNED = "RETURNED"
    COMPLETED = "COMPLETED"

class WorkflowStage(str, Enum):
    SCRUTINY = "SCRUTINY"
    EVC = "EVC"
    SAC_SHC = "SAC_SHC"
    FINAL_REVIEW = "FINAL_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class EVCStatus(str, Enum):
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    FOLLOW_UP = "FOLLOW_UP"

class EvidenceReviewStatus(str, Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    CLARIFICATION_REQUIRED = "CLARIFICATION_REQUIRED"

class DocumentState(str, Enum):
    VALID = "VALID"
    APPROACHING_EXPIRY = "APPROACHING_EXPIRY"
    EXPIRED = "EXPIRED"
    RENEWAL_SUBMITTED = "RENEWAL_SUBMITTED"
    AWAITING_VERIFICATION = "AWAITING_VERIFICATION"

class NotificationSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    URGENT = "URGENT"
    CRITICAL = "CRITICAL"

class DeadlineState(str, Enum):
    NO_DEADLINE = "NO_DEADLINE"
    UPCOMING = "UPCOMING"
    DUE_SOON = "DUE_SOON"
    DUE_TODAY = "DUE_TODAY"
    OVERDUE = "OVERDUE"
    RESOLVED = "RESOLVED"

class UserRole(str, Enum):
    INSTITUTION = "INSTITUTION"
    PROCESSING_OFFICER = "PROCESSING_OFFICER"
    EVC_COORDINATOR = "EVC_COORDINATOR"
    SAC_SHC_REVIEWER = "SAC_SHC_REVIEWER"
    SUPERVISOR = "SUPERVISOR"
    COMPLIANCE_REVIEWER = "COMPLIANCE_REVIEWER"
    ADMIN = "ADMIN"
    AUDITOR = "AUDITOR"

# ================= Base Models =================

class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    database: str

# ================= Applications =================

class ApplicationSummary(BaseModel):
    id: str
    application_number: str
    institution_id: str
    institution_name: str
    region: str
    application_type: str
    current_stage: str
    operational_status: ApplicationStatus
    assigned_to: Optional[str] = None
    assigned_user_id: Optional[str] = None
    due_date: Optional[date] = None
    days_in_stage: int = 0
    deadline_state: DeadlineState = DeadlineState.NO_DEADLINE
    updated_at: datetime
    submitted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ApplicationListResponse(BaseModel):
    items: List[ApplicationSummary]
    page: int
    page_size: int
    total: int

class WorkflowEventRead(BaseModel):
    id: str
    application_id: str
    from_stage: Optional[str] = None
    to_stage: str
    action: str
    reason: Optional[str] = None
    actor_id: str
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None
    is_system: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ApplicationDetail(BaseModel):
    id: str
    application_number: str
    institution_id: str
    institution_name: str
    institution_code: str
    region: str
    application_type: str
    current_stage: str
    operational_status: ApplicationStatus
    assigned_user_id: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[date] = None
    deadline_state: DeadlineState = DeadlineState.NO_DEADLINE
    route_code: str
    allowed_stages: List[str]
    completed_stages: List[str]
    pending_stages: List[str]
    last_return_reason: Optional[str] = None
    requested_clarifications: List[str] = Field(default_factory=list)
    submitted_at: datetime
    updated_at: datetime
    timeline: List[WorkflowEventRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

# ================= Workflow Actions =================

class ReturnApplicationRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=1000, description="Mandatory deficiency or clarification reason")
    requested_items: List[str] = Field(default_factory=list, description="Items required to be addressed")
    actor_id: Optional[str] = "officer-01"

class ReturnApplicationResponse(BaseModel):
    application_id: str
    application_number: str
    status: ApplicationStatus
    message: str
    audit_event_created: bool
    returned_at: datetime

class TransitionApplicationRequest(BaseModel):
    action: str = Field(description="Action e.g. PROCEED, APPROVE_STAGE, COMPLETE_EVC")
    to_stage: str = Field(description="Target workflow stage")
    reason: Optional[str] = None
    actor_id: Optional[str] = "officer-01"

class TransitionApplicationResponse(BaseModel):
    application_id: str
    application_number: str
    previous_stage: str
    current_stage: str
    operational_status: ApplicationStatus
    message: str
    audit_event_created: bool

class ResubmitApplicationRequest(BaseModel):
    response_notes: str = Field(min_length=3, max_length=1000)
    submitted_documents: List[str] = Field(default_factory=list)
    actor_id: Optional[str] = "inst-01"

# ================= EVC Models =================

class EVCItem(BaseModel):
    id: str
    application_id: str
    application_number: str
    institution_name: str
    region: str
    status: EVCStatus
    scheduled_at: Optional[datetime] = None
    due_at: Optional[datetime] = None
    assigned_team: Optional[str] = None
    lead_expert: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EVCScheduleRequest(BaseModel):
    scheduled_at: datetime
    assigned_team: str = Field(min_length=2)
    lead_expert: Optional[str] = None
    notes: Optional[str] = None
    actor_id: Optional[str] = "evc-coord-01"

# ================= Compliance & Documents =================

class ComplianceItem(BaseModel):
    id: str
    application_id: Optional[str] = None
    application_number: Optional[str] = None
    institution_name: str
    item_type: str  # UNDERTAKING or DOCUMENT
    title: str
    due_date: Optional[date] = None
    expires_on: Optional[date] = None
    status: str
    days_remaining: int
    severity: NotificationSeverity
    submitted_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class UndertakingReviewRequest(BaseModel):
    status: EvidenceReviewStatus
    reason: Optional[str] = None
    actor_id: Optional[str] = "comp-rev-01"

# ================= Dashboard =================

class WorkloadItem(BaseModel):
    officer_name: str
    officer_id: str
    assigned_count: int
    overdue_count: int

class DashboardSummary(BaseModel):
    total_applications: int
    by_stage: Dict[str, int]
    by_status: Dict[str, int]
    overdue_count: int
    upcoming_expiries: int
    pending_evc: int
    workload: List[WorkloadItem]
    recent_activity: List[WorkflowEventRead]

# ================= Notifications =================

class NotificationItem(BaseModel):
    id: str
    recipient_id: str
    entity_type: str
    entity_id: str
    severity: NotificationSeverity
    message: str
    due_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    is_simulated: bool = True

    model_config = ConfigDict(from_attributes=True)

# ================= Audit Trail =================

class AuditEventRead(BaseModel):
    id: str
    actor_id: str
    actor_role: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    before_json: Optional[Dict[str, Any]] = None
    after_json: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    is_system: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
