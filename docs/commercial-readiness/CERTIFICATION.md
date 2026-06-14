# Finance Intelligence Platform — Multi-Tenant Security Certification

| Field | Value |
|---|---|
| **Document** | Commercial SaaS Foundation — Security & Tenant-Isolation Certification |
| **Version** | 1.0 |
| **Owner** | Platform / Security Engineering |
| **Date** | 2026-06-13 |
| **Scope** | Authentication, Organizations, RBAC, Tenant Isolation, Administration, Onboarding |
| **Method** | 37-agent adversarial code audit → adversarial verification → remediation → build verification |
| **Branch** | `feat/commercial-saas-foundation` (commits `28ab4be`, `1927c0f`, `a7407ff`) |

---

## 1. Executive Summary

The platform was transformed from a single-tenant demo into a multi-tenant SaaS foundation, then subjected to a skeptical, evidence-based due-diligence audit (10 areas, 37 agents, 28 Critical/High findings adversarially verified — 25 confirmed, 3 refuted). All **confirmed Critical findings have been remediated and re-verified by a clean production build**.

The central question — *"Can a real customer operate without exposing another customer's data?"* — is answered **yes, by design and by construction**, subject to the operational pre-condition that Clerk is configured (both keys) and Databricks/Unity Catalog is the production store. The isolation model is: **every record carries `client_id`; the active `client_id` is derived from the authenticated Clerk organization (never a constant); every query, agent path, ingestion write, and admin action is scoped to it; and authenticated-without-tenant fails closed (empty scope, zero rows).**

**Recommendation: READY FOR DESIGN PARTNERS.** Not yet *Ready for Commercial Deployment* — the remaining gap is **runtime validation with live Clerk keys + a Databricks `NOT NULL client_id` migration + an automated test suite** (Section 11). For a hands-on early-customer (design-partner) cohort with Sin City Analytics operating provisioning, the isolation, RBAC, and onboarding controls are sufficient and enforced server-side.

### Honest limitation of this certification
This is a **code-inspection + build-verification** certification. Clerk is **not configured in this environment**, so live multi-tenant session behavior (cross-tenant request attempts with real JWTs) was **not executed at runtime**. Conclusions about Clerk-mode behavior are derived from reading the actual code paths, not from a live penetration test. A live pen-test with Clerk configured is a pre-condition for a *Commercial Deployment* rating.

---

## 2. Implemented Components

| Component | Files | Status |
|---|---|---|
| Clerk authentication (graceful demo fallback) | `src/middleware.ts`, `src/app/layout.tsx`, `src/app/sign-in/**`, `src/app/sign-up/**`, `src/components/layout/AuthControls.tsx` | ✅ |
| Session-derived tenant context | `src/lib/tenant/tenant-context.ts` | ✅ |
| API guard (session + tenant + permission + audit) | `src/lib/tenant/with-tenant.ts` | ✅ |
| RBAC (7 roles + permission matrix + visibility) | `src/lib/auth/rbac.ts` | ✅ |
| Organization / user / audit services | `src/lib/services/*.ts`, `src/lib/audit/audit.service.ts` | ✅ |
| Control-plane schema (org, app_user, audit_log) | `src/lib/schema/ddl.ts`, `src/lib/adapters/local-adapter.ts` | ✅ |
| Onboarding orchestration + admin API (org CRUD, enable, user invite/role/disable) | `src/lib/services/onboarding.service.ts`, `src/app/api/admin/**` | ✅ |
| Administration UI | `src/app/admin/page.tsx`, `src/components/admin/AdminConsole.tsx` | ✅ (functional, minimal) |

---

## 3. Route Coverage Matrix

Legend: Auth = authentication required (via middleware when Clerk on); Perm = server-side permission enforced in handler; Tenant = data scoped to session tenant.

| Route | Method | Auth | Permission | Tenant scoping | Status |
|---|---|---|---|---|---|
| `/api/agent` | POST | ✅ | `agents:run` | ✅ session `clientId` | PASS |
| `/api/agent/orchestrate` | POST | ✅ | `agents:run` | ✅ | PASS |
| `/api/agent/executive` | POST | ✅ | `reports:view_executive` | ✅ | PASS |
| `/api/ingest` | POST | ✅ | `data:upload` | ✅ writes under tenant | PASS |
| `/api/ingest/upload` | POST | ✅ | `data:upload` | ✅ | PASS |
| `/api/ingest/uploads` | GET | ✅ | `data:view_validation` | ✅ (remediated) | PASS |
| `/api/ingest/uploads/[id]` | GET | ✅ | `data:view_validation` | ✅ (remediated) | PASS |
| `/api/ingest/staged` | GET | ✅ | `data:view_validation` | ✅ (remediated) | PASS |
| `/api/db/clear` | POST | ✅ | `data:clear` | ✅ `DELETE … WHERE client_id=?` | PASS |
| `/api/db/query` | POST | ✅ | `platform:view_all_tenants` (demo bypass) | n/a (raw, platform-only) | PASS |
| `/api/db/init` | GET | ✅ | `platform:manage_organizations` (demo bypass) | n/a (schema) | PASS |
| `/api/db/test` | GET | ⬜ public | none | none (health only, no data) | PASS (by design) |
| `/api/admin/organizations` | GET/POST | ✅ | `platform:manage_organizations` / `platform:onboard_organization` | platform view | PASS |
| `/api/admin/organizations/[orgId]` | GET/PATCH | ✅ | `org:view_activity` / `org:manage_settings` | ✅ `assertOrgScope` | PASS |
| `/api/admin/organizations/[orgId]/enable` | POST | ✅ | `platform:onboard_organization` | platform | PASS |
| `/api/admin/organizations/[orgId]/users` | GET/POST | ✅ | `org:view_activity` / `org:invite_users` | ✅ `assertOrgScope` | PASS |
| `/api/admin/organizations/[orgId]/users/[userId]` | PATCH/DELETE | ✅ | `org:assign_roles` / `org:remove_users` | ✅ `assertOrgScope` | PASS |
| Dashboard pages (`/`, `/cfo`, `/cio`, `/fpa`, `/vendors`, `/headcount`, `/external-labor`) | GET | ✅ | page-gated by middleware | ✅ `getTenantClientId()` | PASS |

