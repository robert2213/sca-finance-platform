# Client Onboarding Playbook

**Deliverable 3 of the Sin City Analytics 9-Part Operational Delivery Framework**
**Product:** Finance Intelligence Platform (codename **Nexora**) — reporting that behaves like a finance analyst, not a report generator.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | 03 — Client Onboarding Playbook |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics — Delivery |
| **Audience** | Engagement Leads, Solutions Architects, Data Engineers, Finance Domain Leads, Customer Success, Client Sponsors & Project Teams |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Related Documents** | `01-financial-intelligence-assessment-framework.md` · `02-implementation-playbook.md` · `04-solution-design-framework.md` · `05-proposal-template.md` · `06-pricing-framework.md` · `07-multi-tenant-client-operating-model.md` · `08-design-partner-program.md` · `09-sales-to-implementation-handoff.md` |

---

## Purpose

This playbook is the **operational, week-by-week choreography** for taking a signed Nexora client from contract to confident, self-sufficient production use. It governs the **people, meetings, documents, and handoffs** of onboarding — who runs which session, what gets decided, what artifact is produced, and how control passes from sales to delivery to Customer Success.

It is deliberately **not** the methodology. The full 10-phase implementation methodology (Discovery → Optimization) lives in `02-implementation-playbook.md`. This document orchestrates the human side of that methodology. Where a phase's *technical* detail is needed, this playbook references Document 02 rather than restating it; where the *human* sequencing matters, it lives here.

The onboarding north star matches the product north star: every client must reach a state where they ask a real finance question and Nexora returns **Question → Relevant Data → AI (Claude) Analysis → Direct Answer** — grounded, cited, and trustworthy. Onboarding is complete when the client trusts the answer.

---

## 1. Kickoff Meeting

The kickoff converts a signed deal into a live engagement. It is the formal start of delivery and the moment the **Sales-to-Implementation Handoff** (`09-sales-to-implementation-handoff.md`) is ratified in front of the client.

### 1.1 Objectives

- Confirm scope, outcomes, and success metrics agreed at sale — no surprises post-signature.
- Introduce the full delivery team and client team; establish single points of contact.
- Align on timeline, cadence, and the first two weeks of concrete actions.
- Set expectations for client effort (data access, SME availability, sign-offs).
- Confirm the in-scope modules and AI agents from the proposal.

### 1.2 Pre-Read & Entry Criteria

| Item | Source | Owner |
|---|---|---|
| Signed order form / SOW | Sales | Engagement Lead |
| Completed Sales-to-Implementation Handoff doc | `09-...handoff.md` | Engagement Lead |
| Discovery notes & assessment output | `01-...assessment-framework.md` | Solutions Architect |
| Draft module + agent scope | `04-solution-design-framework.md` | Solutions Architect |
| Named client sponsor & project lead | Sales | Engagement Lead |

### 1.3 Checklist

- [ ] Handoff document reviewed by delivery team before the meeting (no cold starts).
- [ ] Delivery team roster confirmed and bios circulated.
- [ ] Client stakeholder list received (names, roles, email domains — captured now for target-state Clerk identity; Clerk not live today).
- [ ] Draft scope of modules and agents validated against the signed proposal.
- [ ] Kickoff deck prepared (outcomes, team, timeline, asks).
- [ ] Shared workspace / document repository provisioned for the engagement.
- [ ] Communication cadence proposed (see Section 13).
- [ ] First-week actions drafted and owners pre-assigned.
- [ ] Risk & dependency log created.

### 1.4 Meeting Agenda (60 minutes)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:05 | Welcome & introductions | Engagement Lead | Names, roles, points of contact |
| 0:05–0:15 | Why Nexora / target outcomes | Engagement Lead | Shared definition of success |
| 0:15–0:25 | Confirmed scope: modules & agents | Solutions Architect | Scope ratified vs. proposal |
| 0:25–0:35 | Timeline & phases overview | Engagement Lead | Agreement on milestones |
| 0:35–0:45 | Client responsibilities & data asks | Data Engineer | Clear client to-dos |
| 0:45–0:55 | Cadence, tools, escalation | Customer Success | Cadence accepted |
| 0:55–1:00 | First-week actions & close | Engagement Lead | Action owners & dates |

### 1.5 Required Documentation

- **Kickoff Deck** (outcomes, team, timeline, asks).
- **Engagement Charter** (scope, success metrics, governance) — template below.
- **Action & Decision Log** (live, shared).
- **Risk & Dependency Register**.

> **Template — Engagement Charter**
> - **Client:** [CLIENT NAME] · **Tenant clientId:** [CLIENT_ID]
> - **Sponsor:** [NAME, TITLE] · **Project Lead:** [NAME, TITLE]
> - **In-scope modules:** [financial_reporting | forecast | actuals | budget | executive_reporting | headcount | vendors | external_labor | cloud_spend | agents]
> - **Enabled agents:** [CFO Advisor | FP&A Specialist | Procurement Advisor | Workforce Finance | External Labor Advisor | Finance Business Partner | Data Quality Advisor]
> - **Target Go-Live:** [DATE] · **Hypercare end:** [DATE]
> - **Primary success metric:** [e.g., "CFO asks 5 live variance questions in week 1 with cited answers"]
> - **Out of scope:** [LIST]

### 1.6 Roles & Responsibilities

| Role | Responsibility at Kickoff |
|---|---|
| Engagement Lead (SCA) | Owns the meeting; ratifies scope, timeline, charter |
| Solutions Architect (SCA) | Presents module/agent scope; fields technical questions |
| Data Engineer (SCA) | Sets data-access expectations and client to-dos |
| Customer Success (SCA) | Introduces cadence, support model, adoption goals |
| Client Sponsor | Confirms outcomes, commits resources |
| Client Project Lead | Accepts action ownership, names SMEs |

