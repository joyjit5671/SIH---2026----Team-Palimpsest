import json
from typing import Any, Optional, Dict
from sqlalchemy.orm import Session
from app.models import AuditEvent, utc_now

class AuditService:
    @staticmethod
    def record_event(
        db: Session,
        actor_id: str,
        action: str,
        entity_type: str,
        entity_id: str,
        before: Optional[Dict[str, Any]] = None,
        after: Optional[Dict[str, Any]] = None,
        reason: Optional[str] = None,
        actor_role: Optional[str] = None,
        is_system: bool = False
    ) -> AuditEvent:
        """
        Atomically records an append-only audit event in the active transaction.
        Never commits here; caller controls transaction boundaries.
        """
        event = AuditEvent(
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            before_json=json.dumps(before, default=str) if before is not None else None,
            after_json=json.dumps(after, default=str) if after is not None else None,
            reason=reason,
            is_system=is_system,
            created_at=utc_now()
        )
        db.add(event)
        return event

    @staticmethod
    def get_events_for_entity(db: Session, entity_id: str):
        return db.query(AuditEvent).filter(
            AuditEvent.entity_id == entity_id
        ).order_by(AuditEvent.created_at.desc()).all()
