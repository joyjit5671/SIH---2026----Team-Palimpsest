from collections import defaultdict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Application, WorkflowEvent, EVCEvent, Document, User
from app.schemas import DashboardSummary, WorkloadItem, WorkflowEventRead, DeadlineState
from app.services.deadlines import DeadlineService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns dashboard KPIs, stage distributions, ageing/overdue metrics, and workload stats.
    Reconciles with underlying synthetic or persisted records.
    """
    apps = db.query(Application).all()
    total_apps = len(apps)

    by_stage = defaultdict(int)
    by_status = defaultdict(int)
    overdue_count = 0
    officer_workload = defaultdict(lambda: {"assigned": 0, "overdue": 0})

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

    # Documents approaching expiry (within 30 days) or expired
    documents = db.query(Document).all()
    upcoming_expiries = 0
    for doc in documents:
        _, diff, _ = DeadlineService.calculate_document_state(doc.expires_on, doc.review_status)
        if diff <= 30:
            upcoming_expiries += 1

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

    return DashboardSummary(
        total_applications=total_apps,
        by_stage=dict(by_stage),
        by_status=dict(by_status),
        overdue_count=overdue_count,
        upcoming_expiries=upcoming_expiries,
        pending_evc=pending_evc,
        workload=workload,
        recent_activity=recent_activity
    )