---

## 2. Stakeholder Alignment

A short, deliberate phase to map *who decides, who provides data, who uses the platform, and who signs off* — before any technical work scales. Misalignment here is the single largest source of onboarding slippage.

### 2.1 Objectives

- Produce a complete stakeholder map across the client organization.
- Confirm decision rights and approval authority for config, security, and go-live.
- Identify SMEs per data domain (GL, FP&A, procurement, HR/headcount, cloud).
- Surface organizational constraints (fiscal calendar, period close timing, security policy).

### 2.2 Stakeholder Map Template

| Persona | Name | Role | Decision rights | Nexora role mapping | Modules of interest |
|---|---|---|---|---|---|
| Executive sponsor | [NAME] | [TITLE] | Budget, go-live | `executive` | executive_reporting, agents |
| Finance lead / FP&A | [NAME] | [TITLE] | Config sign-off | `finance_user` | forecast, actuals, budget |
| Procurement SME | [NAME] | [TITLE] | Vendor data | `finance_user` | vendors, external_labor |
| HR / Workforce SME | [NAME] | [TITLE] | Headcount data | `finance_user` | headcount |
| IT / Security | [NAME] | [TITLE] | Access, tokens | `admin` | — |
| Department leaders | [NAMES] | [TITLES] | Review | `read_only` / `finance_user` | financial_reporting |

### 2.3 Checklist

- [ ] Stakeholder map complete and validated by the client sponsor.
- [ ] Decision-rights matrix agreed (who signs config, security, go-live).
- [ ] SMEs named for every in-scope data domain.
- [ ] Fiscal year, period definitions, and close calendar captured.
- [ ] Persona-to-role mapping drafted for User Provisioning (Section 6).
- [ ] Steering committee membership confirmed (see Section 13).

### 2.4 Meeting Agenda — Alignment Workshop (45 minutes)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:05 | Purpose & map walkthrough | Engagement Lead | Context set |
| 0:05–0:20 | Build/validate stakeholder map | Customer Success | Map confirmed |
| 0:20–0:30 | Decision rights & sign-off authority | Engagement Lead | RACI gaps closed |
| 0:30–0:40 | SME assignment by data domain | Data Engineer | Named SMEs |
| 0:40–0:45 | Fiscal calendar & constraints | Finance Domain Lead | Calendar captured |

### 2.5 Required Documentation

- **Stakeholder Map** (table above).
- **Decision-Rights Matrix** (feeds Section 12 RACI).
- **Fiscal Calendar & Close Schedule** (feeds ClientConfig).

### 2.6 Roles & Responsibilities

| Role | Responsibility at Stakeholder Alignment |
|---|---|
| Engagement Lead (SCA) | Owns alignment; closes decision-rights and sign-off gaps |
| Customer Success (SCA) | Facilitates the stakeholder map; confirms steering membership |
| Data Engineer (SCA) | Drives SME assignment per data domain (GL, FP&A, procurement, HR, cloud) |
| Finance Domain Lead (SCA) | Captures fiscal calendar, period definitions, and close timing |
| Client Sponsor | Validates the map; confirms decision rights and approval authority |
| Client Project Lead | Names SMEs and persona owners; commits availability |

---

## 3. Data Access Process

Security-first. Nexora handles confidential financial data; access is granted on a **least-privilege, scoped, time-bound** basis. Live data paths today are **CSV/Excel upload** and **Databricks SQL**; all other connectors are staged (see Section 4). This section governs *how the client safely hands us data* — the technical pipeline detail (Parser → Mapper → Validator → Store) lives in `02-implementation-playbook.md`.

### 3.1 Principles

- **Least privilege:** request only the schemas/tables/periods in scope.
- **Read-only by default:** Databricks tokens are read-only wherever possible.
- **Scoped tokens:** tenant-/warehouse-scoped, time-bound, rotatable; never broad workspace tokens.
- **No secrets in chat or tickets:** credentials travel only through secure channels and land only in environment configuration.
- **Tenant isolation:** all ingested records are stamped with `clientId` for row-level isolation.

### 3.2 Access Paths

| Path | When used | Mechanism | Security controls |
|---|---|---|---|
| Databricks SQL (primary) | Client has a lakehouse/warehouse | Scoped, read-only SQL warehouse token | Read-only token; warehouse-scoped; IP allow-list if available; rotation schedule |
| Secure file transfer (CSV/Excel) | No warehouse, or supplemental data | Encrypted upload to provisioned secure store | TLS in transit; access-controlled bucket/endpoint; no email attachments of financial data |
| Staged connectors | Roadmap (QuickBooks, NetSuite, Workday HCM, Beeline/Fieldglass, Coupa, Adaptive) | Per connector | Documented but not provisioned this cycle |

### 3.3 Checklist

- [ ] Data-access request scoped to in-scope domains, tables, and periods only.
- [ ] Databricks read-only warehouse token requested with least-privilege scope.
- [ ] Token rotation owner and expiry date recorded.
- [ ] Secure file-transfer channel provisioned (no email attachments permitted).
- [ ] Sample dataset received and a connectivity smoke test passed.
- [ ] `clientId` confirmed and applied to all inbound records.
- [ ] Credentials stored only in environment configuration; no secrets in tickets/chat/docs.
- [ ] Data Access Log opened (who, what scope, when, expiry).

