from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import EVCEvent, Application, Institution, Notification, utc_now
from app.schemas import EVCItem, EVCScheduleRequest, EVCStatus, NotificationSeverity
from app.services.audit import AuditService

router = APIRouter(prefix="/evc", tags=["EVC Management"])

@router.get("", response_model=List[EVCItem])
def get_evc_queue(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """
    Returns EVC queue with schedule, assigned committee/team, visit status, and deadlines.
    Meets PRD FEAT-10.
    """
    query = db.query(EVCEvent).join(Application, EVCEvent.application_id == Application.id)
    if status_filter:
        query = query.filter(EVCEvent.status == status_filter)

    events = query.order_by(desc(EVCEvent.created_at)).all()

    items: List[EVCItem] = []
    for ev in events:
        inst_name = ev.application.institution.name if ev.application and ev.application.institution else "Unknown"
        region = ev.application.region if ev.application else "Unknown"
        items.append(
            EVCItem(
                id=ev.id,
                application_id=ev.application_id,
                application_number=ev.application.application_number if ev.application else "",
                institution_name=inst_name,
                region=region,
                status=EVCStatus(ev.status),
                scheduled_at=ev.scheduled_at,
                due_at=ev.due_at,
                assigned_team=ev.assigned_team,
                lead_expert=ev.lead_expert,
                notes=ev.notes,
                created_at=ev.created_at
            )
        )
    return items

@router.post("/{id}/schedule", response_model=EVCItem)
def schedule_evc(id: str, req: EVCScheduleRequest, db: Session = Depends(get_db)):
    """
    Schedules an EVC visit with committee assignment and date.
    Atomically updates EVC state, writes audit event and creates notification.
    """
    ev = db.query(EVCEvent).filter(EVCEvent.id == id).first()
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"EVC event '{id}' not found"
        )

    before_state = {
        "status": ev.status,
        "scheduled_at": ev.scheduled_at.isoformat() if ev.scheduled_at else None,
        "assigned_team": ev.assigned_team
    }

    ev.status = EVCStatus.SCHEDULED.value
    ev.scheduled_at = req.scheduled_at
    ev.assigned_team = req.assigned_team
    ev.lead_expert = req.lead_expert
    if req.notes:
        ev.notes = req.notes

    after_state = {
        "status": ev.status,
        "scheduled_at": ev.scheduled_at.isoformat(),
        "assigned_team": ev.assigned_team
    }

    AuditService.record_event(
        db=db,
        actor_id=req.actor_id or "evc-coord-01",
        actor_role="EVC_COORDINATOR",
        action="SCHEDULE_EVC_VISIT",
        entity_type="EVC_EVENT",
        entity_id=ev.id,
        before=before_state,
        after=after_state,
        reason=f"Scheduled visit for {req.scheduled_at} by team {req.assigned_team}"
    )

    # In-app notification
    notification = Notification(
        recipient_id="all-evc",
        entity_type="EVC_EVENT",
        entity_id=ev.id,
        severity=NotificationSeverity.INFO.value,
        message=f"EVC visit scheduled for application {ev.application.application_number} on {req.scheduled_at.strftime('%Y-%m-%d')}",
        created_at=utc_now(),
        is_simulated=True
    )
    db.add(notification)

    db.commit()
    db.refresh(ev)

    inst_name = ev.application.institution.name if ev.application and ev.application.institution else "Unknown"
    region = ev.application.region if ev.application else "Unknown"

    return EVCItem(
        id=ev.id,
        application_id=ev.application_id,
        application_number=ev.application.application_number if ev.application else "",
        institution_name=inst_name,
        region=region,
        status=EVCStatus(ev.status),
        scheduled_at=ev.scheduled_at,
        due_at=ev.due_at,
        assigned_team=ev.assigned_team,
        lead_expert=ev.lead_expert,
        notes=ev.notes,
        created_at=ev.created_at
    )
