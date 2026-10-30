import json
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.database import get_db
from app.models import Application, Institution, User
from app.schemas import (
    ApplicationListResponse, ApplicationSummary, ApplicationDetail,
    WorkflowEventRead, ReturnApplicationRequest, ReturnApplicationResponse,
    TransitionApplicationRequest, TransitionApplicationResponse,
    ResubmitApplicationRequest, ApplicationStatus
)
from app.services.workflow import WorkflowService
from app.services.deadlines import DeadlineService

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("", response_model=ApplicationListResponse)
def list_applications(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    stage: Optional[str] = Query(None, description="Filter by workflow stage"),
    status: Optional[str] = Query(None, description="Filter by operational status"),
    region: Optional[str] = Query(None, description="Filter by geographical region"),
    search: Optional[str] = Query(None, description="Search by application number or institution name"),
    db: Session = Depends(get_db)
):
    """
    Paginated and filterable application register as mandated by PRD FEAT-02 & TRD Section 7.
    """
    query = db.query(Application).join(Institution, Application.institution_id == Institution.id)

    if stage:
        query = query.filter(Application.current_stage == stage)
    if status:
        query = query.filter(Application.operational_status == status)
    if region:
        query = query.filter(Application.region == region)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Application.application_number.ilike(search_fmt),
                Institution.name.ilike(search_fmt)
            )
        )

    total = query.count()
    apps = query.order_by(desc(Application.updated_at)).offset((page - 1) * page_size).limit(page_size).all()

    items: List[ApplicationSummary] = []
    today = datetime.now(timezone.utc).date()

    for app in apps:
        assigned_user = db.query(User).filter(User.id == app.assigned_user_id).first() if app.assigned_user_id else None
        deadline_state = DeadlineService.calculate_deadline_state(app.due_date)
        days_in_stage = (today - app.updated_at.date()).days if app.updated_at else 0

        items.append(
            ApplicationSummary(
                id=app.id,
                application_number=app.application_number,
                institution_id=app.institution_id,
                institution_name=app.institution.name if app.institution else "Unknown Institution",
                region=app.region,
                application_type=app.application_type,
                current_stage=app.current_stage,
                operational_status=ApplicationStatus(app.operational_status),
                assigned_to=assigned_user.display_name if assigned_user else "Unassigned",
                assigned_user_id=app.assigned_user_id,
                due_date=app.due_date,
                days_in_stage=max(0, days_in_stage),
                deadline_state=deadline_state,
                updated_at=app.updated_at,
                submitted_at=app.submitted_at
            )
        )

    return ApplicationListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total
    )

@router.get("/{id}", response_model=ApplicationDetail)
def get_application_detail(id: str, db: Session = Depends(get_db)):
    """
    Application detail view with configured route, progress stages, and clarification status.
    Accepts internal UUID or human-friendly application number (e.g. APP-1001).
    """
    app = db.query(Application).filter(
        (Application.id == id) | (Application.application_number == id)
    ).first()

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{id}' not found"
        )

    assigned_user = db.query(User).filter(User.id == app.assigned_user_id).first() if app.assigned_user_id else None
    deadline_state = DeadlineService.calculate_deadline_state(app.due_date)
    stages = WorkflowService.get_route_stages(db, app.route_code)

    curr_idx = stages.index(app.current_stage) if app.current_stage in stages else 0
    completed_stages = stages[:curr_idx]
    pending_stages = stages[curr_idx + 1:]

    requested_clarifications = []
    if app.requested_clarifications_json:
        try:
            requested_clarifications = json.loads(app.requested_clarifications_json)
        except Exception:
            requested_clarifications = []

    # Map timeline events
    timeline = [
        WorkflowEventRead(
            id=ev.id,
            application_id=ev.application_id,
            from_stage=ev.from_stage,
            to_stage=ev.to_stage,
            action=ev.action,
            reason=ev.reason,
            actor_id=ev.actor_id,
            actor_role=ev.actor_role,
            is_system=ev.is_system,
            created_at=ev.created_at
        )
        for ev in app.events
    ]

    return ApplicationDetail(
        id=app.id,
        application_number=app.application_number,
        institution_id=app.institution_id,
        institution_name=app.institution.name if app.institution else "Unknown",
        institution_code=app.institution.institution_code if app.institution else "",
        region=app.region,
        application_type=app.application_type,
        current_stage=app.current_stage,
        operational_status=ApplicationStatus(app.operational_status),
        assigned_user_id=app.assigned_user_id,
        assigned_to=assigned_user.display_name if assigned_user else "Unassigned",
        due_date=app.due_date,
        deadline_state=deadline_state,
        route_code=app.route_code,
        allowed_stages=stages,
        completed_stages=completed_stages,
        pending_stages=pending_stages,
        last_return_reason=app.last_return_reason,
        requested_clarifications=requested_clarifications,
        submitted_at=app.submitted_at,
        updated_at=app.updated_at,
        timeline=timeline
    )