### 3.4 Meeting Agenda — Data Access Working Session (45 minutes)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:10 | Access principles & least-privilege | Solutions Architect | Shared understanding |
| 0:10–0:25 | Databricks token scope & creation | Data Engineer + Client IT | Scoped token issued |
| 0:25–0:35 | Secure file transfer setup | Data Engineer | Channel live |
| 0:35–0:45 | Smoke test & sample pull | Data Engineer | Connectivity confirmed |

### 3.5 Required Documentation

- **Data Access Request Form** (template below).
- **Data Access Log** (audit trail; feeds Security Review).
- **Token Inventory** (scope, owner, expiry, rotation).

> **Template — Data Access Request Form**
> - **Client / clientId:** [CLIENT_ID]
> - **Access path:** [Databricks read-only | Secure file transfer]
> - **In-scope schemas/tables:** [LIST]
> - **In-scope periods (ISO month):** [YYYY-MM] to [YYYY-MM]
> - **Token scope:** [warehouse/catalog] · **Permission:** [READ ONLY]
> - **Issued:** [DATE] · **Expires:** [DATE] · **Rotation owner:** [NAME]
> - **Approver (Client Security):** [NAME] · **Date:** [DATE]

### 3.6 Roles & Responsibilities

| Role | Responsibility at Data Access |
|---|---|
| Solutions Architect (SCA) | Sets least-privilege/scoped-token principles; defines in-scope access |
| Data Engineer (SCA) | Issues/scopes read-only Databricks token; provisions secure file transfer; runs smoke test |
| Engagement Lead (SCA) | Owns the Data Access Log; tracks token expiry/rotation ownership |
| Client IT / Security | Creates and approves scoped tokens; signs the Data Access Request Form |
| Client Finance/Procurement/HR SME | Confirms in-scope schemas/tables/periods per domain |

---

## 4. System Inventory

Map each client source system to a Nexora connector and ingestion path, and flag what is live versus staged. This drives realistic scope: only **CSV/Excel and Databricks are live today**.

### 4.1 Source-to-Connector Mapping Template

| Client source system | Domain | Target Nexora connector | Live today? | Onboarding path this cycle |
|---|---|---|---|---|
| [e.g., GL system] | Actuals/GL | QuickBooks / NetSuite | Staged | CSV/Excel export → ingestFile() |
| [e.g., warehouse] | Multi-domain | Databricks | **Live** | Scoped read-only SQL |
| [e.g., planning] | Budget/Forecast | Adaptive | Staged | CSV/Excel export |
| [e.g., HCM] | Headcount | Workday HCM | Staged | CSV/Excel export |
| [e.g., VMS] | External labor/SOW | Beeline / Fieldglass | Staged | CSV/Excel export |
| [e.g., procurement] | Vendors | Coupa | Staged | CSV/Excel export |
| [e.g., cloud billing] | Cloud spend | Databricks / file | **Live** (via file/warehouse) | Scoped pull or file |

### 4.2 Checklist

- [ ] All in-scope client source systems inventoried.
- [ ] Each system mapped to a connector and an ingestion path.
- [ ] Live vs. staged clearly flagged for the client (manage expectations).
- [ ] For staged systems, the file-export path is agreed with the SME.
- [ ] Data freshness/refresh cadence captured per system.
- [ ] Inventory cross-checked against in-scope modules.

### 4.3 Meeting Agenda — System Inventory Workshop (45 minutes)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:05 | Connector landscape & live-vs-staged | Solutions Architect | Expectations set |
| 0:05–0:30 | Walk each source system with SMEs | Data Engineer | Mapping table filled |
| 0:30–0:40 | Refresh cadence & export ownership | Data Engineer | Cadence agreed |
| 0:40–0:45 | Confirm scope alignment | Engagement Lead | Inventory signed off |

### 4.4 Required Documentation

- **System Inventory & Connector Map** (table above).
- **Data Refresh Plan** (per source, cadence, owner).

### 4.5 Roles & Responsibilities

| Role | Responsibility at System Inventory |
|---|---|
| Solutions Architect (SCA) | Explains the connector landscape; sets live-vs-staged expectations (CSV/Excel + Databricks live; others staged) |
| Data Engineer (SCA) | Maps each source to a connector and ingestion path; agrees export path and refresh cadence |
| Engagement Lead (SCA) | Confirms inventory aligns with in-scope modules; signs off the inventory |
| Client Source-System SMEs | Provide system details, export feasibility, and refresh cadence per source |

---

## 5. Security Review

A formal gate before user provisioning and go-live. Confirms tenant isolation, least-privilege access, secrets handling, and role design. Must be signed by client security/IT.

### 5.1 Review Areas

| Area | Control | Verification |
|---|---|---|
| Tenant isolation | `clientId` row-level isolation on every record | Confirm stamping on ingested data |
| Access scope | Read-only, scoped Databricks tokens | Token Inventory review |
| Secrets | Credentials in env only; never in code/tickets/chat | Secrets-handling attestation |
| Roles | `admin` / `finance_user` / `executive` / `read_only` + permission map | Persona-to-role mapping review |
| Identity | Clerk Organizations = tenants (**target auth — NOT live today**: Clerk not installed, middleware is a stub, `/api/agent` public, route guards deferred) | Target-state binding design reviewed; today, tenant isolation rests on `clientId` row-level scoping |
| Data classification | Confidential financial data | Handling policy acknowledged |
| Auditability | Data Access Log + Token Inventory complete | Logs reviewed |

### 5.2 Checklist

