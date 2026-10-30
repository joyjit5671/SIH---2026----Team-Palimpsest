import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.seed import reset_and_seed_database
from app.schemas import ApplicationStatus, EvidenceReviewStatus

@pytest.fixture(autouse=True)
def run_around_tests():
    # Reset database to deterministic baseline before each test
    reset_and_seed_database()
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    """Verify health endpoint per TRD contract."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert data["database"] == "connected"

def test_dashboard_summary(client):
    """Verify dashboard KPI reconciliation with seeded records."""
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_applications"] >= 5
    assert "by_stage" in data
    assert "by_status" in data
    assert data["overdue_count"] >= 1
    assert data["upcoming_expiries"] >= 1
    assert len(data["workload"]) > 0

def test_list_applications_and_filtering(client):
    """Verify application list pagination and filtering."""
    # List all
    response = client.get("/api/v1/applications")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 5
    assert len(data["items"]) >= 5

    # Filter by stage SCRUTINY
    response_scrutiny = client.get("/api/v1/applications?stage=SCRUTINY")
    assert response_scrutiny.status_code == 200
    items = response_scrutiny.json()["items"]
    assert all(item["current_stage"] == "SCRUTINY" for item in items)

    # Search by number
    response_search = client.get("/api/v1/applications?search=APP-1001")
    assert response_search.status_code == 200
    assert len(response_search.json()["items"]) == 1
    assert response_search.json()["items"][0]["application_number"] == "APP-1001"

def test_application_detail(client):
    """Verify application detail retrieves full route and timeline."""
    response = client.get("/api/v1/applications/APP-1001")
    assert response.status_code == 200
    data = response.json()
    assert data["application_number"] == "APP-1001"
    assert "allowed_stages" in data
    assert "SCRUTINY" in data["allowed_stages"]
    assert len(data["timeline"]) >= 1

def test_return_and_resubmit_workflow_journey(client):
    """
    Tests the complete end-to-end Return -> Clarification -> Resubmit journey (PRD Journey 7.1).
    Validates that:
    1. Blank or short reason is rejected (400 or 422).
    2. Valid return updates status to RETURNED.
    3. Audit event is recorded.
    4. Resubmission restores state to IN_REVIEW while preserving return event.
    """
    # 1. Test validation: empty/short reason rejected
    bad_req = client.post("/api/v1/applications/APP-1001/return", json={"reason": "no"})
    assert bad_req.status_code in [400, 422]

    # 2. Return application for clarification with valid reason
    return_payload = {
        "reason": "Missing audited financial statement for FY 2025-26",
        "requested_items": ["Audited Balance Sheet", "Chartered Accountant Certificate"],
        "actor_id": "officer-01"
    }
    ret_res = client.post("/api/v1/applications/APP-1001/return", json=return_payload)
    assert ret_res.status_code == 200
    ret_data = ret_res.json()
    assert ret_data["status"] == ApplicationStatus.RETURNED.value
    assert ret_data["audit_event_created"] is True

    # Verify detail reflects returned status and reason
    detail_res = client.get("/api/v1/applications/APP-1001")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["operational_status"] == ApplicationStatus.RETURNED.value
    assert detail["last_return_reason"] == "Missing audited financial statement for FY 2025-26"

    # Verify audit trail contains the return action
    audit_res = client.get(f"/api/v1/audit/{detail['id']}")
    assert audit_res.status_code == 200
    audit_events = audit_res.json()
    assert any(ev["action"] == "RETURN_FOR_CLARIFICATION" for ev in audit_events)

    # 3. Resubmit application
    resubmit_payload = {
        "response_notes": "Uploaded signed and CA-verified balance sheets.",
        "submitted_documents": ["financial_stmt_2025_26.pdf"],
        "actor_id": "inst-01"
    }
    resub_res = client.post("/api/v1/applications/APP-1001/resubmit", json=resubmit_payload)
    assert resub_res.status_code == 200
    assert resub_res.json()["operational_status"] == ApplicationStatus.IN_REVIEW.value

    # Verify timeline preserved return and added resubmit event
    timeline_res = client.get("/api/v1/applications/APP-1001/timeline")
    assert timeline_res.status_code == 200
    actions = [ev["action"] for ev in timeline_res.json()]
    assert "RETURN_FOR_CLARIFICATION" in actions
    assert "RESUBMITTED_BY_INSTITUTION" in actions

def test_workflow_transition_and_forbidden_skip(client):
    """
    Tests stage progression and validates that invalid transitions (skipping stages) are blocked (409 Conflict).
    """
    # Attempting to skip from SCRUTINY directly to FINAL_REVIEW on a SCRUTINY_EVC route must be blocked
    invalid_skip = client.post(
        "/api/v1/applications/APP-1001/transition",
        json={"action": "JUMP_AHEAD", "to_stage": "FINAL_REVIEW"}
    )
    assert invalid_skip.status_code == 409
    assert "Cannot skip stage(s)" in invalid_skip.json()["detail"]

    # Valid progression to EVC must succeed
    valid_prog = client.post(
        "/api/v1/applications/APP-1001/transition",
        json={"action": "SCRUTINY_APPROVED", "to_stage": "EVC", "reason": "Scrutiny committee verified all docs"}
    )
    assert valid_prog.status_code == 200
    assert valid_prog.json()["current_stage"] == "EVC"

def test_evc_queue_and_scheduling(client):
    """Verify EVC queue read and visit scheduling interaction."""
    response = client.get("/api/v1/evc")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 2

    pending_item = next((item for item in items if item["status"] == "PENDING"), None)
    assert pending_item is not None

    # Schedule visit
    schedule_payload = {
        "scheduled_at": "2026-11-05T10:00:00Z",
        "assigned_team": "Inspection Committee Beta",
        "lead_expert": "Prof. R. C. Mathur",
        "notes": "Verify civil lab and computer network infrastructure."
    }
    sched_res = client.post(f"/api/v1/evc/{pending_item['id']}/schedule", json=schedule_payload)
    assert sched_res.status_code == 200
    assert sched_res.json()["status"] == "SCHEDULED"
    assert sched_res.json()["assigned_team"] == "Inspection Committee Beta"

def test_compliance_and_evidence_review(client):
    """Verify compliance undertakings, document expiries, and verification review."""
    response = client.get("/api/v1/compliance")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 5

    # Check that both undertakings and documents are present
    types = {item["item_type"] for item in items}
    assert "UNDERTAKING" in types
    assert "DOCUMENT" in types

    # Find submitted undertaking to review
    submitted_u = next((item for item in items if item["item_type"] == "UNDERTAKING" and item["status"] == "SUBMITTED"), None)
    assert submitted_u is not None

    review_payload = {
        "status": "VERIFIED",
        "reason": "Salary bank statements verified with SBI portal",
        "actor_id": "comp-rev-01"
    }
    rev_res = client.post(f"/api/v1/compliance/undertakings/{submitted_u['id']}/review", json=review_payload)
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "VERIFIED"

def test_notifications_and_read_state(client):
    """Verify notification inbox and read update."""
    response = client.get("/api/v1/notifications")
    assert response.status_code == 200
    notifs = response.json()
    assert len(notifs) >= 3

    first_notif = notifs[0]
    read_res = client.post(f"/api/v1/notifications/{first_notif['id']}/read")
    assert read_res.status_code == 200
    assert read_res.json()["read_at"] is not None
