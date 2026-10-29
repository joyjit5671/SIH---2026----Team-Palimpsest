# Engineering Principles & Craft — AICTE Approval Workflow Automation System

**Problem Statement:** AICTE 26262 — Integrated Approval Workflow Automation,
Compliance Monitoring and Alert Management System

**Who this applies to:** any AI agent working on this project — Claude Code,
Antigravity, Codex, or anything else. Subagents executing commands here
should treat this as standing guidance.

---

## Start here: the document map (read in this order)

1. `AGENTS.md` — this file. Standing rules for all coding agents.
2. `context.md` — current project state and decisions.
3. Latest block of `progress.md` — what the last session did.
4. `ENGINEERING_PRINCIPLES_TEMPLATE.md` — how to work (template origin).
5. `SECURITY_AUDIT_PLAYBOOK.md` — only when running or reviewing an audit.

Reference documents (PDFs in project root):
- `PRD.pdf` — Product Requirements Document (feature specs, user stories, acceptance criteria)
- `TRD.pdf` — Technical Requirements Document (architecture, API contracts, data model, build sequence)
- `PROJECT OVERVIEW.pdf` — Problem statement analysis and background

If any of these is missing or a pointer is stale, fixing the doc is
in-scope work — a wrong map is worse than no map.

---

## The one habit that matters most: verify before you act

Most bad outcomes come from acting on a belief instead of a fact. Before
you restart a service, delete a file, or "fix" a bug, ask: *have I actually
observed the thing I'm about to respond to?*

- When you think a file says X, read it. When you think a permission is
  granted, query the live system. When you think a PR is unmerged, check
  the remote — not your local clone, which may be stale or authenticated
  as the wrong account.
- The repo is a *claim*. The running system is the *truth*. Where they
  disagree — and they will — the live system wins, and the disagreement
  is itself a finding.

---

## Project identity

- **Organisation:** All India Council for Technical Education (AICTE), Regulation Bureau
- **Category:** Software — Smart Automation
- **Team:** 4 people — 2 frontend devs, 1 backend dev (Python), 1 integration dev
- **Delivery phases:** P0 (submission prototype) → P1 (functional MVP) → P2 (production)
- **Current target:** P0 — polished demo with synthetic data and simulated interactions

---

## Stack & architecture

- **Frontend:** Next.js + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend API:** Python 3.13 + FastAPI + Pydantic + Uvicorn
- **Database:** Supabase-hosted PostgreSQL
- **DB access:** SQLAlchemy + Psycopg (single access path — do NOT mix with the Supabase Python client)
- **Tests:** Pytest + FastAPI TestClient + httpx
- **Source control:** GitHub

### Architecture flow

```
Browser / Next.js → FastAPI routes → service layer → SQLAlchemy → Supabase PostgreSQL
```

- Frontend sends HTTP to FastAPI base URL; it **never** connects directly to PostgreSQL.
- API router validates inputs and calls a service function.
- Service functions enforce transitions, role/scope rules, and audit requirements.
- Database transactions write the business change and audit event together atomically.
- A notification is a record/event; email/SMS delivery is a separate integration (not in P0).

### Backend layers (keep separated)

| Layer | Responsibilities | Keep out |
|---|---|---|
| `api/` | HTTP routes, dependency injection, request/response schemas, status codes | Complex SQL or workflow decisions |
| `services/` | Transition rules, assignment checks, deadlines, audit creation, orchestration | HTTP-specific details |
| `models.py` | Tables, relationships, constraints, indexes | UI presentation logic |
| `schemas.py` | Pydantic input/output models and enums | Database session management |
| `database.py` | Engine/session config and transaction/session dependencies | Business rules |

### What NOT to introduce for P0

Do not add Redis, Celery, Kubernetes, microservices, a separate analytics
database, or an AI/LLM service unless a demonstrated requirement forces the
choice.

---

## Conventions

- **API prefix:** `/api/v1`
- **Identifiers:** UUIDs internally; separate human-friendly `application_number`
- **Naming:** `snake_case` in Python/JSON
- **Dates:** Store timestamps in UTC; render local time in UI. Use `DATE` type for expiry/deadline fields where time-of-day is irrelevant.
- **Errors:** Consistent HTTP status codes and JSON error bodies. No stack traces or secrets returned to browser.
  - 400 → malformed input
  - 401 → unauthenticated
  - 403 → insufficient permissions
  - 404 → inaccessible/not-found
  - 409 → invalid state transition
  - 422 → schema validation (FastAPI default)
- **Config:** Environment variables via `.env` locally. Commit `.env.example` only. **Never commit secrets.**
- **Public env vars:** Only `NEXT_PUBLIC_*` may reach client code.
- **Validation:** Pydantic for request shape → service layer for business rules → database constraints for invariants.

---

## Data model (core entities)