- [ ] `clientId` isolation verified on a sample of ingested records.
- [ ] Token Inventory reviewed; all tokens read-only and scoped.
- [ ] Secrets-handling attestation signed (env-only storage).
- [ ] Role design reviewed against the permission map.
- [ ] **Target-state (not live today):** Clerk Organization-to-`clientId` binding *designed and documented* for when Clerk is installed; Clerk is not yet provisioned (middleware stub, `/api/agent` public, route guards deferred), so no Clerk org is created this cycle.
- [ ] Data Access Log complete and reviewed.
- [ ] Client security/IT sign-off obtained.
- [ ] Any exceptions logged with compensating controls and an owner.

### 5.3 Meeting Agenda — Security Review (45 minutes)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:10 | Tenant isolation & data classification | Solutions Architect | Isolation confirmed |
| 0:10–0:20 | Token & secrets review | Data Engineer | Controls verified |
| 0:20–0:30 | Roles & permission map | Solutions Architect | Role design approved |
| 0:30–0:40 | Identity model: `clientId` isolation today + Clerk org/tenant binding (target-state, not live) | Solutions Architect | Today's isolation confirmed; target binding designed |
| 0:40–0:45 | Sign-off & exceptions | Engagement Lead + Client IT | Gate cleared |

### 5.4 Required Documentation

- **Security Review Record** (areas, findings, sign-off).
- **Secrets-Handling Attestation**.
- **Exception Register** (with compensating controls).

### 5.5 Roles & Responsibilities

| Role | Responsibility at Security Review |
|---|---|
| Solutions Architect (SCA) | Confirms `clientId` tenant isolation and role design; presents target-state Clerk identity model (flagged not-live) |
| Data Engineer (SCA) | Verifies read-only/scoped tokens and env-only secrets handling |
| Engagement Lead (SCA) | Owns the review gate; logs exceptions and compensating controls |
| Client IT / Security | Reviews controls; signs the Security Review Record and Secrets-Handling Attestation |

---

## 6. User Provisioning

Translate the persona map (Section 2) into platform access: **Nexora roles + `clientId` isolation**, on least-privilege. Identity federation via **Clerk Organizations is target-state and NOT live today** (Clerk not installed, middleware is a stub, `/api/agent` is public, route guards deferred); accordingly, Clerk org creation/binding/invitation steps below are **designed and recorded now but executed only when Clerk is installed**. Until then, access is governed by the Nexora role model and `clientId` row-level isolation, mirroring how staged connectors are documented but not yet provisioned.

### 6.1 Role Model

| Nexora role | Intended persona | Access posture |
|---|---|---|
| `admin` | IT / platform admin | Manage config, users, connectors |
| `finance_user` | FP&A, finance analysts, SMEs | Full analytical use of in-scope modules |
| `executive` | CFO, VPs, sponsors | Executive reporting & agents; read-heavy |
| `read_only` | Department leaders, viewers | View dashboards/answers; no edits |

### 6.2 Provisioning Workflow

1. Map each named user (Section 2) to one Nexora role per the permission map (least-privilege; elevate only on need).
2. Apply role-based access scoped by `clientId` so each user sees only their tenant's data (row-level `clientId` isolation — the live access control today).
3. Verify tenant isolation per user/role on a sample.
4. Record provisioning in the User Access Register.
5. **Target-state (not live today):** design and record the **Clerk Organization** binding to `clientId` and the user-invitation list, ready to execute once Clerk is installed (currently middleware stub, `/api/agent` public, route guards deferred — no Clerk org is created or invited this cycle).

### 6.3 User Provisioning Template

| User (email) | Persona | Nexora role | Clerk Org | clientId | Modules visible | Provisioned (date) |
|---|---|---|---|---|---|---|
| [EMAIL] | [PERSONA] | [admin/finance_user/executive/read_only] | [ORG] | [CLIENT_ID] | [LIST] | [DATE] |

### 6.4 Checklist

- [ ] Every user mapped to exactly one Nexora role via the permission map.
- [ ] Role-based access applied and scoped by `clientId` (the live control today).
- [ ] Least-privilege validated (no over-provisioned executives/viewers).
- [ ] Tenant isolation spot-checked per role.
- [ ] User Access Register completed.
- [ ] **Target-state (not live today):** Clerk Organization-to-`clientId` binding and the invitation list *designed and recorded* for execution when Clerk is installed; not created/invited this cycle (middleware stub, `/api/agent` public, route guards deferred).

### 6.5 Meeting Agenda — User Provisioning Working Session (45 minutes)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:05 | Role model & least-privilege recap | Solutions Architect | Posture agreed |
| 0:05–0:20 | Map each named user to one Nexora role | Solutions Architect + Client Admin | Role assignments confirmed |
| 0:20–0:30 | Apply `clientId`-scoped access; verify isolation per role | Data Engineer | Live access validated |
| 0:30–0:40 | Target-state Clerk org/binding/invitation design (not executed — Clerk not live) | Solutions Architect | Binding design recorded |
| 0:40–0:45 | Complete User Access Register; acceptance tracking | Customer Success | Register signed off |

### 6.6 Required Documentation

- **User Access Register** (template above).
- **Role/Permission Map** confirmation.
- **Clerk Binding Design Note** (target-state; how org↔`clientId` and invitations will be executed once Clerk is installed).

### 6.7 Roles & Responsibilities

| Role | Responsibility |
|---|---|
| Solutions Architect (SCA) | Nexora role mapping; designs target-state Clerk org binding (not executed this cycle) |
| Data Engineer (SCA) | `clientId` tenant-isolation verification (the live control) |
| Client Admin | Confirms user list and role assignments; accepts invitations when Clerk goes live |
| Customer Success (SCA) | Tracks acceptance, readies training groups |

