from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Undertaking, Document, Application, Institution, Notification, utc_now
from app.schemas import (
    ComplianceItem, UndertakingReviewRequest, EvidenceReviewStatus,
    NotificationSeverity, DocumentState
)
from app.services.deadlines import DeadlineService
from app.services.audit import AuditService

router = APIRouter(prefix="/compliance", tags=["Compliance & Documents"])

@router.get("", response_model=List[ComplianceItem])
def get_compliance_items(
    item_type: Optional[str] = Query(None, description="UNDERTAKING or DOCUMENT"),
    db: Session = Depends(get_db)
):
    """
    Returns time-bound undertakings and document validity records.
    Accurately computes days_remaining and alert severity.
    Meets PRD FEAT-12 & FEAT-15.
    """
    results: List[ComplianceItem] = []
    today = datetime.now(timezone.utc).date()

    # 1. Fetch Undertakings
    if not item_type or item_type.upper() == "UNDERTAKING":
        undertakings = db.query(Undertaking).order_by(Undertaking.due_date.asc()).all()
        for u in undertakings:
            diff = (u.due_date - today).days
            if u.status == EvidenceReviewStatus.VERIFIED.value:
                severity = NotificationSeverity.INFO
            elif diff < 0:
                severity = NotificationSeverity.CRITICAL
            elif diff <= 7:
                severity = NotificationSeverity.URGENT
            elif diff <= 30:
                severity = NotificationSeverity.WARNING
            else:
                severity = NotificationSeverity.INFO

            inst_name = u.institution.name if u.institution else "Unknown"
            app_no = u.application.application_number if u.application else None

            results.append(
                ComplianceItem(
                    id=u.id,
                    application_id=u.application_id,
                    application_number=app_no,
                    institution_name=inst_name,
                    item_type="UNDERTAKING",
                    title=u.title,
                    due_date=u.due_date,
                    expires_on=None,
                    status=u.status,
                    days_remaining=diff,
                    severity=severity,
                    submitted_at=u.submitted_at,
                    verified_at=u.verified_at,
                    verified_by=u.verified_by
                )
            )

    # 2. Fetch Documents
    if not item_type or item_type.upper() == "DOCUMENT":
        documents = db.query(Document).order_by(Document.expires_on.asc()).all()
        for d in documents:
            _, diff, severity = DeadlineService.calculate_document_state(d.expires_on, d.review_status)
            inst_name = d.institution.name if d.institution else "Unknown"
            app_no = d.application.application_number if d.application else None

            results.append(
                ComplianceItem(
                    id=d.id,
                    application_id=d.application_id,
                    application_number=app_no,
                    institution_name=inst_name,
                    item_type="DOCUMENT",
                    title=f"{d.document_type} (Key: {d.storage_key})",
                    due_date=None,
                    expires_on=d.expires_on,
                    status=d.review_status,
                    days_remaining=diff,
                    severity=severity,
                    submitted_at=d.created_at,
                    verified_at=None,
                    verified_by=None
                )
            )

    return results

@router.post("/undertakings/{id}/review", response_model=ComplianceItem)
def review_undertaking(id: str, req: UndertakingReviewRequest, db: Session = Depends(get_db)):
    """
    Records an authorized compliance review outcome (VERIFIED or CLARIFICATION_REQUIRED).
    Maintains non-repudiation and audit trail. PRD FEAT-13.
    """
    u = db.query(Undertaking).filter(Undertaking.id == id).first()
    if not u:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Undertaking '{id}' not found"
        )

    before_state = {
        "status": u.status,
        "verified_by": u.verified_by,
        "verified_at": u.verified_at.isoformat() if u.verified_at else None
    }

    u.status = req.status.value
    u.review_reason = req.reason
    u.verified_by = req.actor_id or "compliance-officer"
    u.verified_at = utc_now()

    after_state = {
        "status": u.status,
        "verified_by": u.verified_by,
        "verified_at": u.verified_at.isoformat()
    }

    AuditService.record_event(
        db=db,
        actor_id=req.actor_id or "comp-rev-01",
        actor_role="COMPLIANCE_REVIEWER",
        action="REVIEW_UNDERTAKING_EVIDENCE",
        entity_type="UNDERTAKING",
        entity_id=u.id,
        before=before_state,
        after=after_state,
        reason=req.reason or f"Recorded outcome {req.status.value}"
    )

    db.commit()
    db.refresh(u)

    today = datetime.now(timezone.utc).date()
    diff = (u.due_date - today).days

    return ComplianceItem(
        id=u.id,
        application_id=u.application_id,
        application_number=u.application.application_number if u.application else None,
        institution_name=u.institution.name if u.institution else "Unknown",
        item_type="UNDERTAKING",
        title=u.title,
        due_date=u.due_date,
        expires_on=None,
        status=u.status,
        days_remaining=diff,
        severity=NotificationSeverity.INFO,
        submitted_at=u.submitted_at,
        verified_at=u.verified_at,
        verified_by=u.verified_by
    )