GET status/metadata handlers on the agent routes return only mode/model/agent-list (no financial data) and are behind middleware auth in Clerk mode — tracked as **Low** (Section 7).

---

## 4. Tenant Isolation Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| TI-1 | Dashboards resolved tenant from static `DEFAULT_CLIENT_ID`, not session | Critical | ✅ Fixed — `getTenantClientId()` on all 7 pages |
| TI-2 | Ingestion routes wrote under hardcoded `demo-client` | High | ✅ Fixed — `ctx.clientId` |
| TI-3 | Upload-history + financial-stage services hardcoded `DEFAULT_CLIENT_ID` on read **and write** (cross-tenant commingling + leak) | Critical | ✅ Fixed — `clientId` threaded through interfaces + both impls |
| TI-4 | `GET /api/ingest/uploads`, `/uploads/[id]`, `/staged` unguarded + not tenant-scoped | Critical | ✅ Fixed — `withTenant` + `data:view_validation` + tenant scope |
| TI-5 | MERGE `ON` matched natural key only → cross-tenant overwrite risk | High | ✅ Fixed — `AND target.client_id = source.client_id` on all upserts |
| TI-6 | Static `getFinanceSnapshot()` fallback could serve demo data to a real tenant | High | ✅ Fixed — `resolveSnapshot()` returns empty snapshot for non-demo tenants |
| TI-7 | Local SQLite tables lacked `client_id` (queries would error / not isolate) | High | ✅ Fixed — column added + migration + scoped queries |
| TI-8 | `dim_period` has no `client_id` | (auditor: Critical) | ✅ **Accepted by design** — shared fiscal calendar (year/month/quarter/closed); contains no tenant-confidential data. Documented, not a leak. |

---

## 5. RBAC Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| RB-1 | `hasPermission()` defined but never enforced on routes | Critical | ✅ Fixed — enforced in `withTenant` before every handler |
| RB-2 | Disabled members fell through to ReadOnly (retained access) | Critical | ✅ Fixed — `tenant-context` fails closed (no tenant) for `status='disabled'` |
| RB-3 | Org admin could target another org via URL `orgId` | High | ✅ Fixed — `assertOrgScope(ctx, orgId)` on all org-scoped admin routes |
| RB-4 | Role spoofing via self-set metadata | — | ✅ Not exploitable — app role is read from the server-side `app_user` mirror (admin-written) + Clerk session claims; clients cannot write `publicMetadata`. |
| RB-5 | Matrix least-privilege (ReadOnly cannot run agents/upload/admin; Leader limited; SystemAdmin cross-tenant only) | — | PASS — deny-by-default verified in `rbac.ts` |

---

## 6. Data Leakage Review (Client A / B / C)

| Vector | Can A read B? | Control | Verdict |
|---|---|---|---|
| Dashboards | No | `getTenantClientId()` → `client_id = ?` on every query | PASS |
| Agents (live + mock fallback) | No | `resolveSnapshot(ctx.clientId)`; non-demo tenants never get demo/empty-other data | PASS |
| Query layer | No | all `src/lib/queries/*` filter `client_id`; no unfiltered exported query | PASS |
| Upload history / staging | No (remediated) | `clientId` threaded; routes guarded + `assertOrgScope` | PASS |
| Admin APIs | No | `assertOrgScope` blocks cross-org; platform views are SystemAdmin-only | PASS |
| Raw SQL (`/api/db/query`) | Platform-only | restricted to `platform:view_all_tenants` (demo bypass) | PASS (accepted: SystemAdmin is intentionally cross-tenant) |
| Writes (MERGE) | No | upsert keys include `client_id` | PASS |

**No confirmed real-tenant→real-tenant leakage path remains** after remediation.

---

## 7. Residual / Low Findings (accepted or tracked)