---

## 7. Configuration Workshops

The heart of onboarding. Nexora's core promise is **onboarding by configuration, not code**: a client goes live by authoring a single **ClientConfig** — the single source of truth per tenant. These workshops author it collaboratively. (Configuration *mechanics* are detailed in `02-implementation-playbook.md`, Phase 5; this section runs the *sessions*.)

### 7.1 ClientConfig Scope

The ClientConfig defines, per tenant: branding; fiscal year & period definitions; forecast cycles (3+9 / 6+6 / 9+3); business units; cost centers; departments; chart of accounts; **active modules**; and **enabled agents**.

### 7.2 Workshop Series

| Workshop | Focus | Client participants | Output |
|---|---|---|---|
| 7A — Foundations | Branding, fiscal year, periods, BUs | Sponsor, Finance lead | Config scaffold |
| 7B — Structure | Cost centers, departments, chart of accounts | Finance lead, SMEs | Dimensional config |
| 7C — Forecasting | Forecast cycle (3+9/6+6/9+3), budget | FP&A | Forecast config |
| 7D — Modules & Agents | Activate modules; enable & tune agents | Sponsor, Finance lead | Final ClientConfig |

### 7.3 Module & Agent Selection Template

| Module key | Activate? | Enabled agents | Notes |
|---|---|---|---|
| financial_reporting | [Y/N] | Finance Business Partner | |
| forecast | [Y/N] | FP&A Specialist | Cycle: [3+9/6+6/9+3] |
| actuals (variance) | [Y/N] | FP&A Specialist, Finance Business Partner | |
| budget | [Y/N] | FP&A Specialist | |
| executive_reporting | [Y/N] | CFO Advisor | |
| headcount | [Y/N] | Workforce Finance | |
| vendors | [Y/N] | Procurement Advisor | |
| external_labor | [Y/N] | External Labor Advisor | |
| cloud_spend | [Y/N] | *(no canonical agent — unassigned)* | Cloud spend has no dedicated agent in the canonical roster; analyze via FP&A Specialist / CFO Advisor as a pragmatic default if the client opts in |
| agents | [Y/N] | Data Quality Advisor (always recommended) | Honors BASE_GUARDRAILS |

> **Agent guardrails reminder (BASE_GUARDRAILS):** no fabricated numbers; separate fact from interpretation; cite source; flag low-confidence; offer follow-ups; escalate when out of depth. These are non-negotiable and reaffirmed in the workshop.

### 7.4 Checklist

- [ ] Branding captured (logo, palette, naming).
- [ ] Fiscal year and ISO-month period definitions set.
- [ ] Forecast cycle selected (3+9 / 6+6 / 9+3).
- [ ] Business units, cost centers, departments authored.
- [ ] Chart of accounts loaded and validated.
- [ ] Active modules selected and justified against outcomes.
- [ ] Agents enabled and mapped to modules; guardrails reaffirmed.
- [ ] ClientConfig authored, version-controlled, and signed off — **zero code changes**.

### 7.5 Meeting Agenda — Configuration Workshop (per session, 90 minutes)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:10 | Recap & objectives for this session | Solutions Architect | Focus set |
| 0:10–0:60 | Author config section live | Solutions Architect + Finance Domain Lead | Config entered |
| 0:60–0:80 | Validate against client data/outcomes | Data Engineer | Sanity-checked |
| 0:80–0:90 | Decisions, open items, next session | Engagement Lead | Log updated |

### 7.6 Required Documentation

- **ClientConfig** (the deliverable; version-controlled, single source of truth).
- **Module & Agent Selection Record** (template above).
- **Configuration Decision Log**.

### 7.7 Roles & Responsibilities

| Role | Responsibility at Configuration Workshops |
|---|---|
| Solutions Architect (SCA) | Runs each workshop; authors ClientConfig live (branding, fiscal year, dimensions, modules, agents) |
| Finance Domain Lead (SCA) | Co-authors finance structure; reaffirms BASE_GUARDRAILS during agent enablement |
| Data Engineer (SCA) | Validates config against loaded client data and outcomes |
| Engagement Lead (SCA) | Maintains the Configuration Decision Log; secures sign-off |
| Client Sponsor & Finance Lead | Decide active modules/agents; sign off the final ClientConfig (zero code changes) |

---

## 8. Training Sessions

Training is **persona-based**. Each audience learns Nexora in terms of the questions *they* ask. Every session reinforces the core flow — ask a question, get data-grounded analysis and a direct, cited answer — and the difference between fact and interpretation.

### 8.1 Sessions by Persona

| Session | Audience | Duration | Focus |
|---|---|---|---|
| 8A — Executives | CFO, VPs, sponsors | 45 min | Ask high-level questions to CFO Advisor; executive reporting; trust signals (citations, confidence flags) |
| 8B — Finance Users | FP&A, analysts | 90 min | Variance, forecast, budget; FP&A Specialist; drill-down; reading sources & validation status |
| 8C — Department Leaders | Cost-center / dept owners | 45 min | Self-serve financial reporting; reading answers; raising data questions |
| 8D — Administrators | IT / platform admins | 60 min | ClientConfig stewardship, user/role management, connectors, token rotation |

### 8.2 Checklist

- [ ] Training schedule published per persona; invites sent.
- [ ] Environment seeded with the client's real (validated) data for realism.
- [ ] Persona-specific question playbooks prepared (sample prompts).
- [ ] Trust mechanics covered: citations, fact-vs-interpretation, low-confidence flags.
- [ ] Admin session covers ClientConfig editing and token rotation.
- [ ] Recordings and quick-reference guides distributed.
- [ ] Attendance and competency captured per session.