| Entity | Key fields | Notes |
|---|---|---|
| `applications` | id, application_number, institution_id, region, application_type, current_stage, operational_status, assigned_user_id, submitted_at, updated_at | Main record; cache current status for fast queries |
| `institutions` | id, name, institution_code, region | Synthetic institution records for demo |
| `workflow_routes` | id, route_code, version, active, definition_json | Configured stage sequence; validate against APH |
| `workflow_events` | id, application_id, from_stage, to_stage, action, reason, actor_id, created_at | Timeline and transition evidence |
| `assignments` | id, entity_type, entity_id, assignee_id, assigned_by, created_at | Assignment history |
| `evc_events` | id, application_id, status, scheduled_at, completed_at, assigned_team, notes | Scheduling/completion tracking |
| `undertakings` | id, application_id, title, due_date, status, submitted_at, verified_by, verified_at | Time-bound commitment and verification |
| `documents` | id, application_id, document_type, storage_key, valid_from, expires_on, review_status | Private storage key — never public file URL |
| `notifications` | id, recipient_id, entity_type, entity_id, severity, message, due_at, read_at, created_at | In-app notification record |
| `audit_events` | id, actor_id, action, entity_type, entity_id, before_json, after_json, reason, created_at | Append-only audit trail |
| `users / roles` | id, display_name, role, region_scope, active | For real auth, map to verified identity |

### Key enums (proposed internal names — NOT official AICTE labels)

- **Operational status:** DRAFT, SUBMITTED, IN_REVIEW, RETURNED, COMPLETED
- **Workflow stage:** SCRUTINY, EVC, SAC_SHC, FINAL_REVIEW
- **EVC status:** PENDING, SCHEDULED, COMPLETED, FOLLOW_UP
- **Evidence review status:** PENDING, SUBMITTED, UNDER_REVIEW, VERIFIED, CLARIFICATION_REQUIRED
- **Notification severity:** INFO, WARNING, URGENT, CRITICAL

---

## P0 API contracts (minimum)

| Method + path | Purpose |
|---|---|
| `GET /dashboard/summary` | KPI counts, stage distribution, ageing and workload aggregates |
| `GET /applications` | Paginated/filterable application list |
| `GET /applications/{id}` | Application detail, current stage and summary fields |
| `GET /applications/{id}/timeline` | Workflow/audit timeline |
| `POST /applications/{id}/return` | Return for clarification with mandatory reason and requested items |
| `POST /applications/{id}/transition` | Attempt a configured, authorised stage transition |
| `GET /evc` | EVC queue, status and due/scheduled dates |
| `GET /compliance` | Undertakings, evidence status and upcoming expiries |
| `GET /notifications` | Recipient-specific alerts |
| `GET /audit/{entity_id}` | Audit events for an entity |
| `GET /health` | Basic service health; no secrets |

---

## Workflow engine rules

The frontend requests an action; the **backend decides** whether it is
permitted. The UI must never decide the final status by itself.

1. Load application and route configuration.
2. Confirm actor and scope are authorised.
3. Validate current state, requested action, prerequisites and destination.
4. Validate mandatory reason/evidence for return/revert actions.
5. In one transaction: update current state, insert workflow event, insert audit event.
6. Commit and return the canonical updated record.

### Hard rules

- A route is configured per application type — do NOT assume one universal linear path.
- A transition cannot skip a required stage or prerequisite.
- Return/revert requires a reason, records who initiated it and when.
- Resubmission preserves prior history — never erase the return event.
- Human approvals, committee outcomes, inspections remain explicit authorised actions.
- Invalid transitions return 409 conflict and create no partial state change.
- **The system must NEVER autonomously approve/reject an application, replace an inspection, or conclude evidence satisfies a statutory obligation without human verification.**

---

## The non-negotiable security spine

- Protected actions are authorised on the server. UI visibility is NOT security.
- Users access only records within their approved scope.
- Document storage uses private storage keys — never public URLs.
- Credentials and secrets never appear in the interface or source repository.
- Critical actions record actor identity, timestamp, target record and outcome.
- Ordinary users cannot edit or erase audit history through normal APIs.
- Audit events are append-only.
- Any future AI assistance is clearly identified and cannot finalize statutory decisions.

### Highest-stakes surfaces

**Workflow transitions and audit trail** — a bug here means applications
could bypass required scrutiny stages, skip EVC inspections, or lose
accountability history. Non-negotiables:
- Every transition must validate prerequisites server-side
- Every state change must create an audit event atomically
- No partial state updates on failure
- Return reasons are mandatory and immutable once recorded

---

## Deliberate decisions — don't re-suggest or "helpfully" undo

- **No microservices** — one FastAPI service with clear modules. This is deliberate for a 4-person hackathon team.
- **No Redis/Celery for P0** — simple scheduled jobs or manual demo-triggered alert generation is sufficient.
- **SQLAlchemy as single DB path** — do not mix with Supabase Python client.
- **Synthetic data only for P0** — no live AICTE integration assumed.
- **Role switching in P0 is demo-only** — clearly label it, never represent as production auth.
- **Simulated notifications in P0** — label them as simulated. No real email/SMS delivery.

---

## How to debug well

