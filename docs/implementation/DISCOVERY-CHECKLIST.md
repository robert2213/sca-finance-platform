# Discovery Checklist

**Owner:** Sin City Analytics — Implementation Lead
**When:** Phase 1 of the [Implementation Playbook](IMPLEMENTATION-PLAYBOOK.md), first 1–2 sessions after signature.
**Goal:** Capture everything needed to configure `src/config/client.config.ts`, plan the data mapping, and score the client with the [Readiness Assessment](CLIENT-READINESS-ASSESSMENT.md).

Use this as a live document during the discovery call. Fill answers inline. Anything left blank becomes an open item tracked in the [Playbook](IMPLEMENTATION-PLAYBOOK.md) Phase 1 outputs.

---

## How to run the session

- **Length:** one 90-minute working session, plus one 30-minute follow-up for gaps.
- **Who from the client:** Finance/FP&A lead (required), a data/IT contact who can export GL and HR data (required), and the executive sponsor (15 min, optional).
- **What you leave with:** enough to draft the client config, a list of source systems and sample exports, and a complexity score.

Keep it conversational. The checklist exists so nothing is missed — not so the call becomes an interrogation.

---

## 1. Company Overview

| Item | Capture | Notes |
|---|---|---|
| Legal / display name | | Becomes `clientName` in `client.config.ts` |
| Short slug (lowercase, no spaces) | | Becomes `clientId` — used as the Databricks partition / tenant key |
| Industry | | Frames benchmarks and vendor categories |
| Approx. annual IT/finance spend under management | | Sanity-checks data volume vs. the ~1,080-row demo |
| Reporting currency | | Today the platform assumes `USD`; flag if anything else |
| Fiscal year start month | | Becomes `fiscalYearStart`; drives YTD math |
| Brand color (hex) + logo file | | `primaryColor` + `logoPath` for theming |

---

## 2. Stakeholders

| Role | Name | Decision authority | Notes |
|---|---|---|---|
| Executive sponsor (CFO/CIO) | | Sign-off on go-live | |
| Finance/FP&A lead (day-to-day owner) | | Approves mapping & validation | |
| Data/IT contact (exports, access) | | Provides source data | |
| Dashboard end users | | Who logs in daily | |
| Agent end users | | Who asks the AI questions | |

Capture **one** accountable owner per area. Onboarding stalls most often on "who can actually export the GL."

---

## 3. Finance Team Structure

- How is the finance team organized (corporate FP&A, BU-aligned, shared services)?
- Who owns the budget for each cost center?
- How many business units and cost centers exist? (These populate `businessUnits`, `costCenters`, `departments` in the client config.)
- Is there an existing chart of accounts we can import as `chartOfAccounts`?
- Map of **Business Unit → Department → Cost Center** — request as a spreadsheet. This is the org backbone the validators cross-check against.

---

## 4. Reporting Cadence

- What is the monthly close timeline (e.g., close by business day 5)?
- When are actuals final and available for export each month?
- What reports are produced monthly / quarterly, and for whom?
- Which periods need to be live at launch? (Becomes `reportingPeriods`, e.g. `["2026-01" … "2026-12"]`.)
- Is reporting currently in Excel, a BI tool, or a planning system?

---

## 5. Budget Process

- How is the annual budget built (top-down, bottom-up, driver-based)?
- What system holds the approved budget (Excel, Adaptive, Anaplan, NetSuite)?
- Granularity: by cost center? by account? by month or annual-only?
- How often is the budget re-baselined?
- Can they export budget at the **cost-center × period** grain? (Required for the `budget` data type and all variance math.)

---

## 6. Forecast Process

- Do they run a rolling forecast? What cycles (3+9, 6+6, 9+3)? → `forecastCycles`.
- Who owns the forecast and how often is it refreshed?
- Is forecast stored separately from budget, or as a budget revision?
- Granularity and export feasibility (same questions as budget).
- **Note:** forecast rows load as `transaction_type='forecast'`. Current dashboards/KPIs filter on `('actual','budget')`, so confirm whether forecast visibility is in-scope for launch or a later enhancement.

