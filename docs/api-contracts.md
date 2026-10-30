# AICTE Approval Workflow Automation — API Contracts

**Problem Statement ID:** 26262  
**API Version Prefix:** `/api/v1`  
**Base URL:** `http://127.0.0.1:8000`

---

## 1. System Health
### `GET /health`
- **Purpose**: Service heartbeat and DB connectivity check.
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "version": "1.0.0",
    "service": "AICTE Approval Workflow Automation System",
    "database": "connected"
  }
  ```

---

## 2. Executive Dashboard
### `GET /api/v1/dashboard/summary`
- **Query Params**: `region` (optional, e.g. `Eastern`, `Western`, `Northern`, `Southern`, `Central`)
- **Response `200 OK`**:
  ```json
  {
    "total_applications": 7,
    "by_stage": { "SCRUTINY": 2, "EVC": 2, "SAC_SHC": 1, "FINAL_REVIEW": 1, "COMPLETED": 1 },
    "by_status": { "SUBMITTED": 1, "IN_REVIEW": 4, "RETURNED": 1, "COMPLETED": 1 },
    "overdue_count": 2,
    "upcoming_expiries": 2,
    "workload": [
      { "officer_name": "Er. Priya Sharma", "assigned_count": 2, "overdue_count": 0 }
    ],
    "ageing_distribution": {
      "less_than_7_days": 3,
      "7_to_14_days": 2,
      "15_to_30_days": 1,
      "over_30_days": 1
    }
  }
  ```

---

## 3. Applications Register & Detail
### `GET /api/v1/applications`
- **Query Params**: `page` (int, default 1), `page_size` (int, default 20), `stage`, `status`, `region`, `search`
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "application_number": "APP-2026-1001",
        "institution_name": "National Institute of Science & Technology",
        "region": "Eastern",
        "application_type": "Extension of Approval (EoA)",
        "current_stage": "SCRUTINY",
        "operational_status": "IN_REVIEW",
        "assigned_to": "Er. Priya Sharma",
        "due_date": "2026-11-05",
        "days_in_stage": 6,
        "deadline_state": "UPCOMING",
        "updated_at": "2026-10-28T10:00:00Z"
      }
    ],
    "page": 1,
    "page_size": 20,
    "total": 7
  }
  ```

### `GET /api/v1/applications/{id}`
- **Path Param**: `id` (supports UUID or `APP-2026-XXXX`)
- **Response `200 OK`**: Application full detail, route stages, documents, undertakings, and timeline.

---

## 4. Workflow Core Actions
### `POST /api/v1/applications/{id}/return`
- **Request Body**:
  ```json
  {
    "reason": "Missing Sub-Registrar registered land lease agreement stamp",
    "requested_items": ["Registered Lease Deed", "Structural Stability Certificate"]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "application_id": "APP-2026-1001",
    "status": "RETURNED",
    "message": "Application returned for clarification",
    "audit_event_created": true
  }
  ```

### `POST /api/v1/applications/{id}/resubmit`
- **Request Body**:
  ```json
  {
    "notes": "Clarification submitted with rectified land lease deed.",
    "document_ids": ["doc-uuid-1"]
  }
  ```
- **Response `200 OK`**: Returns application status to `IN_REVIEW` and records timeline entry.

### `POST /api/v1/applications/{id}/transition`
- **Request Body**:
  ```json
  {
    "action": "ADVANCE_STAGE",
    "actor_id": "user-uuid",
    "reason": "Scrutiny completed satisfactorily; progressing to EVC"
  }
  ```
- **Response `200 OK`**: Atomically updates stage and logs audit trail.

---

## 5. EVC Inspections Queue
### `GET /api/v1/evc`
- **Response `200 OK`**: List of inspection visits, assigned expert panels, visit dates, and statuses.

### `POST /api/v1/evc/{id}/schedule`
- **Request Body**:
  ```json
  {
    "scheduled_at": "2026-11-15T10:00:00Z",
    "assigned_team": "Prof. A. K. Sen, Dr. R. Iyer",
    "notes": "Physical inspection of labs and library"
  }
  ```

---

## 6. Compliance & Document Expiry
### `GET /api/v1/compliance`
- **Response `200 OK`**: List of undertakings, obligations, due dates, review statuses.

### `GET /api/v1/compliance/documents`
- **Response `200 OK`**: Register of statutory documents (leases, NOCs, safety certs) with expiry dates and alerts.

### `POST /api/v1/compliance/evidence`
- **Request Body**:
  ```json
  {
    "undertaking_id": "uuid",
    "document_filename": "Affidavit_2026.pdf",
    "comments": "Signed undertaking uploaded"
  }
  ```

---

## 7. Notifications & Immutable Audit Trail
### `GET /api/v1/notifications`
- **Query Params**: `role` (e.g. `SCRUTINY_OFFICER`, `INSTITUTION_REP`, `SUPERVISOR`)
- **Response `200 OK`**: Role-specific in-app alerts.

### `GET /api/v1/audit/{entity_id}`
- **Path Param**: `entity_id` (e.g. `ALL` or application UUID)
- **Response `200 OK`**: Append-only tamper-evident audit log with actor, action, timestamp, and before/after state diff.
