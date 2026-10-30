import json
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import (
    Institution, WorkflowRoute, User, Application, WorkflowEvent,
    EVCEvent, Undertaking, Document, Notification, AuditEvent, utc_now
)
from app.schemas import ApplicationStatus, EVCStatus, EvidenceReviewStatus, NotificationSeverity

def reset_and_seed_database():
    """
    Resets the database by dropping/recreating tables and reseeding
    a deterministic, coherent synthetic dataset.
    """
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database(force=True)

def seed_database(force: bool = False):
    """
    Initializes tables and seeds a coherent synthetic dataset for the P0 prototype.
    Fully consistent across application records, timelines, dashboard counts, and alerts.
    """
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded unless forced
        if not force and db.query(Application).first():
            return

        # Clear existing records if force is True
        if force:
            for tbl in reversed(Base.metadata.sorted_tables):
                db.execute(tbl.delete())
            db.commit()

        now = utc_now()
        today = now.date()

        # 1. Institutions
        inst1 = Institution(
            id=str(uuid.uuid4()),
            name="Apex Institute of Technology",
            institution_code="AICTE-NR-101",
            region="Northern Region"
        )
        inst2 = Institution(
            id=str(uuid.uuid4()),
            name="National College of Engineering & Research",
            institution_code="AICTE-ER-202",
            region="Eastern Region"
        )
        inst3 = Institution(
            id=str(uuid.uuid4()),
            name="Vanguard Academy of Technical Studies",
            institution_code="AICTE-SW-303",
            region="South-Western Region"
        )
        inst4 = Institution(
            id=str(uuid.uuid4()),
            name="Horizon Institute of Pharmaceutical Sciences",
            institution_code="AICTE-WR-404",
            region="Western Region"
        )
        inst5 = Institution(
            id=str(uuid.uuid4()),
            name="Southern Institute of Architecture & Planning",
            institution_code="AICTE-SR-505",
            region="Southern Region"
        )

        db.add_all([inst1, inst2, inst3, inst4, inst5])
        db.flush()

        # 2. Users & Roles
        users = [
            User(id="officer-01", display_name="Officer Rajesh Sharma", role="PROCESSING_OFFICER", region_scope="Northern Region"),
            User(id="officer-02", display_name="Officer Sunita Verma", role="PROCESSING_OFFICER", region_scope="South-Western Region"),
            User(id="evc-coord-01", display_name="Dr. Ramesh Nair", role="EVC_COORDINATOR", region_scope="ALL"),
            User(id="sac-reviewer-01", display_name="Prof. K. Venkatesh", role="SAC_SHC_REVIEWER", region_scope="ALL"),
            User(id="supervisor-01", display_name="Director Anita Sen", role="SUPERVISOR", region_scope="ALL"),
            User(id="comp-rev-01", display_name="S. Ghosh", role="COMPLIANCE_REVIEWER", region_scope="ALL"),
            User(id="admin-01", display_name="System Administrator", role="ADMIN", region_scope="ALL")
        ]
        db.add_all(users)

        # 3. Workflow Routes
        routes = [
            WorkflowRoute(
                route_code="SCRUTINY_EVC",
                version="1.0",
                stages_json=json.dumps(["SCRUTINY", "EVC", "SAC_SHC", "FINAL_REVIEW"])
            ),
            WorkflowRoute(
                route_code="ONLY_SCRUTINY",
                version="1.0",
                stages_json=json.dumps(["SCRUTINY", "FINAL_REVIEW"])
            ),
            WorkflowRoute(
                route_code="EVC_SAC_SHC",
                version="1.0",
                stages_json=json.dumps(["EVC", "SAC_SHC", "FINAL_REVIEW"])
            ),
            WorkflowRoute(
                route_code="ONLY_EVC",
                version="1.0",
                stages_json=json.dumps(["EVC", "FINAL_REVIEW"])
            )
        ]
        db.add_all(routes)
        db.flush()

        # 4. Applications
        # APP-1001: Active in Scrutiny, ready for transition or return demo
        app1 = Application(
            id=str(uuid.uuid4()),
            application_number="APP-1001",
            institution_id=inst1.id,
            region="Northern Region",
            application_type="Extension of Approval (EoA)",
            route_code="SCRUTINY_EVC",
            current_stage="SCRUTINY",
            operational_status=ApplicationStatus.IN_REVIEW.value,
            assigned_user_id="officer-01",
            due_date=today + timedelta(days=5),
            submitted_at=now - timedelta(days=8),
            updated_at=now - timedelta(days=2)
        )

        # APP-1002: Returned for clarification, demonstrating resubmission flow
        app2 = Application(
            id=str(uuid.uuid4()),
            application_number="APP-1002",
            institution_id=inst2.id,
            region="Eastern Region",
            application_type="Increase in Intake",
            route_code="SCRUTINY_EVC",
            current_stage="SCRUTINY",
            operational_status=ApplicationStatus.RETURNED.value,
            assigned_user_id="officer-01",
            due_date=today + timedelta(days=3),
            last_return_reason="Required land lease deed registration stamp is illegible on submitted scan.",
            requested_clarifications_json=json.dumps(["Registered land lease deed (Pages 1-12) high-res scan", "Sub-registrar seal verification"]),
            submitted_at=now - timedelta(days=14),
            updated_at=now - timedelta(days=1)
        )

        # APP-1003: In EVC stage, overdue (SLA breach demo)
        app3 = Application(
            id=str(uuid.uuid4()),
            application_number="APP-1003",
            institution_id=inst3.id,
            region="South-Western Region",
            application_type="New Institution Approval",
            route_code="SCRUTINY_EVC",
            current_stage="EVC",
            operational_status=ApplicationStatus.IN_REVIEW.value,
            assigned_user_id="officer-02",
            due_date=today - timedelta(days=2),  # OVERDUE
            submitted_at=now - timedelta(days=25),
            updated_at=now - timedelta(days=3)
        )

        # APP-1004: In Final Review, due soon
        app4 = Application(
            id=str(uuid.uuid4()),
            application_number="APP-1004",
            institution_id=inst4.id,
            region="Western Region",
            application_type="Introduction of New Course",
            route_code="ONLY_SCRUTINY",
            current_stage="FINAL_REVIEW",
            operational_status=ApplicationStatus.IN_REVIEW.value,
            assigned_user_id="officer-02",
            due_date=today + timedelta(days=1),
            submitted_at=now - timedelta(days=18),
            updated_at=now - timedelta(days=1)
        )

        # APP-1005: Completed
        app5 = Application(
            id=str(uuid.uuid4()),
            application_number="APP-1005",
            institution_id=inst5.id,
            region="Southern Region",
            application_type="Extension of Approval (EoA)",
            route_code="SCRUTINY_EVC",
            current_stage="FINAL_REVIEW",
            operational_status=ApplicationStatus.COMPLETED.value,
            assigned_user_id="officer-01",
            due_date=today - timedelta(days=10),
            submitted_at=now - timedelta(days=35),
            updated_at=now - timedelta(days=5)
        )

        db.add_all([app1, app2, app3, app4, app5])
        db.flush()

        # 5. Timeline Events
        ev1_1 = WorkflowEvent(
            application_id=app1.id,
            from_stage=None,
            to_stage="SCRUTINY",
            action="APPLICATION_SUBMITTED",
            reason="Submitted by Apex Institute of Technology with requisite fees",
            actor_id="inst-01",
            actor_role="INSTITUTION",
            created_at=now - timedelta(days=8)
        )
        ev1_2 = WorkflowEvent(
            application_id=app1.id,
            from_stage="SCRUTINY",
            to_stage="SCRUTINY",
            action="ASSIGNED_TO_OFFICER",
            reason="Workload distribution assigned to Officer Rajesh Sharma",
            actor_id="supervisor-01",
            actor_role="SUPERVISOR",
            created_at=now - timedelta(days=7)
        )

        ev2_1 = WorkflowEvent(
            application_id=app2.id,
            from_stage=None,
            to_stage="SCRUTINY",
            action="APPLICATION_SUBMITTED",
            reason="Application submitted for Increase in Intake",
            actor_id="inst-02",
            actor_role="INSTITUTION",
            created_at=now - timedelta(days=14)
        )
        ev2_2 = WorkflowEvent(
            application_id=app2.id,
            from_stage="SCRUTINY",
            to_stage="SCRUTINY",
            action="RETURN_FOR_CLARIFICATION",
            reason="Required land lease deed registration stamp is illegible on submitted scan.",
            actor_id="officer-01",
            actor_role="PROCESSING_OFFICER",
            created_at=now - timedelta(days=1)
        )

        ev3_1 = WorkflowEvent(
            application_id=app3.id,
            from_stage=None,
            to_stage="SCRUTINY",
            action="APPLICATION_SUBMITTED",
            reason="Initial application for New Technical Institute",
            actor_id="inst-03",
            actor_role="INSTITUTION",
            created_at=now - timedelta(days=25)
        )
        ev3_2 = WorkflowEvent(
            application_id=app3.id,
            from_stage="SCRUTINY",
            to_stage="EVC",
            action="SCRUTINY_CLEARED",
            reason="Scrutiny cleared by committee; physical inspection mandated",
            actor_id="officer-02",
            actor_role="PROCESSING_OFFICER",
            created_at=now - timedelta(days=10)
        )

        db.add_all([ev1_1, ev1_2, ev2_1, ev2_2, ev3_1, ev3_2])

        # 6. EVC Events
        evc1 = EVCEvent(
            application_id=app3.id,
            status=EVCStatus.PENDING.value,
            due_at=now + timedelta(days=3),
            assigned_team="Committee Team Alpha",
            lead_expert="Prof. D. Sen",
            notes="Physical inspection of laboratories, workshops, and faculty verification.",
            created_at=now - timedelta(days=9)
        )
        evc2 = EVCEvent(
            application_id=app1.id,
            status=EVCStatus.SCHEDULED.value,
            scheduled_at=now + timedelta(days=2),
            due_at=now + timedelta(days=6),
            assigned_team="Committee Team Delta",
            lead_expert="Dr. Ramesh Nair",
            notes="Scheduled surprise inspection as per APH guidelines.",
            created_at=now - timedelta(days=2)
        )
        db.add_all([evc1, evc2])

        # 7. Undertakings & Compliance
        u1 = Undertaking(
            application_id=app1.id,
            institution_id=inst1.id,
            title="Faculty Salary via 7th CPC Nationalized Bank Undertaking",
            due_date=today + timedelta(days=15),
            status=EvidenceReviewStatus.SUBMITTED.value,
            submitted_at=now - timedelta(days=1)
        )
        u2 = Undertaking(
            application_id=app3.id,
            institution_id=inst3.id,
            title="State Fire Safety Department NOC Compliance",
            due_date=today - timedelta(days=4),
            status=EvidenceReviewStatus.PENDING.value
        )
        u3 = Undertaking(
            application_id=app2.id,
            institution_id=inst2.id,
            title="Barrier-free Environment & Disabled Access Compliance",
            due_date=today + timedelta(days=20),
            status=EvidenceReviewStatus.VERIFIED.value,
            submitted_at=now - timedelta(days=10),
            verified_by="comp-rev-01",
            verified_at=now - timedelta(days=2)
        )
        db.add_all([u1, u2, u3])

        # 8. Documents & Validity Expiry Tracking
        doc1 = Document(
            application_id=app1.id,
            institution_id=inst1.id,
            document_type="Campus Land Lease Agreement (30-year deed)",
            storage_key="docs/sec_lease_app1001.pdf",
            valid_from=today - timedelta(days=360),
            expires_on=today + timedelta(days=12),
            review_status="APPROACHING_EXPIRY"
        )
        doc2 = Document(
            application_id=app2.id,
            institution_id=inst2.id,
            document_type="Structural Stability Certificate",
            storage_key="docs/sec_stability_app1002.pdf",
            valid_from=today - timedelta(days=400),
            expires_on=today - timedelta(days=8),
            review_status="EXPIRED"
        )
        doc3 = Document(
            application_id=app4.id,
            institution_id=inst4.id,
            document_type="Municipal Building Occupancy Certificate",
            storage_key="docs/sec_occupancy_app1004.pdf",
            valid_from=today - timedelta(days=50),
            expires_on=today + timedelta(days=315),
            review_status="VALID"
        )
        db.add_all([doc1, doc2, doc3])
        db.flush()

        # 9. Notifications
        n1 = Notification(
            recipient_id="all-officers",
            entity_type="APPLICATION",
            entity_id=app3.id,
            severity=NotificationSeverity.URGENT.value,
            message="Application APP-1003 has breached EVC scheduling SLA deadline.",
            due_at=now - timedelta(days=2),
            is_simulated=True,
            created_at=now - timedelta(days=2)
        )
        n2 = Notification(
            recipient_id=inst2.id,
            entity_type="APPLICATION",
            entity_id=app2.id,
            severity=NotificationSeverity.CRITICAL.value,
            message="Application APP-1002 returned for clarification: illegible lease deed scan.",
            is_simulated=True,
            created_at=now - timedelta(days=1)
        )
        n3 = Notification(
            recipient_id=inst1.id,
            entity_type="DOCUMENT",
            entity_id=doc1.id,
            severity=NotificationSeverity.WARNING.value,
            message="Document 'Campus Land Lease Agreement' expires in 12 days. Submit renewal.",
            due_at=now + timedelta(days=12),
            is_simulated=True,
            created_at=now - timedelta(hours=6)
        )
        db.add_all([n1, n2, n3])

        # 10. Audit Events
        aud1 = AuditEvent(
            actor_id="officer-01",
            actor_role="PROCESSING_OFFICER",
            action="RETURN_FOR_CLARIFICATION",
            entity_type="APPLICATION",
            entity_id=app2.id,
            reason="Required land lease deed registration stamp is illegible on submitted scan.",
            created_at=now - timedelta(days=1)
        )
        aud2 = AuditEvent(
            actor_id="officer-02",
            actor_role="PROCESSING_OFFICER",
            action="STAGE_TRANSITION",
            entity_type="APPLICATION",
            entity_id=app3.id,
            reason="Scrutiny cleared; progressed to EVC stage",
            created_at=now - timedelta(days=10)
        )
        db.add_all([aud1, aud2])

        db.commit()
    finally:
        db.close()
