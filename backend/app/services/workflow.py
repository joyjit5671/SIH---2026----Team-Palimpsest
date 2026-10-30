import json
from typing import List, Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models import Application, WorkflowEvent, WorkflowRoute, Notification, utc_now
from app.schemas import ApplicationStatus, NotificationSeverity
from app.services.audit import AuditService

DEFAULT_ROUTES: Dict[str, List[str]] = {
    "SCRUTINY_EVC": ["SCRUTINY", "EVC", "SAC_SHC", "FINAL_REVIEW"],
    "ONLY_SCRUTINY": ["SCRUTINY", "FINAL_REVIEW"],
    "EVC_SAC_SHC": ["EVC", "SAC_SHC", "FINAL_REVIEW"],
    "ONLY_EVC": ["EVC", "FINAL_REVIEW"]
}

class WorkflowService:
    @staticmethod
    def get_route_stages(db: Session, route_code: str) -> List[str]:
        route = db.query(WorkflowRoute).filter(
            WorkflowRoute.route_code == route_code,
            WorkflowRoute.active == True
        ).first()
        if route and route.stages_json:
            try:
                return json.loads(route.stages_json)
            except Exception:
                pass
        return DEFAULT_ROUTES.get(route_code, DEFAULT_ROUTES["SCRUTINY_EVC"])

    @classmethod
    def transition_application(
        cls,
        db: Session,
        application_id: str,
        to_stage: str,
        action: str,
        actor_id: str = "system",
        actor_role: Optional[str] = "PROCESSING_OFFICER",
        reason: Optional[str] = None
    ) -> Application:
        """
        Executes a validated workflow stage transition in a single database transaction.
        Enforces stage sequence and prerequisites. Raises HTTP 409 on invalid transition.
        """
        app = db.query(Application).filter(
            (Application.id == application_id) | (Application.application_number == application_id)
        ).first()

        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application '{application_id}' not found"
            )

        stages = cls.get_route_stages(db, app.route_code)

        if to_stage not in stages:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Target stage '{to_stage}' is not permitted under configured route '{app.route_code}'."
            )

        if app.operational_status == ApplicationStatus.RETURNED.value and action != "RESUBMIT":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Application is currently in RETURNED status. It must be resubmitted by the applicant before progression."
            )

        # Ensure transition progresses linearly according to configured route unless explicit completion
        curr_idx = stages.index(app.current_stage) if app.current_stage in stages else -1
        target_idx = stages.index(to_stage)

        if target_idx != curr_idx + 1 and target_idx <= curr_idx:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot transition backwards or sideways from '{app.current_stage}' to '{to_stage}'. Allowed next stage: '{stages[curr_idx + 1] if curr_idx + 1 < len(stages) else 'None'}'."
            )

        if target_idx > curr_idx + 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot skip stage(s). Next required stage is '{stages[curr_idx + 1]}'."
            )

        # Snapshot before state
        before_state = {
            "current_stage": app.current_stage,
            "operational_status": app.operational_status,
            "updated_at": app.updated_at.isoformat() if app.updated_at else None
        }

        from_stage = app.current_stage
        app.current_stage = to_stage
        app.operational_status = ApplicationStatus.IN_REVIEW.value
        app.updated_at = utc_now()

        # Insert workflow event
        wf_event = WorkflowEvent(
            application_id=app.id,
            from_stage=from_stage,
            to_stage=to_stage,
            action=action,
            reason=reason,
            actor_id=actor_id,
            actor_role=actor_role,
            is_system=(actor_id == "system"),
            created_at=utc_now()
        )
        db.add(wf_event)

        # Snapshot after state
        after_state = {
            "current_stage": app.current_stage,
            "operational_status": app.operational_status,
            "updated_at": app.updated_at.isoformat()
        }

        # Atomically record audit event in the same transaction
        AuditService.record_event(
            db=db,
            actor_id=actor_id,
            actor_role=actor_role,
            action="STAGE_TRANSITION",
            entity_type="APPLICATION",
            entity_id=app.id,
            before=before_state,
            after=after_state,
            reason=reason or f"Transitioned from {from_stage} to {to_stage} via action {action}"
        )

        # Create alert notification for relevant roles
        notification = Notification(
            recipient_id="all-officers",
            entity_type="APPLICATION",
            entity_id=app.id,
            severity=NotificationSeverity.INFO.value,
            message=f"Application {app.application_number} progressed to stage {to_stage}",
            created_at=utc_now(),
            is_simulated=True
        )
        db.add(notification)

        db.commit()
        db.refresh(app)
        return app

    @classmethod
    def return_for_clarification(
        cls,
        db: Session,
        application_id: str,
        reason: str,
        requested_items: List[str],
        actor_id: str = "officer-01",
        actor_role: str = "PROCESSING_OFFICER"
    ) -> Application:
        """
        Returns an application for deficiency/clarification with mandatory reason.
        Enforces atomic update: status change + workflow event + audit trail + notification.
        """
        if not reason or len(reason.strip()) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid clarification reason (at least 3 characters) is strictly mandatory."
            )

        app = db.query(Application).filter(
            (Application.id == application_id) | (Application.application_number == application_id)
        ).first()

        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application '{application_id}' not found"
            )

        if app.operational_status == ApplicationStatus.RETURNED.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Application is already returned and awaiting institution resubmission."
            )

        before_state = {
            "operational_status": app.operational_status,
            "current_stage": app.current_stage,
            "last_return_reason": app.last_return_reason
        }

        # Update application state
        app.operational_status = ApplicationStatus.RETURNED.value
        app.last_return_reason = reason.strip()
        app.requested_clarifications_json = json.dumps(requested_items)
        app.updated_at = utc_now()

        # Insert workflow timeline event
        wf_event = WorkflowEvent(
            application_id=app.id,
            from_stage=app.current_stage,
            to_stage=app.current_stage,
            action="RETURN_FOR_CLARIFICATION",
            reason=reason.strip(),
            actor_id=actor_id,
            actor_role=actor_role,
            is_system=False,
            created_at=utc_now()
        )
        db.add(wf_event)

        after_state = {
            "operational_status": app.operational_status,
            "current_stage": app.current_stage,
            "last_return_reason": app.last_return_reason
        }

        # Atomically record audit trail
        AuditService.record_event(
            db=db,
            actor_id=actor_id,
            actor_role=actor_role,
            action="RETURN_FOR_CLARIFICATION",
            entity_type="APPLICATION",
            entity_id=app.id,
            before=before_state,
            after=after_state,
            reason=reason.strip()
        )

        # Notify institution
        notification = Notification(
            recipient_id=app.institution_id,
            entity_type="APPLICATION",
            entity_id=app.id,
            severity=NotificationSeverity.URGENT.value,
            message=f"Application {app.application_number} returned for clarification: {reason.strip()}",
            created_at=utc_now(),
            is_simulated=True
        )
        db.add(notification)

        db.commit()
        db.refresh(app)
        return app

    @classmethod
    def resubmit_application(
        cls,
        db: Session,
        application_id: str,
        response_notes: str,
        submitted_documents: List[str],
        actor_id: str = "inst-01",
        actor_role: str = "INSTITUTION"
    ) -> Application:
        """
        Resubmits an application from RETURNED state, preserving all historical return events.
        """
        app = db.query(Application).filter(
            (Application.id == application_id) | (Application.application_number == application_id)
        ).first()

        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application '{application_id}' not found"
            )

        if app.operational_status != ApplicationStatus.RETURNED.value:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Application is in '{app.operational_status}' status and cannot be resubmitted."
            )

        before_state = {
            "operational_status": app.operational_status,
            "current_stage": app.current_stage
        }

        app.operational_status = ApplicationStatus.IN_REVIEW.value
        app.updated_at = utc_now()

        # Add resubmission event
        wf_event = WorkflowEvent(
            application_id=app.id,
            from_stage=app.current_stage,
            to_stage=app.current_stage,
            action="RESUBMITTED_BY_INSTITUTION",
            reason=f"Notes: {response_notes} | Docs: {', '.join(submitted_documents)}",
            actor_id=actor_id,
            actor_role=actor_role,
            is_system=False,
            created_at=utc_now()
        )
        db.add(wf_event)

        after_state = {
            "operational_status": app.operational_status,
            "current_stage": app.current_stage
        }

        AuditService.record_event(
            db=db,
            actor_id=actor_id,
            actor_role=actor_role,
            action="RESUBMISSION",
            entity_type="APPLICATION",
            entity_id=app.id,
            before=before_state,
            after=after_state,
            reason=f"Applicant addressed clarifications: {response_notes}"
        )

        # Notify review officer
        notification = Notification(
            recipient_id=app.assigned_user_id or "all-officers",
            entity_type="APPLICATION",
            entity_id=app.id,
            severity=NotificationSeverity.INFO.value,
            message=f"Application {app.application_number} resubmitted with updated clarification responses.",
            created_at=utc_now(),
            is_simulated=True
        )
        db.add(notification)

        db.commit()
        db.refresh(app)
        return app