### 8.3 Meeting Agenda — Finance User Training (90 minutes, representative)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:10 | The Nexora flow & guardrails | Finance Domain Lead | Mental model set |
| 0:10–0:40 | Variance & budget: live questions | Finance Domain Lead | Hands-on competence |
| 0:40–0:65 | Forecast cycles & FP&A Specialist | Finance Domain Lead | Forecast fluency |
| 0:65–0:80 | Reading sources, validation status, confidence | Customer Success | Trust literacy |
| 0:80–0:90 | Q&A, playbook handout | Customer Success | Self-serve ready |

### 8.4 Required Documentation

- **Training Schedule & Attendance Log**.
- **Persona Question Playbooks** (sample prompts per role).
- **Quick-Reference Guides** + session recordings.

### 8.5 Roles & Responsibilities

| Role | Responsibility at Training |
|---|---|
| Finance Domain Lead (SCA) | Leads finance-user and executive training; teaches the Nexora flow and guardrails |
| Customer Success (SCA) | Owns schedule, attendance, trust-literacy content, recordings, and handouts |
| Solutions Architect (SCA) | Delivers the Administrator session (ClientConfig stewardship, roles, connectors, token rotation) |
| Data Engineer (SCA) | Seeds the training environment with the client's validated data |
| Client Personas (Exec, Finance, Dept Leaders, Admin) | Attend; complete competency checks; raise data/trust questions |

---

## 9. Go Live Preparation

The readiness gate that converts a configured tenant into a production-trusted one. Go-live is approved only when data, config, access, and training criteria are all green.

### 9.1 Go-Live Readiness Criteria

| Domain | Criterion | Owner |
|---|---|---|
| Data | All in-scope facts/dims loaded; periods complete | Data Engineer |
| Validation | All 8 validators run; errors resolved, warnings reviewed | Data Engineer |
| Config | ClientConfig signed off; modules & agents active | Solutions Architect |
| Security | Security Review signed; tokens scoped; isolation verified | Solutions Architect |
| Access | Users provisioned least-privilege via Nexora roles + `clientId` isolation (live control); Clerk org binding designed but **not required today — Clerk not live** | Solutions Architect |
| Training | All personas trained; playbooks distributed | Customer Success |
| Trust | Sample real questions return cited, correct answers | Finance Domain Lead |

> **Validation note:** Nexora's 8 validators (required-fields, period, cost-center, account, department, duplicate, anomaly, alignment) gate data quality. **Errors block; warnings require review.** No tenant goes live with unresolved blocking errors.

### 9.2 Checklist

- [ ] Full data load complete for all in-scope modules and periods.
- [ ] All 8 validators executed; zero blocking errors; warnings triaged.
- [ ] ClientConfig final, version-controlled, signed off.
- [ ] Security Review signed; Token Inventory current.
- [ ] All users provisioned least-privilege via Nexora roles + `clientId` isolation (live control); Clerk org binding designed for later (not a present-day gate — Clerk not installed).
- [ ] All persona training delivered.
- [ ] **Trust acceptance test:** sponsor/finance lead ask N real questions and accept the answers (cited, fact-vs-interpretation clear).
- [ ] Cutover plan, comms, and rollback/fallback agreed (Databricks ↔ SQLite fallback understood).
- [ ] Hypercare team, hours, and channel confirmed.
- [ ] Go/No-Go decision recorded by the steering committee.

### 9.3 Meeting Agenda — Go/No-Go Review (45 minutes)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:10 | Readiness criteria walkthrough | Engagement Lead | Status visible |
| 0:10–0:20 | Data & validation status | Data Engineer | Quality confirmed |
| 0:20–0:30 | Trust acceptance test results | Finance Domain Lead | Answers accepted |
| 0:30–0:40 | Security, access, cutover, rollback | Solutions Architect | Risks cleared |
| 0:40–0:45 | Go/No-Go decision | Steering Committee | Decision logged |

### 9.4 Required Documentation

- **Go-Live Readiness Record** (criteria + sign-offs).
- **Cutover & Rollback Plan**.
- **Trust Acceptance Test Results**.
- **Hypercare Plan** (team, hours, channel, SLAs).

### 9.5 Roles & Responsibilities

| Role | Responsibility at Go Live Preparation |
|---|---|
| Engagement Lead (SCA) | Owns the readiness gate and Go/No-Go; records the decision |
| Data Engineer (SCA) | Confirms full data load and that all 8 validators pass (no blocking errors) |
| Solutions Architect (SCA) | Confirms ClientConfig sign-off, security, access, and cutover/rollback (incl. Databricks↔SQLite fallback) |
| Finance Domain Lead (SCA) | Runs the trust acceptance test with the client |
| Customer Success (SCA) | Confirms training complete; stands up the Hypercare Plan |
| Steering Committee (Sponsor, PL, EL, SA, CS) | Makes and records the Go/No-Go decision |

---

## 10. Post Go Live Review (Hypercare & Success Metrics)

After go-live, the engagement enters **hypercare** — heightened support — then transitions to steady-state Customer Success. This section ensures adoption sticks and value is measured. (Longer-term optimization & expansion is Phase 10 in `02-implementation-playbook.md` and the operating model in `07-multi-tenant-client-operating-model.md`.)

### 10.1 Hypercare

| Element | Default |
|---|---|
| Duration | 2 weeks post go-live (extendable) |
| Daily touchpoint | 15-min check-in with client project lead |
| Response | Priority triage of questions, data issues, trust concerns |
| Exit criteria | Stable usage, no open blocking issues, adoption metrics on track |