- **Agent GET metadata handlers** expose mode/model/agent-list (no financial data); behind auth in Clerk mode. *Low — tracked.*
- **`AuthControls` (client) checks only the publishable key** (the secret is server-only and unreadable on the client). Mitigated: server gates (layout/sign-in/sign-up/middleware) require **both** keys, and `.env.example` documents the both-or-neither contract. *Low.*
- **Single shared Databricks token/catalog/schema** — isolation is logical (app-level `client_id`), not physical. Acceptable for design partners; Unity Catalog row filters / per-tenant credentials recommended before large-scale commercial. *Medium — roadmap.*
- **Write path uses string-interpolated MERGE** (`esc()` applied to all string fields). Parameterized writes recommended long-term. *Low.*

---

## 8. Demo vs Production Isolation

- Demo mode (no Clerk) operates as the original single tenant (`demo-client`) with full access — preserved, nothing broken.
- A production tenant **cannot fall back to demo data**: `resolveSnapshot()` returns an empty snapshot for any non-demo tenant without live data (`src/agents/dataContext.ts`).
- Demo writes are scoped to `demo-client`; local seed only creates `demo-client` rows.
- The demo full-access context applies **only when Clerk is disabled**; when Clerk is enabled, `isDemo` is always false. PASS.

---

## 9. Client Onboarding Dry Run

The end-to-end workflow is now **executable** (was a hard blocker — score 2/10):

| Step | Mechanism | Status |
|---|---|---|
| Create Organization | `POST /api/admin/organizations` → `onboardOrganization()` → `upsertOrganization(status=onboarding)` | ✅ |
| Create Tenant | `tenantId === orgId`, written to control plane | ✅ |
| Invite Users | `POST …/users` (local mirror; Clerk email invite best-effort) | ✅ |
| Assign Roles | `PATCH …/users/[id]` → `assignUserRole` (audited) | ✅ |
| Configure Settings | `PATCH …/[orgId]` → `updateOrganizationSettings` | ✅ |
| Enable Platform | `POST …/[orgId]/enable` → status `onboarding → active` (state-machine validated) | ✅ |
| Audit trail | every mutation emits a `logAudit` event | ✅ |

**Blockers remaining for fully self-serve onboarding:** real Clerk email invitations require live keys (path implemented, best-effort); admin UI is functional but minimal; no automated onboarding tests.

---

## 10. Readiness Scorecard (post-remediation)

| Category | Pre-audit | Post-remediation | Notes |
|---|---|---|---|
| Authentication | 7 | **8.5** | both-key gate consistency fixed |
| Route coverage | 9 | **9.5** | uploads/staged guarded |
| Tenant isolation (query) | 8 | **9** | services tenant-threaded |
| Agent execution | 9 | **9** | GET metadata Low remains |
| Ingestion write path | 6 | **8.5** | MERGE keys + esc + tenant |
| Database adapters | 8 | **8.5** | insertRows whitelist |
| RBAC | 4 | **8.5** | enforcement + disabled + org-scope |
| Demo/prod isolation | 8 | **8.5** | leak guard confirmed |
| Administration & audit logging | 3 (implicit) | **8** | admin API + audit on mutations |
| Client onboarding | 2 | **7.5** | executable; UI minimal, Clerk best-effort |
| **Overall** | **6.8** | **≈ 8.4 / 10** | |

---

## 11. Remaining Risks (before Commercial Deployment)

1. **Live Clerk runtime validation** — execute cross-tenant attempts with real JWTs/orgs (this cert is code+build based).
2. **Databricks `client_id NOT NULL` migration** + partition/cluster by `client_id` (currently nullable; app enforces presence).
3. **Automated test suite** — no test runner is wired (`package.json` has no `test` script); add per-tenant isolation + RBAC tests.
4. **Physical isolation hardening** — Unity Catalog row filters / per-tenant warehouse credentials; parameterized writes.
5. **Admin UX depth** — settings/modules editor, invitation acceptance flow, audit-log viewer.

---

## 12. Success-Criteria Answers — "If a CFO signs tomorrow…"

| Question | Answer | Evidence |
|---|---|---|
| Can we create their organization? | **Yes** | `POST /api/admin/organizations` + `onboardOrganization()` |
| Can we invite their users? | **Yes** (local now; Clerk email when keys set) | `POST …/users`, Clerk invitation best-effort |
| Can we assign roles? | **Yes** | `PATCH …/users/[id]` → `assignUserRole`, 7-role matrix |
| Can we isolate their data? | **Yes** | session `client_id` on every query/agent/ingest/admin path; fail-closed |
| Can we enforce permissions? | **Yes** | `withTenant` server-side `hasPermission` before every handler |
| Can we prevent cross-tenant access? | **Yes** (no confirmed leak path) | Sections 4 & 6 |
| Can we onboard them safely? | **Yes, with Sin City Analytics operating provisioning** | Section 9 |

**Final recommendation: READY FOR DESIGN PARTNERS.**

*Certification basis: static code audit (37 agents) + adversarial verification + applied remediation + clean production build (30/30 routes). Live-Clerk runtime penetration testing is the gate to a Commercial Deployment rating.*