---

## 7. Executive Reporting Process

- What does the CFO/CIO see today, and how often?
- Is there a standard board/exec package? Request a sample (redacted).
- What are the 5–10 headline metrics leadership cares about?
- Narrative vs. numbers: do they want commentary, or just the figures?
- This scopes the `executive_reporting` module and the `cfo` agent's framing.

---

## 8. Current Pain Points

Open-ended — let them talk. Probe for:

- Where does the monthly close lose the most time?
- What question can leadership *never* get answered quickly today?
- Where do manual spreadsheets break or drift?
- What surprised them (over-budget, contractor burn, a renewal they missed) in the last year?
- Each pain point should map to a module and an agent (see table below) so we can demo the fix.

| Pain point | Nexora module | Agent that addresses it |
|---|---|---|
| "We find out we're over budget too late" | `actuals` | `fpa` (variance) |
| "Vendor renewals sneak up on us" | `vendors` | `procurement` |
| "Contractor spend is a black box" | `external_labor` | `external-labor` |
| "Headcount plan vs. actual is manual" | `headcount` | `headcount` |
| "Exec reporting takes a week to assemble" | `executive_reporting` | `cfo` |
| "Budget owners can't self-serve answers" | `agents` | `finance-bp` |

---

## 9. Existing Analytics Environment

- Current BI/reporting tools (Power BI, Tableau, Looker, Excel)?
- Is there a data warehouse already (Databricks, Snowflake, BigQuery)?
  - If **Databricks**: capture host / HTTP path / catalog — the platform connects natively. (See `docs/DATABRICKS-SCHEMA.md`.)
  - If **other or none**: the upload pipeline (CSV/Excel) is the launch path; warehouse connector is a later phase.
- Source systems for each data type (see [Data Mapping Template](DATA-MAPPING-TEMPLATE.md)):

| Data type | Typical source | Connector status today |
|---|---|---|
| GL actuals | NetSuite / QuickBooks / SAP export | Stub — use CSV/Excel upload |
| Budget | Adaptive / Excel | Stub — use upload |
| Forecast | Adaptive / Excel | Stub — use upload |
| Headcount | Workday / HRIS export | Stub — use upload |
| Vendors | Coupa / AP export | Stub — use upload |
| External labor | Beeline / Fieldglass (VMS) | Stub — use upload |

> All direct connectors are registry stubs today (`src/lib/ingestion/connectors/`). **Launch assumes CSV/Excel upload.** Set connector expectations accordingly — do not promise a live integration in the first implementation unless it is explicitly scoped and staffed.

---

## 10. Data Access & Security

- Who can grant export access to each source system, and how long does provisioning take?
- Any data-residency, PII, or compliance constraints (salary data in `headcount` especially)?
- Preferred delivery: secure file drop, or eventual warehouse connection?
- Note: authentication is not yet wired in the platform (`docs/SECURITY.md`). For pilots, confirm the access model with the sponsor.

---

## Discovery Output (hand to Phase 2)

By the end of discovery you should be able to produce:

- [ ] Draft values for every field in `client.config.ts` (`clientId`, `clientName`, `fiscalYearStart`, `reportingPeriods`, `forecastCycles`, `businessUnits`, `costCenters`, `departments`, `chartOfAccounts`, `activeModules`, `agents`).
- [ ] A list of source systems + a sample export for each in-scope data type.
- [ ] An org map (BU → Department → Cost Center) and chart of accounts.
- [ ] The 5–10 metrics leadership cares about.
- [ ] A first-pass [Client Readiness](CLIENT-READINESS-ASSESSMENT.md) score → complexity tier → timeline track.
- [ ] A written list of open items and who owns each.