### 10.2 Success Metrics

| Metric | Definition | Target |
|---|---|---|
| Activation | % provisioned users who asked ≥1 question | [≥80%] |
| Trust | % answers accepted without escalation/dispute | [≥90%] |
| Direct-answer ratio | Questions answered directly vs. routed to manual analysis | [↑ over time] |
| Data quality | Records passing validation without errors | [≥99%] |
| Time-to-answer | Median question → answer latency | [baseline + trend] |
| Sponsor satisfaction | Sponsor CSAT at hypercare exit | [≥4/5] |

### 10.3 Checklist

- [ ] Hypercare schedule and channel live from day one.
- [ ] Issue log triaged daily; trends reviewed.
- [ ] Success metrics instrumented and baselined.
- [ ] Adoption gaps addressed (targeted refreshers per persona).
- [ ] Hypercare exit review held; criteria met.
- [ ] Formal handover to steady-state Customer Success.
- [ ] Expansion opportunities logged (additional modules/agents/BUs).
- [ ] Lessons learned captured and fed back into this playbook.

### 10.4 Meeting Agenda — Hypercare Exit & Value Review (45 minutes)

| Time | Segment | Lead | Outcome |
|---|---|---|---|
| 0:00–0:10 | Usage & adoption metrics | Customer Success | Adoption assessed |
| 0:10–0:20 | Open issues & resolution | Engagement Lead | Issues closed/owned |
| 0:20–0:30 | Trust & value review | Finance Domain Lead | Value confirmed |
| 0:30–0:40 | Steady-state handover & cadence | Customer Success | CS owns relationship |
| 0:40–0:45 | Expansion & next steps | Engagement Lead | Roadmap seeded |

### 10.5 Required Documentation

- **Hypercare Exit Report** (metrics, issues, decision).
- **Success Metrics Dashboard/Scorecard**.
- **Lessons Learned Log**.
- **Expansion Opportunities Register**.

### 10.6 Roles & Responsibilities

| Role | Responsibility at Post Go Live Review |
|---|---|
| Customer Success (SCA) | Owns hypercare, adoption metrics, and the steady-state handover |
| Engagement Lead (SCA) | Chairs the exit review; closes/owns open issues; seeds expansion roadmap |
| Finance Domain Lead (SCA) | Reviews trust and realized value with the client |
| Data Engineer (SCA) | Investigates residual data-quality issues; confirms validation health |
| Client Project Lead | Joins daily check-ins; confirms exit criteria and steady-state ownership |

---

## 11. Master Onboarding Checklist (Consolidated, Phase-Tagged)

Phase tags reference the canonical 10 implementation phases (see `02-implementation-playbook.md`).

**Kickoff & Alignment — Phases 1 (Discovery)**
- [ ] Sales-to-Implementation Handoff ratified
- [ ] Kickoff held; Engagement Charter signed
- [ ] Stakeholder map & decision-rights matrix complete
- [ ] SMEs named per data domain
- [ ] Fiscal calendar & close schedule captured

**Data & Architecture — Phases 2–3 (Data Assessment, Connection Layer)**
- [ ] System inventory & connector map complete (live vs. staged flagged)
- [ ] Data Access Request scoped & approved
- [ ] Scoped read-only Databricks token issued / secure file transfer live
- [ ] Connectivity smoke test passed
- [ ] `clientId` isolation applied to inbound data
- [ ] Data refresh plan agreed

**Validation & Governance — Phase 4**
- [ ] All in-scope data loaded
- [ ] 8 validators run; blocking errors resolved; warnings reviewed

**Configuration — Phase 5 (Finance Intelligence Configuration)**
- [ ] ClientConfig authored across all workshops (zero code changes)
- [ ] Modules activated; agents enabled with guardrails reaffirmed
- [ ] ClientConfig version-controlled & signed off

**Experience — Phase 6 (Dashboard & Executive Experience)**
- [ ] Executive reporting & dashboards validated against outcomes
- [ ] Trust signals (citations, confidence, fact-vs-interpretation) verified

**Access & Security — Phase 7 (User Access & Security)**
- [ ] Security Review signed by client IT/security
- [ ] Users provisioned least-privilege via Nexora roles + `clientId` isolation (live control); Clerk org binding designed for later (target-state, not live today)
- [ ] User Access Register complete

**Training & Adoption — Phase 8**
- [ ] Persona training delivered (Exec, Finance, Dept Leaders, Admin)
- [ ] Playbooks & quick-reference guides distributed

**Go Live — Phase 9**
- [ ] Go-Live readiness criteria all green
- [ ] Trust acceptance test passed
- [ ] Cutover & rollback plan agreed
- [ ] Go/No-Go decision logged

**Optimization & Expansion — Phase 10**
- [ ] Hypercare delivered; exit criteria met
- [ ] Success metrics baselined & trending to target
- [ ] Steady-state handover to Customer Success
- [ ] Lessons learned & expansion opportunities logged

---

## 12. Roles & Responsibilities (RACI)

**Legend:** R = Responsible · A = Accountable · C = Consulted · I = Informed
**SCA roles:** EL = Engagement Lead · SA = Solutions Architect · DE = Data Engineer · FDL = Finance Domain Lead · CS = Customer Success
**Client roles:** SP = Sponsor · PL = Project Lead · IT = IT/Security · FIN = Finance/FP&A SME

