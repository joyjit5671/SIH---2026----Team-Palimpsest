# Security Audit Playbook — AICTE Approval Workflow Automation System

**Problem Statement:** AICTE 26262

**Who this applies to:** any AI agent auditing this project. Any subagent
executing a "run a security audit" command follows this document.

**Golden rule: verify against the LIVE system, not just the repo.** Static
analysis will scream about vulnerabilities already fixed in production and
miss ones only live queries reveal. A repo is a claim; the running system
is the truth.

**Project identifiers** (single source of truth — if these change, update
them HERE first):
- Backend project: Supabase-hosted PostgreSQL (project ID to be configured)
- Repo: To be set up on GitHub
- Deploy platform: Vercel (frontend) + Python-compatible host (backend)

---

## 0. Before you start

1. Read `AGENTS.md`, `context.md`, and the latest `progress.md` block.
   Do not re-report what prior audits already fixed; do not re-suggest
   what is deliberately deferred (listed in `AGENTS.md` under
   "Deliberate decisions").
2. Confirm your access to the live backend and the repo remote. If a tool
   returns "permission denied" or "not found", say so loudly and mark
   those areas UNVERIFIED — never present a static-only finding about live
   infrastructure as confirmed.
3. Fan out in parallel: one auditor per surface (client, backend/DB,
   repo/perimeter). Auditors are read-only. Fixes come later, on branches,
   never on main.

## 1. Client / app audit (Next.js frontend)

- **Identity**: every write carrying a user identifier must derive it from
  the auth session at the call site (client SDK) or the verified token
  (server). Grep for identity sourced from route params, local storage,
  component state, or request bodies. Zero exceptions.
- **IDOR / ownership**: every update/delete should carry an ownership
  predicate even when server-side row security exists — the server rule is
  the boundary; the client filter is free defense-in-depth.
- **Input boundaries**: every user-typed or externally-fetched string that
  reaches the backend goes through central validators. If no central
  validator exists yet, creating one is finding #1. Check:
  - `frontend/lib/` for validation utilities
  - Pydantic schemas on the backend side (`backend/app/schemas.py`)
- **Storage at rest**: local storage holds only non-sensitive UI flags.
  Session tokens belong to the auth SDK's own storage.
- **Secrets**: only `NEXT_PUBLIC_*` values may appear in client code.
  Anything else in the bundle is a leak. Check `.env` files, build output,
  and dev-tool log directories.
- **Misc sweep**: no eval/dynamic code, no `http://` (use HTTPS), no
  logging of tokens/PII, permissions minimal and justified.

### AICTE-specific client audit points

- **Role switching (P0)**: Verify demo role selector cannot be used to
  access production auth flows. Must be clearly labelled demo-only.
- **Application data**: Institution representatives must not see other
  institutions' records via URL manipulation or API parameter tampering.
- **Document access**: Verify file download links are scoped to
  authorised users — no direct public storage URLs.
- **Audit trail**: Verify client cannot modify or delete audit events
  through any API path.

## 2. Backend / database audit (FastAPI + Supabase PostgreSQL)

Run these LIVE against the catalogs, not against migration files:

```sql
-- Every table must have row security on:
SELECT relname, relrowsecurity FROM pg_class
WHERE relnamespace='public'::regnamespace AND relkind='r';
-- Every policy ownership-scoped, WITH CHECK on writes:
SELECT tablename, policyname, cmd, roles::text, qual, with_check
FROM pg_policies WHERE schemaname='public';
-- SECURITY DEFINER inventory + search_path pinning + actual grants:
SELECT p.proname, pg_get_function_identity_arguments(p.oid), p.proconfig,
       (SELECT string_agg(DISTINCT g.grantee::text, ',')
        FROM information_schema.routine_privileges g
        WHERE g.specific_name = p.proname||'_'||p.oid) AS grantees
FROM pg_proc p WHERE p.pronamespace='public'::regnamespace AND p.prosecdef;
-- Storage policies:
SELECT policyname, cmd, qual, with_check
FROM pg_policies WHERE schemaname='storage';
```

Then judge:

- Every client-callable privileged function taking a user ID must
  self-guard: reject when the parameter differs from the authenticated
  identity.
- Service-role-only functions must show grants to privileged roles ONLY.
- `search_path` pinned on every privileged function; no dynamic SQL built
  from user input.
- Run Supabase's built-in advisors/linters and adjudicate each finding.

### AICTE-specific backend audit points

- **Workflow transitions**: Verify `POST /applications/{id}/transition`
  and `POST /applications/{id}/return` enforce:
  - Actor is authorised for the current stage
  - Prerequisites are satisfied before progression
  - Return reason is mandatory and non-empty
  - State change + workflow event + audit event are atomic (single transaction)
  - Invalid transitions return 409 with no partial state change
- **Statutory boundary**: Verify NO endpoint autonomously approves/rejects
  an application or concludes evidence satisfies a statutory obligation.
- **Document storage**: `documents.storage_key` must reference private
  storage; verify no public URL exposure.
- **Audit immutability**: Verify `audit_events` table has no UPDATE or
  DELETE API paths. Append-only through application API.
- **Evidence vs compliance**: Verify uploading evidence does NOT
  automatically mark an undertaking as verified/compliant.

### Edge/serverless function inventory (refresh EVERY audit)

| Function | Purpose | Auth verified? | Rate limited? | In repo? |
|---|---|---|---|---|
| *(populate from the live platform; drift vs. this table is a finding)* | | | | |

## 3. Website / perimeter audit

- **Headers** (configured in `vercel.json` or equivalent):
  HSTS w/ preload, CSP `default-src 'self'` without
  unsafe-inline/unsafe-eval, `frame-ancestors 'none'`,
  `X-Content-Type-Options: nosniff`, restrictive Permissions-Policy and
  Referrer-Policy.
- **Secrets in repo AND history**: grep the tree for key-shaped strings
  (`eyJhbGciOi`, `sk-`, `re_`, `AKIA`, `-----BEGIN`, `service_role`,
  `supabase`, `github_pat`), then pickaxe history:
  `git log --all -S "<secret-string>" --pickaxe-regex` and confirm `.env`
  was never committed: `git log --diff-filter=A --all -- "*.env*"`.
- **Dependencies**:
  - Frontend: `npm audit --omit=dev`
  - Backend: `pip-audit`
  Triage by *where the code runs*: build-tooling ReDoS is noise; runtime
  RCE/exfil is signal.
- **Process controls**: pre-push hook exists and blocks main; hooks path
  configured.
- **CORS**: Configured for known frontend origin(s) only — no permissive
  wildcard in production.

## 4. Reporting standard

- Severity = exploitability × blast radius, judged against the LIVE system.
  Downgrade anything already fixed in production or on a merged branch —
  and check merge state on the remote.
- Every finding: severity, `file:line` or object name, concrete exploit
  scenario ("an authenticated user can X by doing Y"), and the fix.
- Report what you verified CLEAN with the same rigor.
- No speculative findings. If you didn't read the code or query the
  catalog, it goes in "unverified", not "findings".
- **Critical findings jump the queue**: live, exploitable issues go at the
  TOP labelled CRITICAL with a fix already on a branch.

## 5. Fix protocol

- New branch per fix stream (`fix/…`), never main. Baseline check clean
  before done.
- DB fixes go through named migrations; verify with a test call, then
  clean up test rows.
- Deploying a serverless function is a production change — call it out
  explicitly.
- Update `context.md` + `progress.md` at session end. If you later learn a
  reported fact was wrong, CORRECT the docs — a wrong record is worse than
  no record.
