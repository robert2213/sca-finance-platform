# Data Mapping Template

**Owner:** Sin City Analytics — Implementation Lead + client data contact
**When:** Phase 3 of the [Implementation Playbook](IMPLEMENTATION-PLAYBOOK.md).
**Goal:** Map every client source field to the Nexora canonical model so the upload pipeline parses, validates, and loads it cleanly into `fact_transactions` (and the dimension tables).

This template is the contract between *the client's spreadsheets* and *how Nexora stores data*. Fill one mapping table per data type. The canonical fields below come directly from `src/lib/models/finance.types.ts` and the mappers in `src/lib/ingestion/mappers/`.

---

## How mapping works in Nexora

```
Client export (CSV/Excel)
   ↓  parsers/         raw string rows
   ↓  mappers/         → canonical typed records   ← THIS DOCUMENT defines the column match
   ↓  validation/      → ValidationResult (errors block, warnings flag)
   ↓  financial stage  → fact_transactions (Databricks)
   ↓  dashboards + agents
```

Two facts that make mapping forgiving:

1. **Mappers accept aliases.** Both `snake_case` and `camelCase` are recognized (`business_unit` and `businessUnit`), so the client's header does not need to match exactly — it needs to be *recognizable*. Unrecognized columns are ignored and the field defaults to empty/zero, surfaced in `result.warnings`.
2. **Nothing throws.** A bad row becomes a warning or a blocking error in the `ValidationResult`, never a crash. Mapping mistakes are visible, not silent failures.

---

## Mapping table — fill one per data type

For each in-scope data type, complete this table. Copy it once per source file.

| Client Field | Source System | Business Definition | Canonical Field | Required? | Transformation Logic | Validation Rules |
|---|---|---|---|---|---|---|
| | | | | | | |

Column meanings:

- **Client Field** — the exact header in the client's export.
- **Source System** — where it comes from (NetSuite, Workday, Excel, etc.).
- **Business Definition** — what the client means by it, in their words.
- **Canonical Field** — the Nexora field it maps to (use the catalogs below).
- **Required?** — `Yes` if a validator blocks the row without it; `No` otherwise.
- **Transformation Logic** — any reshaping (date reformat, sign flip, code lookup, unit conversion).
- **Validation Rules** — which validator checks it and what "valid" means.

---

## Canonical model reference

Every record carries these **common fields** (from `finance.types.ts`). These are usually set by the upload context, not mapped from a column:

| Canonical Field | Type | Source |
|---|---|---|
| `clientId` | string | From active client config — not in the file |
| `period` | string `"YYYY-MM"` | Mapped from the client's fiscal-month column |
| `source` | `upload` \| `seed` \| `connector` | Set to `upload` by the pipeline |
| `validationStatus` | `pass`/`warn`/`error` | Set by the validation runner |

### Data type → canonical entity → key fields

| Data type (`dataType`) | Canonical entity | Required key fields | Loads as |
|---|---|---|---|
| `gl-actuals` | `ActualEntry` | `period`, `cost_center_id` | `transaction_type='actual'` |
| `budget` | `BudgetEntry` | `period`, `cost_center_id` | `transaction_type='budget'` |
| `forecast` | `ForecastEntry` | `period`, `cost_center_id` | `transaction_type='forecast'` |
| `headcount` | `HeadcountRecord` | `position_id` | dimension / `dim_headcount` |
| `vendors` | `VendorSpendRecord` | `vendor_id` or `vendor_name` | dimension / `dim_vendor` |
| `external-labor` | `ExternalLaborRecord` | `contractor_id` or `name` | dimension / `dim_contractor` |

---

## Canonical field catalog (what you can map to)

**ActualEntry / BudgetEntry / ForecastEntry** (financial facts → `fact_transactions`):

| Canonical Field | Meaning |
|---|---|
| `period` | ISO fiscal month `"2026-06"` |
| `costCenterId` | Cost center owning the spend |
| `accountCode` | GL account code (cross-checked vs. chart of accounts) |
| `businessUnit` | Top-level reporting segment |
| `amountActual` | Actual spend (ActualEntry) |
| `amountBudget` | Approved budget (BudgetEntry / ActualEntry) |
| `amountForecast` | Forecast amount (ForecastEntry) |
| `forecastCycle` | `3+9` / `6+6` / `9+3` (ForecastEntry) |
| `variance`, `variancePct` | Derived on ActualEntry if not supplied |

