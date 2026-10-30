from datetime import date, datetime, timezone
from typing import Optional, Tuple
from app.schemas import DeadlineState, NotificationSeverity, DocumentState

class DeadlineService:
    @staticmethod
    def calculate_deadline_state(due_date: Optional[date]) -> DeadlineState:
        """
        Calculates deadline state from due_date:
        - None -> NO_DEADLINE
        - past -> OVERDUE
        - today -> DUE_TODAY
        - <= 3 days -> DUE_SOON
        - > 3 days -> UPCOMING
        """
        if not due_date:
            return DeadlineState.NO_DEADLINE
        
        today = datetime.now(timezone.utc).date()
        diff = (due_date - today).days

        if diff < 0:
            return DeadlineState.OVERDUE
        elif diff == 0:
            return DeadlineState.DUE_TODAY
        elif diff <= 3:
            return DeadlineState.DUE_SOON
        else:
            return DeadlineState.UPCOMING

    @staticmethod
    def calculate_document_state(expires_on: date, review_status: Optional[str] = None) -> Tuple[DocumentState, int, NotificationSeverity]:
        """
        Calculates document status, days remaining, and severity badge.
        Warning window: 30 days before expiration.
        """
        today = datetime.now(timezone.utc).date()
        diff = (expires_on - today).days

        if review_status == "AWAITING_VERIFICATION":
            state = DocumentState.AWAITING_VERIFICATION
            severity = NotificationSeverity.WARNING
        elif review_status == "RENEWAL_SUBMITTED":
            state = DocumentState.RENEWAL_SUBMITTED
            severity = NotificationSeverity.INFO
        elif diff < 0:
            state = DocumentState.EXPIRED
            severity = NotificationSeverity.CRITICAL
        elif diff <= 30:
            state = DocumentState.APPROACHING_EXPIRY
            severity = NotificationSeverity.WARNING if diff > 7 else NotificationSeverity.URGENT
        else:
            state = DocumentState.VALID
            severity = NotificationSeverity.INFO

        return state, diff, severity
