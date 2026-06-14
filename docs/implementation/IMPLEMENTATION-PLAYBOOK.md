# Implementation Playbook

**Owner:** Sin City Analytics — Implementation Lead
**Purpose:** The end-to-end methodology to take a client from signed agreement to successful go-live on the Nexora Finance Intelligence Platform — without building new software.

This playbook follows the platform exactly as it works today:

```
Discovery → Config → Mapping → Upload → Databricks (fact_transactions) → Dashboards → Agents → Go-Live
```

Each phase below lists **Objectives, Inputs, Outputs, and Success Criteria**. Companion documents:

- [Discovery Checklist](DISCOVERY-CHECKLIST.md) — Phase 1
- [Client Readiness Assessment](CLIENT-READINESS-ASSESSMENT.md) — Phase 1, scores complexity
- [Data Mapping Template](DATA-MAPPING-TEMPLATE.md) — Phase 3
- [Implementation Timeline](IMPLEMENTATION-TIMELINE.md) — schedules these phases by track

---

## Phase 0 — Kickoff (½ day)

Not a delivery phase, but do not skip it.

- Confirm signed agreement scope, the in-scope modules, and the named stakeholders.
- Agree the complexity track (Fast-track / Standard / Enterprise) — provisional until the readiness score in Phase 1.
- Book the discovery session and the data-export access requests (longest pole — start now).

---

## Phase 1 — Discovery

**Objectives**
- Understand the client's finance org, processes, pain points, and source systems.
- Capture every value needed to configure `src/config/client.config.ts`.
- Score the client and set the complexity tier + timeline track.

**Inputs**
- Signed agreement and scope.
- [Discovery Checklist](DISCOVERY-CHECKLIST.md).
- Stakeholder availability (finance lead, data/IT contact, sponsor).

**Outputs**
- Completed discovery checklist.
- Draft client config values (`clientId`, `clientName`, `fiscalYearStart`, `reportingPeriods`, `forecastCycles`, `businessUnits`, `costCenters`, `departments`, `chartOfAccounts`, `activeModules`, `agents`).
- Org map (BU → Department → Cost Center) and chart of accounts.
- Completed [Readiness Assessment](CLIENT-READINESS-ASSESSMENT.md) → complexity tier.
- Open-items list with owners.

**Success Criteria**
- [ ] Every client-config field has a draft value or a named owner to provide it.
- [ ] In-scope modules and agents are confirmed.
- [ ] Complexity tier and timeline track agreed with the sponsor.

---

## Phase 2 — Data Inventory

**Objectives**
- Enumerate every source system and obtain a real sample export per in-scope data type.
- Confirm the access path (file drop now; warehouse connector later, if scoped).

**Inputs**
- Discovery source-system list.
- Data/IT contact with export access.

**Outputs**
- One representative export (≥ 1 full period) for each in-scope `dataType`: `gl-actuals`, `budget`, `forecast`, `headcount`, `vendors`, `external-labor`.
- Documented source, owner, refresh cadence, and grain for each file.
- Volume estimate (rows/period) vs. the platform baseline (~1,080 demo rows).

**Success Criteria**
- [ ] A real sample exists for every in-scope data type (no placeholders).
- [ ] Each file's grain (period × cost center) is understood.
- [ ] No source system is "TBD" — every in-scope type has an identified export.

> **Connector reality check:** all direct connectors (`quickbooks`, `netsuite`, `workday`, `vms`, `databricks`, `coupa`, `adaptive`) are registry stubs today. Launch on CSV/Excel upload. Only promise a live connector if it is separately scoped and staffed.

---

## Phase 3 — Data Mapping

**Objectives**
- Map every source field to the Nexora canonical model.
- Align the client config's reference sets with the data the files contain.

**Inputs**
- Phase 2 sample exports.
- [Data Mapping Template](DATA-MAPPING-TEMPLATE.md).
- Draft client config from Phase 1.

**Outputs**
- A completed mapping table per data type (client field → canonical field, with transformation + validation rules).
- Finalized `config.costCenters`, `config.chartOfAccounts`, `config.departments`, `config.reportingPeriods` so validators cross-check correctly.
- Resolved mapping decisions (department vs. cost-center grain, sign conventions, code crosswalks).

**Success Criteria**
- [ ] Every **required** canonical field (`period`, `cost_center_id`, amounts) has a source and transformation rule.
- [ ] Client finance lead has signed off the mapping.
- [ ] A dry-run upload produces **zero blocking errors**; all warnings are explained.

---

## Phase 4 — Initial Load

**Objectives**
- Load mapped client data through the real pipeline into Databricks `fact_transactions` and the dimension tables.

**Inputs**
- Signed-off mapping.
- Finalized client config.
- Databricks connection (`DATABRICKS_HOST` / `DATABRICKS_TOKEN` / `DATABRICKS_HTTP_PATH`) for the client environment.

