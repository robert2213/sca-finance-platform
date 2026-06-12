# Client Readiness Assessment

**Owner:** Sin City Analytics — Implementation Lead
**When:** End of Phase 1 Discovery in the [Implementation Playbook](IMPLEMENTATION-PLAYBOOK.md).
**Purpose:** A lightweight 1–5 scoring framework that turns the discovery findings into a complexity tier and a recommended [timeline track](IMPLEMENTATION-TIMELINE.md).

Score five categories from 1 (low) to 5 (high). Higher scores = **better readiness / lower complexity** in some categories, and the opposite in others — so each category states its direction. Total the points and read the tier.

> This is a planning tool, not a gate. A low score doesn't disqualify a client — it sets the right track and surfaces the work to do before go-live.

---

## How to score

For each category, pick the row that best matches what you learned in discovery. Record the score and a one-line justification. Use the [Discovery Checklist](DISCOVERY-CHECKLIST.md) answers as evidence.

---

## 1. Data Quality

*How clean and consistent is the client's financial data?*

| Score | Description |
|---|---|
| 5 | Consistent structure, validated at source, few/no manual adjustments. Maps cleanly to canonical fields. |
| 4 | Mostly clean; minor formatting fixes (date formats, sign conventions). |
| 3 | Workable but needs real transformation — code crosswalks, department→cost-center mapping. |
| 2 | Inconsistent across periods/systems; many manual journal adjustments; gaps in cost-center/account coding. |
| 1 | Largely unstructured or spreadsheet-driven with no stable keys. Significant cleanup before mapping. |

**Maps to:** mapping effort (Phase 3) and validation iteration (Phase 5). Low scores mean more time on the [Data Mapping Template](DATA-MAPPING-TEMPLATE.md) and resolving validator errors.

---

## 2. Data Accessibility

*How easily can the client extract the data Nexora needs?*

| Score | Description |
|---|---|
| 5 | Self-serve exports for every data type today, or a live Databricks warehouse ready to connect. |
| 4 | Exports available on request, fast turnaround, clear owner. |
| 3 | Exports possible but require IT effort/scheduling; one owner per system identified. |
| 2 | Access is fragmented across teams; provisioning takes weeks; some systems unclear. |
| 1 | No clear export path for one or more in-scope data types; gatekeeping or tooling gaps. |

**Maps to:** Phase 2 Data Inventory risk. Remember: all direct connectors are stubs today — launch is CSV/Excel **upload**. A live warehouse (Databricks) is the only "connected" path currently supported, and even then load is via the upload pipeline.

---

## 3. Reporting Maturity

*How developed is the client's existing actuals/budget reporting?*

| Score | Description |
|---|---|
| 5 | Disciplined monthly close, defined chart of accounts, clear BU→Dept→Cost Center hierarchy. |
| 4 | Solid close and budget process; minor hierarchy ambiguity. |
| 3 | Reporting exists but lives in spreadsheets; hierarchy needs to be formalized for the config. |
| 2 | Ad-hoc reporting; cost-center/account structure inconsistent or incomplete. |
| 1 | No repeatable reporting process; structure must be built during onboarding. |

**Maps to:** how readily `businessUnits`, `costCenters`, `departments`, `chartOfAccounts`, and `reportingPeriods` can be filled in the client config. Low maturity means the org map itself becomes a discovery deliverable.

---

## 4. Forecast Maturity

*Does the client run a forecast process Nexora can represent?*

| Score | Description |
|---|---|
| 5 | Rolling forecast on defined cycles (3+9 / 6+6 / 9+3), owned and refreshed on cadence. |
| 4 | Regular forecast, lightly structured cycles. |
| 3 | Periodic reforecast, not on fixed cycles. |
| 2 | Occasional/annual reforecast only. |
| 1 | No forecast process. |

**Maps to:** whether the `forecast` data type and `forecastCycles` are in scope at launch. **Note:** forecast rows load as `transaction_type='forecast'`, which current KPI/dashboard queries filter out (`IN ('actual','budget')`). If forecast maturity is high and forecast visibility matters, flag it — it's a product enhancement, not a config toggle, so set expectations early.

---

## 5. Stakeholder Alignment

*Is the client organized to make decisions and adopt the platform?*

| Score | Description |
|---|---|
| 5 | Engaged executive sponsor, one accountable finance owner, named end users, clear success definition. |
| 4 | Sponsor + owner engaged; success criteria mostly defined. |
| 3 | Owner identified; sponsor light-touch; success criteria fuzzy. |
| 2 | Diffuse ownership; competing priorities; unclear who signs off. |
| 1 | No clear owner or sponsor; adoption risk is high. |

**Maps to:** go-live risk (Phase 8) and the speed of every sign-off (mapping, validation, dashboards). Misalignment slips timelines more than data ever does.

---

## Scoring & complexity tiers

Add the five scores (range **5–25**). Because high scores mean *better readiness*, complexity is **inverse** to the total:

| Total score | Complexity | Recommended track |
|---|---|---|
| **20–25** | **Low Complexity** | [Fast-track — 2 weeks](IMPLEMENTATION-TIMELINE.md#fast-track-implementation--2-weeks) |
| **12–19** | **Medium Complexity** | [Standard — 4 weeks](IMPLEMENTATION-TIMELINE.md#standard-implementation--4-weeks) |
| **5–11** | **High Complexity** | [Enterprise — 8 weeks](IMPLEMENTATION-TIMELINE.md#enterprise-implementation--8-weeks) |

**Override rules (judgment beats arithmetic):**

- Any **single category scoring 1–2** can pull the engagement up a tier regardless of total — a hard blocker in one area (e.g., no data access path) dominates.
- **More than 4 in-scope data types** → treat as at least Standard, usually Enterprise.
- **Multiple business units or multiple charts of accounts** → at least Standard.
- **A requested live connector** (vs. upload) is a separate workstream — score it outside this framework and staff it independently.

---

## Scorecard (copy per client)

```
Client: ____________________        Date: ____________        Scored by: ____________

1. Data Quality            [ 1  2  3  4  5 ]   Justification: ________________________
2. Data Accessibility      [ 1  2  3  4  5 ]   Justification: ________________________
3. Reporting Maturity      [ 1  2  3  4  5 ]   Justification: ________________________
4. Forecast Maturity       [ 1  2  3  4  5 ]   Justification: ________________________
5. Stakeholder Alignment   [ 1  2  3  4  5 ]   Justification: ________________________

TOTAL: ____ / 25     COMPLEXITY: Low / Medium / High     TRACK: Fast / Standard / Enterprise

Overrides applied: ____________________________________________________________________
Top 3 readiness gaps to close before go-live:
  1. _________________________________________________________________________________
  2. _________________________________________________________________________________
  3. _________________________________________________________________________________
```

---

## Using the result

- Feed the **track** into the [Implementation Timeline](IMPLEMENTATION-TIMELINE.md).
- Feed the **readiness gaps** into the Phase 1 open-items list in the [Playbook](IMPLEMENTATION-PLAYBOOK.md).
- Re-score if scope changes materially mid-engagement (e.g., a new data type or BU appears) — and adjust the track rather than silently absorbing the work.