1. **Reproduce and localise before theorising.** Get the actual error text, the actual failing input, the actual log line.
2. **Binary-search the problem space.** Halve the suspect surface each step.
3. **Change one thing at a time.**
4. **Read the error literally.** "Permission denied" is auth, not logic; "not found" is access, not existence.
5. **Trust the type checker / linter.** Run cheapest checks first:
   - Backend: `mypy` / `python -m pytest`
   - Frontend: `npx tsc --noEmit`
6. **Prefer the smallest correct fix.** Match surrounding code idiom. Don't leave comments that narrate the diff.

---

## Environment bootstrap

- **Repo**: To be set up on GitHub.
- **Backend setup:**
  ```
  python -m venv .venv
  .venv\Scripts\Activate.ps1          # Windows PowerShell
  pip install fastapi uvicorn sqlalchemy "psycopg[binary]" pydantic-settings pytest httpx
  uvicorn app.main:app --reload
  ```
- **Frontend setup:**
  ```
  NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
  # Standard Next.js dev command
  # API docs: http://127.0.0.1:8000/docs
  ```
- **Env vars:** `backend/.env` locally with `DATABASE_URL` and required settings. Keep out of Git.
- **Baseline check:** Run type check / test command before touching anything.

---

## Testing reality

- **Backend:** Pytest + FastAPI TestClient. Critical test areas:
  - Schema/unit: missing/blank return reason rejected, unknown enum rejected, dates parse correctly
  - Workflow service: valid transition succeeds, forbidden transition returns 409, missing prerequisite blocks progression
  - Audit/transaction: successful mutation creates event, failed mutation creates no partial state
  - Permissions: unauthorised role cannot transition, assign, review, or read restricted records
  - Deadline logic: upcoming/overdue boundaries correct, repeated scan doesn't duplicate alerts
- **Frontend:** Loading, empty, error, success, and validation states. Failed POST must not optimistically show false success.
- **Demo regression:** Seed reset works; known demo application follows intended route; refresh doesn't break P0 narrative.

---

## Git & workflow discipline

- **Never commit or push to `main`.** Branch first: `feature/…`, `fix/…`, `chore/…`.
- Push only when the user asks. Leave the tree dirty for their review.
- Don't auto-commit session-hygiene files (`context.md`, `progress.md`) into feature branches.
- Merging PRs is the user's job. You open them; they merge.
- Rebasing a stale branch onto updated main after merges is normal — do it, re-run baseline check, then push.

---

## Suggested repository structure

```
project-root/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/api-client.ts
│   └── types/api.ts
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── settings.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── api/
│   │   │   ├── applications.py
│   │   │   ├── dashboard.py
│   │   │   ├── evc.py
│   │   │   ├── compliance.py
│   │   │   ├── notifications.py
│   │   │   └── audit.py
│   │   └── services/
│   │       ├── workflow.py
│   │       ├── audit.py
│   │       └── deadlines.py
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
├── docs/
│   └── api-contracts.md
├── AGENTS.md
├── context.md
├── progress.md
└── README.md
```

---

## Build sequence for P0 (backend-first, unblock integration)

1. **Service skeleton:** FastAPI app, health endpoint, CORS, settings, consistent error shape.
2. **Unblock integration:** `GET /applications` and `GET /applications/{id}` with stable Pydantic schemas and seed data.
3. **Workflow core:** Allowed-transition checks, return reason validation, timeline events, audit service.
4. **Dashboard/queues:** Summary, EVC and compliance read endpoints.
5. **Persistence:** PostgreSQL models, migrations, transaction boundaries, seed script.
6. **Hardening:** Permissions, notification persistence, deadline scanning, automated tests.

Frontend build order: shared layout → dashboard → application register → application detail → return/resubmission → EVC queue → compliance/evidence → document expiry → notifications → polish.

---

## Working autonomously without a human watching

- Do reversible, in-scope work without asking. Stop for destructive or outward-facing actions (deleting data, deploying, sending mail, publishing) unless clearly authorised.
- Don't end a turn on a promise ("I'll now…"). Do the thing, then report.
- Report faithfully: if a check failed, say so with the output; if you skipped a step, say why; if something is unverified, label it.
- Delegate breadth to parallel subagents; keep judgment and consolidation for yourself. Subagents start cold — give them context.

### Security emergency protocol

If you discover a **live, actively exploitable, critical** issue mid-session:
stop other work, prepare the fix on a branch immediately, and put it at the
TOP of your report labelled CRITICAL — but do **not** deploy or merge it
yourself. One exception: revoking a confirmed-leaked credential is
containment — do it, then report prominently.

---

## Demo honesty rules (P0 specific)

- Use synthetic institutions, applications, officers, obligations, and documents.
- Label role switching as demo-only convenience.
- Label simulated notifications as simulated.
- Do not present invented data as official AICTE records.
- Do not claim a real integration or official decision has occurred when it has not.
- Ensure visible metrics and records agree with the synthetic dataset.
- Prioritize complete journeys over numerous unfinished screens.

---

## A parting note

Be honest over being impressive. Every shortcut in security is a debt
someone else pays. When unsure, dig one level deeper than feels necessary —
that extra query, that second read, is where the real findings live. Leave
the codebase, and these notes, a little clearer than you found them.