**Outputs**
- Client data loaded: financial facts as `transaction_type` `actual` / `budget` / `forecast`; dimensions in `dim_*`.
- Upload run records (rows received / validated / staged / rejected) per file.
- A loaded-row count reconciled against the source totals.

**Success Criteria**
- [ ] Upload returns `status:"staged"` with `stageBackend:"databricks"` (durable load, not in-memory fallback).
- [ ] Loaded financial totals reconcile to the source export (e.g., YTD actual matches the GL).
- [ ] Rejected rows are zero, or each rejection is understood and dispositioned.

> **Mechanics:** financial rows persist on the existing 15-column `fact_transactions` schema — migration 004 (ingestion-lineage columns) is **optional** and not required to load (see HANDOFF 11A.7.1). For a fresh environment, initialize tables via `/api/db/init` and verify with `/api/db/test` (see `docs/DATABRICKS-SCHEMA.md`). Re-uploads are INSERT-only today (no dedup) — load each period once.

---

## Phase 5 — Validation

**Objectives**
- Prove the loaded data is correct, complete, and trustworthy before anyone sees a dashboard.

**Inputs**
- Loaded data from Phase 4.
- Validation engine output (`ValidationResult` per upload).
- The 8 validators (`required-fields`, `period`, `cost-center`, `account`, `department`, `duplicate`, `anomaly`, `alignment`).

**Outputs**
- A validation report per data type (errors, warnings, row counts).
- Reconciliation of Nexora totals vs. the client's own monthly figures.
- A short data-quality summary for the finance lead (the `validation` agent can narrate this).

**Success Criteria**
- [ ] Zero blocking validation errors on loaded data.
- [ ] Warnings reviewed; each is either accepted or has a fix owner.
- [ ] Client finance lead confirms the numbers match their close (within an agreed tolerance).

---

## Phase 6 — Dashboard Review

**Objectives**
- Walk the client through the dashboards on *their* data and confirm the modules answer their reporting needs.

**Inputs**
- Validated data.
- Client config with the correct `activeModules` enabled.
- Phase 1 list of the 5–10 metrics leadership cares about.

**Outputs**
- A reviewed dashboard per active module (`actuals`, `budget`, `forecast`, `headcount`, `vendors`, `external_labor`, `cloud_spend`, `executive_reporting`).
- A punch-list of config tweaks (labels, BU/CC naming, color, module on/off).
- Sign-off that the headline metrics render correctly.

**Success Criteria**
- [ ] Every active module displays the client's real data correctly.
- [ ] Leadership's headline metrics are visible and accurate.
- [ ] Only **configuration** changes are required — no software changes requested (if a feature gap appears, log it as a product request, do not block go-live).

---

## Phase 7 — Agent Review

**Objectives**
- Confirm the AI agents answer the client's real questions directly from their loaded data — behaving like a finance analyst, not a report generator.

**Inputs**
- Validated data and reviewed dashboards.
- Enabled `agents` in client config (`cfo`, `fpa`, `procurement`, `headcount`, `external-labor`, `finance-bp`, `validation`).
- A list of 10–15 real questions the client wants answered (drawn from Phase 1 pain points).

**Outputs**
- A tested question set with each agent's answer reviewed for accuracy and grounding.
- Confirmation that answers cite the underlying data and respect the base guardrails (no fabricated numbers; data gaps flagged).
- Any prompt/guardrail tuning notes (configuration-level, via `AgentContext`).

**Success Criteria**
- [ ] Each in-scope agent answers its domain questions correctly from the client's data.
- [ ] Answers follow the `Question → Relevant Data → Analysis → Direct Answer` flow — not template-then-populate.
- [ ] No fabricated or unsourced figures; low-confidence/missing-data cases are flagged honestly.

---

## Phase 8 — Go Live

**Objectives**
- Transition the client to production use with a clear support and refresh model.

**Inputs**
- Signed-off validation, dashboards, and agents.
- Production client config and Databricks environment.
- Monthly data-refresh plan (who exports, when, how it's loaded).

**Outputs**
- Production deployment with the client config live (`src/app/layout.tsx` points at the client config).
- A documented monthly load runbook (export → upload → validate → confirm).
- Trained users (dashboard + agent) and a named support contact.
- A 30-day check-in scheduled.

**Success Criteria**
- [ ] Client is using the platform against live, validated data.
- [ ] The monthly refresh process has run successfully at least once with the client.
- [ ] Build is green and there are zero software regressions from onboarding (onboarding is config + data only).
- [ ] Sponsor signs off on go-live.

---

## Guardrails for the implementation team

- **Onboarding is configuration + data, never code.** A new client = a new `client.config.ts` + mapped data. If a client truly needs a code change, it is a product request handled outside the implementation, not inside it.
- **Upload-first.** Connectors are stubs; launch on CSV/Excel.
- **Validate before you reveal.** Never show a dashboard on un-reconciled data.
- **Agents answer questions.** Hold the line on the product's core behavior — direct answers from data, not auto-generated reports.
- **Load each period once.** Re-upload is INSERT-only; there's no dedup yet.