| Onboarding activity | EL | SA | DE | FDL | CS | SP | PL | IT | FIN |
|---|---|---|---|---|---|---|---|---|---|
| Kickoff & charter | A/R | C | I | C | C | C | R | I | I |
| Stakeholder alignment | A | C | I | C | R | C | R | C | C |
| Data access (tokens, transfer) | A | C | R | I | I | I | C | R | C |
| System inventory | I | A | R | C | I | I | C | C | R |
| Security review | A | R | C | I | I | I | I | R | I |
| User provisioning | I | A/R | C | I | C | I | C | R | I |
| Configuration workshops | A | R | C | R | C | C | C | I | R |
| Module & agent selection | A | R | I | C | C | R | C | I | C |
| Training (by persona) | I | C | I | A/R | R | C | C | C | C |
| Go-live readiness & Go/No-Go | A/R | C | C | C | C | R | C | C | C |
| Hypercare | C | C | C | C | A/R | I | R | I | C |
| Success metrics & handover | A | I | I | C | R | C | R | I | C |

> Exactly one **A** per activity ensures clear accountability. The Engagement Lead is accountable for the engagement; the Solutions Architect for the build; Customer Success for adoption.

---

## 13. Communication Cadence

| Forum | Frequency | Owner | Audience | Purpose / Output |
|---|---|---|---|---|
| Delivery standup | Daily (≤15 min) | Engagement Lead | SCA delivery team | Unblock, track actions |
| Client working sessions | As scheduled per phase | Solutions Architect | SCA + client SMEs | Execute config/data work |
| Weekly status report | Weekly | Engagement Lead | Sponsor, PL, delivery team | Progress, risks, asks (template below) |
| Steering committee | Bi-weekly | Engagement Lead | Sponsor, PL, EL, SA, CS | Decisions, scope, Go/No-Go |
| Hypercare check-in | Daily during hypercare | Customer Success | PL, key users | Triage, adoption |
| Executive readout | At go-live & hypercare exit | Engagement Lead | Sponsor & execs | Value, outcomes |

### 13.1 Escalation Path

| Level | Trigger | Route | Response time |
|---|---|---|---|
| L1 — Working | Day-to-day blocker | Working session / standup | Same day |
| L2 — Engagement | Scope, timeline, or data-access risk | Engagement Lead ↔ Project Lead | 1 business day |
| L3 — Steering | Decision needed, milestone at risk | Steering committee | Next steering / ad-hoc |
| L4 — Executive | Material risk to go-live/value | Sponsor ↔ SCA leadership | Immediate |

> **Weekly Status Report Template**
> - **Period:** [WEEK OF]
> - **Overall RAG:** [Green / Amber / Red]
> - **Accomplished:** [LIST]
> - **Planned next week:** [LIST]
> - **Risks/issues:** [LIST + owner + due]
> - **Client asks:** [DECISIONS / DATA / ACCESS NEEDED]
> - **Milestone status:** [ON TRACK / AT RISK / SLIPPED]

---

## 14. Typical Onboarding Timeline

A representative timeline for a standard engagement. Compresses or extends with scope and client readiness; data access and SME availability are the most common drivers of slippage.

| Week | Focus | Key milestones | Lead role |
|---|---|---|---|
| 1 | Kickoff & Alignment | Charter signed; stakeholder map; SMEs named | Engagement Lead |
| 2 | Data Access & Inventory | Scoped token issued; connector map; smoke test passed | Data Engineer |
| 3 | Data Load & Validation | In-scope data loaded; 8 validators run | Data Engineer |
| 4 | Configuration Workshops 7A–7B | Config foundations & dimensional structure | Solutions Architect |
| 5 | Configuration Workshops 7C–7D | Forecast/budget; modules & agents; ClientConfig signed | Solutions Architect |
| 6 | Security & Provisioning | Security review signed; users provisioned (Nexora roles + `clientId`); Clerk org binding designed (target-state, not live) | Solutions Architect |
| 7 | Training | Exec, Finance, Dept Leader, Admin sessions | Finance Domain Lead |
| 8 | Go-Live Prep & Go-Live | Readiness gate; trust acceptance; Go/No-Go; cutover | Engagement Lead |
| 9–10 | Hypercare & Review | Daily check-ins; metrics; exit; CS handover | Customer Success |

### 14.1 ASCII Gantt

```text
Week           1   2   3   4   5   6   7   8   9   10
Kickoff/Align  ███
Data Access        ███
Load/Validate          ███
Config 7A-7B               ███
Config 7C-7D                   ███
Security/Prov                      ███
Training                               ███
Go-Live Prep                               ███
Hypercare/Review                               ███████
```

---

## 15. Onboarding Exit & Definition of Done

Onboarding is complete — and the engagement transitions to the steady-state operating model (`07-multi-tenant-client-operating-model.md`) — when **all** of the following hold:

- [ ] ClientConfig live, signed off, and version-controlled (zero code changes to onboard).
- [ ] All in-scope data loaded, validated (no blocking errors), and `clientId`-isolated.
- [ ] Security review signed; tokens scoped and rotating; secrets env-only.
- [ ] All users provisioned least-privilege via Nexora roles + `clientId` row-level isolation (the live access control); Clerk Organization binding designed and recorded for execution when Clerk is installed (target-state — not a present-day gate).
- [ ] All personas trained; playbooks distributed.
- [ ] Trust acceptance passed — the client asks real questions and accepts cited, correct answers.
- [ ] Hypercare exited with success metrics baselined and on track.
- [ ] Customer Success owns the relationship; expansion opportunities logged.

> **The test of done is the product's promise:** the client asks a finance question and Nexora returns Question → Relevant Data → AI Analysis → Direct Answer — grounded, cited, and trusted. When that is routine, onboarding is complete.

---

*End of Deliverable 3 — Client Onboarding Playbook.*