@router.get("/{id}/timeline", response_model=List[WorkflowEventRead])
def get_application_timeline(id: str, db: Session = Depends(get_db)):
    """
    Returns full chronological workflow audit timeline for an application.
    """
    app = db.query(Application).filter(
        (Application.id == id) | (Application.application_number == id)
    ).first()

    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application '{id}' not found"
        )

    return [
        WorkflowEventRead(
            id=ev.id,
            application_id=ev.application_id,
            from_stage=ev.from_stage,
            to_stage=ev.to_stage,
            action=ev.action,
            reason=ev.reason,
            actor_id=ev.actor_id,
            actor_role=ev.actor_role,
            is_system=ev.is_system,
            created_at=ev.created_at
        )
        for ev in app.events
    ]

@router.post("/{id}/return", response_model=ReturnApplicationResponse)
def return_application(id: str, req: ReturnApplicationRequest, db: Session = Depends(get_db)):
    """
    Returns an application for clarification/deficiency with mandatory reason.
    Meets PRD FEAT-06 and TRD Section 7/8.
    """
    app = WorkflowService.return_for_clarification(
        db=db,
        application_id=id,
        reason=req.reason,
        requested_items=req.requested_items,
        actor_id=req.actor_id or "officer-01",
        actor_role="PROCESSING_OFFICER"
    )

    return ReturnApplicationResponse(
        application_id=app.id,
        application_number=app.application_number,
        status=ApplicationStatus.RETURNED,
        message="Application returned for clarification successfully",
        audit_event_created=True,
        returned_at=app.updated_at
    )

@router.post("/{id}/transition", response_model=TransitionApplicationResponse)
def transition_application(id: str, req: TransitionApplicationRequest, db: Session = Depends(get_db)):
    """
    Attempts a configured stage transition. Validates prerequisites, sequence, and permissions.
    """
    app = db.query(Application).filter(
        (Application.id == id) | (Application.application_number == id)
    ).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application '{id}' not found")

    previous_stage = app.current_stage

    updated_app = WorkflowService.transition_application(
        db=db,
        application_id=id,
        to_stage=req.to_stage,
        action=req.action,
        actor_id=req.actor_id or "officer-01",
        actor_role="PROCESSING_OFFICER",
        reason=req.reason
    )

    return TransitionApplicationResponse(
        application_id=updated_app.id,
        application_number=updated_app.application_number,
        previous_stage=previous_stage,
        current_stage=updated_app.current_stage,
        operational_status=ApplicationStatus(updated_app.operational_status),
        message=f"Application transitioned from {previous_stage} to {updated_app.current_stage} successfully",
        audit_event_created=True
    )

@router.post("/{id}/resubmit", response_model=TransitionApplicationResponse)
def resubmit_application(id: str, req: ResubmitApplicationRequest, db: Session = Depends(get_db)):
    """
    Applicant resubmission endpoint. Restores status to IN_REVIEW while preserving history.
    """
    app = WorkflowService.resubmit_application(
        db=db,
        application_id=id,
        response_notes=req.response_notes,
        submitted_documents=req.submitted_documents,
        actor_id=req.actor_id or "inst-01"
    )

    return TransitionApplicationResponse(
        application_id=app.id,
        application_number=app.application_number,
        previous_stage=app.current_stage,
        current_stage=app.current_stage,
        operational_status=ApplicationStatus(app.operational_status),
        message="Application resubmitted successfully with updated documents",
        audit_event_created=True
    )
