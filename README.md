# ApprovalFlow AI — Smart India Hackathon 2026

**AICTE Approval Workflow Automation, Compliance Monitoring, and SLA Escalation System**  
**Problem Statement ID:** 26262 | **Theme:** Smart Automation | **Category:** Software  
**Organisation:** All India Council for Technical Education (AICTE), Regulation Bureau  

---

## 🏛️ Executive Summary

**ApprovalFlow AI** is a role-specific workflow coordination and compliance monitoring platform built for AICTE and technical institutions across India. It automates routine administrative routing, tracks time-bound undertakings, monitors document and lease validity windows, and triggers automated SLA pendency escalations—while strictly preserving **statutory human authority** for all statutory scrutiny, inspections, and final decisions.

---

## 🌟 Key Capabilities & Feature Mapping (PRD / TRD Compliant)

| Module | PRD Feature | Functionality & Backend Implementation |
| :--- | :--- | :--- |
| **Operational Dashboard** | `FEAT-01`, `FEAT-08`, `FEAT-09` | Real-time KPI metrics, stage distribution bars, regional workload breakdown, and SLA ageing buckets (`<7d`, `7-14d`, `15-30d`, `>30d`). |
| **Applications Register** | `FEAT-02`, `FEAT-03` | Searchable and filterable dossier register with stage indicators, status badges, and comprehensive dossier detail modal. |
| **Workflow Engine** | `FEAT-04`, `FEAT-05` | Configurable sequential routes (`SCRUTINY_ONLY`, `SCRUTINY_EVC`, `EVC_SAC_SHC`) with automated validation preventing illegal stage skipping. |
| **Deficiency & Return** | `FEAT-06` | Authorized return for clarification requiring mandatory deficiency reasons and requested items checklist; preserves complete historical timeline. |
| **Institution Resubmission** | `FEAT-06` | Institution representative provides clarification explanation and updated document attachments; seamlessly returns dossier to `IN_REVIEW`. |
| **EVC Queue & Scheduling** | `FEAT-10`, `FEAT-11` | Queue for Expert Visit Committee inspections, interactive date picker, expert panel assignment, and findings report submission. |
| **Continuing Compliance** | `FEAT-12`, `FEAT-13` | Institutional undertakings tracker with due dates, evidence upload, and officer verification sign-off. |
| **Document Expiry Vault** | `FEAT-15`, `FEAT-16` | Lifecycle monitoring for Land Leases, Building Plan NOCs, and Safety Certificates with `<30-day` warnings and renewal verification. |
| **SLA Watchdog Engine** | `FEAT-14`, `FEAT-18` | Independent scanning service that detects overdue tasks and triggers automated notifications and critical escalations. |
| **Digital Audit Trail** | `FEAT-19` | Immutable, append-only chronological log recording actor name, role, timestamp, action type, and before/after state diffs. |

---

## 🧱 Technology Architecture

```
ApprovalFlowAI/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py           # Application entrypoint & CORS
│   │   ├── settings.py       # Pydantic configuration settings
│   │   ├── database.py       # SQLAlchemy engine & session factory
│   │   ├── models.py         # Relational database entities
│   │   ├── schemas.py        # Pydantic request/response validation
│   │   ├── seed_data.py      # SIH 2026 realistic baseline demo dataset
│   │   ├── api/              # Versioned API endpoints (/api/v1)
│   │   │   ├── applications.py
│   │   │   ├── dashboard.py
│   │   │   ├── evc.py
│   │   │   ├── compliance.py
│   │   │   ├── notifications.py
│   │   │   └── audit.py
│   │   └── services/         # Core business logic
│   │       ├── workflow.py   # State machine & transition rules
│   │       ├── audit.py      # Transactional audit event logger
│   │       └── deadlines.py  # SLA watchdog & deadline scanner
│   ├── tests/
│   │   └── test_api.py       # Pytest automated test suite
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # Next.js 14 + TypeScript Frontend
│   ├── app/                  # App Router (page.tsx, layout.tsx, globals.css)
│   ├── lib/api-client.ts     # Typed centralized API client
│   ├── types/api.ts          # Shared TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── standalone-app/           # Zero-Dependency Standalone Full-Stack App
│   └── index.html            # Ultra-polished single-file app for instant offline evaluation
└── docs/
    └── api-contracts.md      # Complete OpenAPI endpoint documentation
```

