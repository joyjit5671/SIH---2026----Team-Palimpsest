from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Application, WorkflowEvent, EVCEvent, Document, User, Undertaking
from app.schemas import DashboardSummary, WorkloadItem, WorkflowEventRead, DeadlineState
from app.services.deadlines import DeadlineService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    region: Optional[str] = Query(None, description="Optional region filter"),
    db: Session = Depends(get_db)
):
    """
    Returns dashboard KPIs, stage distributions, ageing/overdue metrics, and workload stats.
    Reconciles with underlying synthetic or persisted records.
    """
    all_apps = db.query(Application).all()
    
    # Regional workload across national inventory
    regional_counts = defaultdict(int)
    for app in all_apps:
        reg = app.region or "Central"
        regional_counts[reg] += 1
    
    # Ensure all primary regions have a count key
    for reg_name in ["Eastern", "Western", "Northern", "Southern", "Central"]:
        if reg_name not in regional_counts:
            regional_counts[reg_name] = 0

    # Filter apps if specific region requested
    if region and region.upper() != "ALL":
        apps = [a for a in all_apps if a.region and a.region.lower() == region.lower()]
    else:
        apps = all_apps

    total_apps = len(apps)

    by_stage = defaultdict(int)
    by_status = defaultdict(int)
    overdue_count = 0
    officer_workload = defaultdict(lambda: {"assigned": 0, "overdue": 0})
    ageing = {"< 7 Days": 0, "7 - 14 Days": 0, "15 - 30 Days": 0, "> 30 Days": 0}
    now_utc = datetime.now(timezone.utc)

    for app in apps:
        by_stage[app.current_stage] += 1
        by_status[app.operational_status] += 1
        d_state = DeadlineService.calculate_deadline_state(app.due_date)
        is_overdue = (d_state == DeadlineState.OVERDUE)
        if is_overdue:
            overdue_count += 1

        if app.assigned_user_id:
            officer_workload[app.assigned_user_id]["assigned"] += 1
            if is_overdue:
                officer_workload[app.assigned_user_id]["overdue"] += 1

        # Calculate pendency ageing
        if app.submitted_at:
            submitted_date = app.submitted_at.replace(tzinfo=timezone.utc) if app.submitted_at.tzinfo is None else app.submitted_at
            days_age = max(0, (now_utc - submitted_date).days)
        else:
            days_age = 5

        if days_age < 7:
            ageing["< 7 Days"] += 1
        elif days_age < 15:
            ageing["7 - 14 Days"] += 1
        elif days_age <= 30:
            ageing["15 - 30 Days"] += 1
        else:
            ageing["> 30 Days"] += 1

    # Documents approaching expiry (within 30 days) or expired
    documents = db.query(Document).all()
    upcoming_expiries = 0
    for doc in documents:
        _, diff, _ = DeadlineService.calculate_document_state(doc.expires_on, doc.review_status)
        if diff <= 30:
            upcoming_expiries += 1

    # Pending compliance undertakings
    pending_compliance = db.query(Undertaking).filter(Undertaking.status != "VERIFIED").count()

    # Pending EVC items
    pending_evc = db.query(EVCEvent).filter(
        EVCEvent.status.in_(["PENDING", "SCHEDULED"])
    ).count()

    # Officer workload items
    users = db.query(User).filter(User.role.in_(["PROCESSING_OFFICER", "SUPERVISOR"])).all()
    workload: list[WorkloadItem] = []
    for user in users:
        stat = officer_workload.get(user.id, {"assigned": 0, "overdue": 0})
        workload.append(
            WorkloadItem(
                officer_id=user.id,
                officer_name=user.display_name,
                assigned_count=stat["assigned"],
                overdue_count=stat["overdue"]
            )
        )

    # Recent activities (last 10 workflow events)
    recent_events = db.query(WorkflowEvent).order_by(
        desc(WorkflowEvent.created_at)
    ).limit(10).all()

    recent_activity = [
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
        for ev in recent_events
    ]

    # Ensure all primary stages are represented in stage_distribution
    stage_dist = {
        "SCRUTINY": by_stage.get("SCRUTINY", 0),
        "EVC": by_stage.get("EVC", 0),
        "SAC_SHC": by_stage.get("SAC_SHC", 0),
        "FINAL_REVIEW": by_stage.get("FINAL_REVIEW", 0),
        "COMPLETED": by_stage.get("COMPLETED", 0),
    }

    return DashboardSummary(
        total_applications=total_apps,
        pending_scrutiny=by_stage.get("SCRUTINY", 0),
        pending_evc=by_stage.get("EVC", pending_evc),
        under_sac_shc=by_stage.get("SAC_SHC", 0),
        returned_for_clarification=by_status.get("RETURNED", 0),
        approved_count=by_status.get("APPROVED", 0),
        rejected_count=by_status.get("REJECTED", 0),
        overdue_count=overdue_count,
        upcoming_expiries=upcoming_expiries,
        pending_compliance=pending_compliance,
        by_stage=dict(by_stage),
        by_status=dict(by_status),
        stage_distribution=stage_dist,
        status_distribution=dict(by_status),
        regional_workload=dict(regional_counts),
        ageing_buckets=ageing,
        workload=workload,
        recent_activity=recent_activity
    )
