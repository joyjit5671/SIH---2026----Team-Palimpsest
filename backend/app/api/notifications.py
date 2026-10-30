from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Notification, utc_now
from app.schemas import NotificationItem, NotificationSeverity

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationItem])
def get_notifications(
    recipient_id: Optional[str] = Query(None, description="Filter by recipient identity or role"),
    unread_only: bool = Query(False, description="Filter unread notifications"),
    db: Session = Depends(get_db)
):
    """
    Returns alerts and notifications. Meets PRD FEAT-17.
    """
    query = db.query(Notification)
    if recipient_id:
        query = query.filter(
            (Notification.recipient_id == recipient_id) | 
            (Notification.recipient_id == "all-officers") |
            (Notification.recipient_id == "all-evc")
        )
    if unread_only:
        query = query.filter(Notification.read_at.is_(None))

    notifications = query.order_by(desc(Notification.created_at)).limit(50).all()

    return [
        NotificationItem(
            id=n.id,
            recipient_id=n.recipient_id,
            entity_type=n.entity_type,
            entity_id=n.entity_id,
            severity=NotificationSeverity(n.severity),
            message=n.message,
            due_at=n.due_at,
            read_at=n.read_at,
            created_at=n.created_at,
            is_simulated=n.is_simulated
        )
        for n in notifications
    ]

@router.post("/{id}/read", response_model=NotificationItem)
def mark_notification_read(id: str, db: Session = Depends(get_db)):
    """
    Marks a notification as read.
    """
    notification = db.query(Notification).filter(Notification.id == id).first()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification '{id}' not found"
        )

    notification.read_at = utc_now()
    db.commit()
    db.refresh(notification)

    return NotificationItem(
        id=notification.id,
        recipient_id=notification.recipient_id,
        entity_type=notification.entity_type,
        entity_id=notification.entity_id,
        severity=NotificationSeverity(notification.severity),
        message=notification.message,
        due_at=notification.due_at,
        read_at=notification.read_at,
        created_at=notification.created_at,
        is_simulated=notification.is_simulated
    )
