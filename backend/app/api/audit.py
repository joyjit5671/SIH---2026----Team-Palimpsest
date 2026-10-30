import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import AuditEvent
from app.schemas import AuditEventRead

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("/{entity_id}", response_model=List[AuditEventRead])
def get_entity_audit_trail(entity_id: str, db: Session = Depends(get_db)):
    """
    Returns append-only audit trail for an entity (Application, EVC, Document).
    Guarantees full non-repudiation and transparency. Meets PRD FEAT-19.
    """
    events = db.query(AuditEvent).filter(
        AuditEvent.entity_id == entity_id
    ).order_by(desc(AuditEvent.created_at)).all()

    results: List[AuditEventRead] = []
    for ev in events:
        before = json.loads(ev.before_json) if ev.before_json else None
        after = json.loads(ev.after_json) if ev.after_json else None
        results.append(
            AuditEventRead(
                id=ev.id,
                actor_id=ev.actor_id,
                actor_role=ev.actor_role,
                action=ev.action,
                entity_type=ev.entity_type,
                entity_id=ev.entity_id,
                before_json=before,
                after_json=after,
                reason=ev.reason,
                is_system=ev.is_system,
                created_at=ev.created_at
            )
        )
    return results