---

## 🚀 Quickstart & Run Instructions

### Option 1: Instant Standalone Evaluation (Zero Dependencies)
You can test and demonstrate the complete application immediately without needing Node.js or Python installed:
1. Navigate to `ApprovalFlowAI/standalone-app/`
2. Double-click `index.html` to open it in Google Chrome, Microsoft Edge, or any modern web browser.
3. The application will launch with full client-side simulated REST state, interactive role switcher, workflow transitions, EVC scheduling, compliance evidence upload, document renewal, SLA watchdog scanner, and audit logging!

---

### Option 2: Running the FastAPI Backend & Next.js Frontend

#### A. Backend Setup
```powershell
cd ApprovalFlowAI/backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1   # On Windows
# source .venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- Service Health Endpoint: `http://127.0.0.1:8000/api/v1/health`

#### B. Running Backend Tests
```powershell
cd ApprovalFlowAI/backend
pytest tests/test_api.py -v
```

#### C. Frontend Setup
```powershell
cd ApprovalFlowAI/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
- Frontend Web Portal: `http://localhost:3000`

---

## 🎯 Evaluator Walkthrough: 10-Step Demonstration Guide

Follow this sequence to evaluate the complete SIH 2026 solution:

1. **Dashboard Overview:** View national KPI counters, Application Stage Distribution, Regional Workload, and SLA Pendency Ageing Breakdown (`<7d`, `7-14d`, `15-30d`, `>30d`).
2. **Switch Persona (Role Switcher):** In the top bar, switch between *Scrutiny Officer*, *Institution Representative*, *EVC Coordinator*, and *Bureau Officer*.
3. **Inspect Application Dossier:** Click **Applications** tab, search for `APP-2026-1001`, and click **Open Dossier** to inspect metadata, uploaded documents, and visual step progression.
4. **Return for Clarification:** As *Scrutiny Officer*, click **Return for Clarification**, enter observation reason and required items, and confirm. The application status changes to `RETURNED`.
5. **Institution Resubmission:** Switch demo role to *Institution Rep*, open the dossier, see the deficiency warning banner, click **Resubmit Clarification**, enter corrective notes, and submit. The dossier moves back to `IN_REVIEW`.
6. **Pass Scrutiny & Route to EVC:** As *Scrutiny Officer*, click **Pass Scrutiny → Route to EVC**. The application automatically moves to the `EVC` stage.
7. **EVC Queue & Scheduling:** Switch role to *EVC Coordinator*, navigate to the **EVC Queue**, click **Schedule Inspection Visit**, and assign the expert committee panel.
8. **Compliance Evidence Verification:** Navigate to **Compliance Tracker**, locate the undertaking, upload evidence as *Institution Rep*, then switch to *Scrutiny Officer* and click **Verify & Close**.
9. **Document Expiry Lifecycle:** Open **Document Expiry**, observe the Land Lease expiring in `<18 days`, click **Upload Renewal**, and verify the updated lease.
10. **Statutory Decision & Audit Trail:** Switch role to *Bureau Officer*, open `APP-2026-1005` in Final Review, click **Grant Statutory Approval**. Finally, open the **Digital Audit Trail** to view the tamper-evident chronological event log.

---

## 🛡️ Statutory Safeguards & Boundary Declarations
- **Synthetic Demonstration Data:** All institutions, application numbers, and committee names in this prototype are synthetic.
- **Human Decision Boundary:** The system automates routine transitions, prerequisite validation, and reminders; all formal statutory approvals, reversions, and inspections require authorized human officer decisions.
- **APH Compliance:** Workflow stages and deadlines follow the standard AICTE Approval Process Handbook (APH) principles.