**HeadcountRecord:** `positionId`, `title`, `status`, `annualSalary`, `costCenterId`, `businessUnitId`.

**VendorSpendRecord:** `vendorId`/`vendorName`, `category`, `annualValue`, `ytdSpend`, `contractEnd`.

**ExternalLaborRecord:** `contractorId`/`name`, `monthlyRate`, `contractValue`, `ytdSpend`, `costCenterId`.

---

## Worked examples (the three canonical mappings)

These are the examples every implementer should internalize. They show the typical client-header → canonical pattern.

### Example A — Fiscal Month → `period`

| Client Field | Source System | Business Definition | Canonical Field | Required? | Transformation Logic | Validation Rules |
|---|---|---|---|---|---|---|
| `Fiscal Month` | NetSuite GL export | The accounting month the entry posts to | `period` | **Yes** | Reformat `Jun-2026` / `06/2026` → ISO `2026-06` | `period.validator` — must be ISO `YYYY-MM` **and** within `config.reportingPeriods` |

### Example B — Department → Cost Center

| Client Field | Source System | Business Definition | Canonical Field | Required? | Transformation Logic | Validation Rules |
|---|---|---|---|---|---|---|
| `Department` | NetSuite GL export | The owning department of the cost | `costCenterId` | **Yes** | Look up department name → cost center ID via the org map from discovery | `cost-center.validator` — ID/name must exist in `config.costCenters`; `department.validator` checks `config.departments` |

> Many clients track spend at the *department* grain while Nexora's fact grain is the *cost center*. Resolve this in discovery: either (a) treat each department as a cost center, or (b) provide a department→cost-center crosswalk applied as transformation logic.

### Example C — Actual Spend → `amountActual`

| Client Field | Source System | Business Definition | Canonical Field | Required? | Transformation Logic | Validation Rules |
|---|---|---|---|---|---|---|
| `Actual Spend` | NetSuite GL export | Posted actual dollar amount for the period | `amountActual` | **Yes** | Strip `$`/commas → number; flip sign if credits are negative | `anomaly.validator` — flags negatives and Z-score > 3 outliers as **warnings** (non-blocking); `required-fields.validator` blocks if empty |

---

## Validator reference (what each rule enforces)

From `src/lib/validation/validators/`. Errors **block** the row; warnings **flag** it for review.

| Validator | Checks | Severity |
|---|---|---|
| `required-fields` | Required canonical fields present & non-empty | Error |
| `period` | ISO `YYYY-MM` and within `config.reportingPeriods` | Error |
| `cost-center` | Cost center exists in `config.costCenters` | Error / Warn |
| `account` | GL code exists in `config.chartOfAccounts` | Error / Warn |
| `department` | Department exists in `config.departments` | Warn |
| `duplicate` | Duplicate key combos within one upload | Error |
| `anomaly` | Negative amounts, statistical outliers (Z > 3.0) | Warn |
| `alignment` | Actual vs. budget variance threshold; forecast drift | Warn |

**Implication for mapping:** any field a *blocking* validator checks must be mapped and clean before initial load, or those rows quarantine. Warning-level fields can be refined after launch.

---

## Mapping workflow

1. Collect a real sample export (≥ 1 full period) for each in-scope data type.
2. Fill the mapping table for that file using the catalogs above.
3. Confirm every **required** field has a source and a transformation rule.
4. Confirm `period` and `costCenterId` resolve cleanly — they gate the most validators.
5. Ensure `config.costCenters`, `config.chartOfAccounts`, `config.departments`, `config.reportingPeriods` in the client config match the values the data will contain — validators cross-check against them.
6. Dry-run the file through upload in a staging client config; review `ValidationResult` errors/warnings.
7. Iterate transformation logic until errors are zero and warnings are understood.
8. Sign off the mapping with the client's finance lead before Phase 4 (Initial Load).

---

## Open mapping questions to resolve before load

- [ ] Is the client's spend grain cost-center or department? (See Example B note.)
- [ ] Are credits negative? Does sign need flipping?
- [ ] Does the budget export carry the same cost-center IDs as the GL? (Variance math needs them aligned.)
- [ ] Are all periods in the file inside `config.reportingPeriods`?
- [ ] Do GL account codes match `config.chartOfAccounts`, or is a crosswalk needed?
- [ ] Is forecast in-scope at launch (note the `transaction_type='forecast'` dashboard filter)?
