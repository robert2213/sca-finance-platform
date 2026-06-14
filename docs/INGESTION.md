# Data Ingestion Pipeline

`src/lib/ingestion/` is the upload-to-typed-data pipeline. All paths return structured results — nothing throws silently.

## Flow

```
File (CSV or Excel)
  ↓
Parser  (csv.parser.ts / xlsx.parser.ts)
  → Record<string, string>[]   (raw rows, all values as strings)
  ↓
Mapper  (mappers/*.mapper.ts)
  → { data: TypedEntity[], warnings: string[] }
  ↓
Validator  (src/lib/validation/validation.runner.ts)
  → ValidationResult
  ↓
Writer / Store
```

## Orchestrator

`ingest.orchestrator.ts` → `ingestFile(content, filename, options)`

```typescript
const result = await ingestFile(csvString, "actuals.csv", {
  dataType: "gl-actuals",
  period:   "2026-06",
  clientId: "demo-client",
  source:   "upload",
});
// result.data   — typed ActualEntry[]
// result.warnings — array of non-fatal issues
// result.rowsParsed / rowsMapped — for progress display
```

Supported `dataType` values: `gl-actuals`, `budget`, `forecast`, `headcount`, `vendors`, `external-labor`

## Parsers

| File | Input | Output |
|---|---|---|
| `parsers/csv.parser.ts` | CSV string or File | `{ rows, warnings }` |
| `parsers/xlsx.parser.ts` | ArrayBuffer | `{ rows, warnings }` |

Parsers strip whitespace, skip empty rows, and collect soft errors as warnings rather than throwing.

## Mappers

Each mapper accepts raw string rows and returns typed objects:

| Mapper | Output Type | Key Fields Required |
|---|---|---|
| `gl.mapper.ts` | `ActualEntry[]` | `period_id`, `cost_center_id` |
| `budget.mapper.ts` | `BudgetEntry[]` | `period_id`, `cost_center_id` |
| `forecast.mapper.ts` | `ForecastEntry[]` | `period_id`, `cost_center_id` |
| `headcount.mapper.ts` | `HeadcountRecord[]` | `position_id` |
| `vendor.mapper.ts` | `VendorSpendRecord[]` | `vendor_id` or `vendor_name` |
| `external-labor.mapper.ts` | `ExternalLaborRecord[]` | `contractor_id` or `name` |

All mappers use liberal column aliasing — both `business_unit` and `businessUnit` are accepted.

## Connectors

`connectors/index.ts` — stub registry for direct system integrations. All stubs return `{ data: [], warnings: ["not yet implemented"] }`.

| Connector | System | Replaces |
|---|---|---|
| `quickbooks` | QuickBooks Online | Manual GL export |
| `netsuite` | NetSuite SuiteAnalytics | Manual GL export |
| `workday` | Workday HCM | `headcount.csv` upload |
| `vms` | Beeline / Fieldglass | `external-labor.csv` upload |
| `databricks` | Databricks SQL | Direct DB query |
| `coupa` | Coupa Procurement | Vendor spend upload |
| `adaptive` | Workday Adaptive Planning | Budget upload |

## Seed Data

`data/seed/` contains 5–10 row generic CSV files for local dev and testing. No real company data, no real financial figures.

| File | Data Type |
|---|---|
| `gl-actuals.csv` | GL actuals (ActualEntry) |
| `budget.csv` | Approved budget (BudgetEntry) |
| `forecast.csv` | Rolling forecast (ForecastEntry) |
| `headcount.csv` | Positions (HeadcountRecord) |
| `vendor-spend.csv` | Vendor contracts (VendorSpendRecord) |
| `external-labor.csv` | Contractor SOWs (ExternalLaborRecord) |

## Column Naming

Mappers accept both `snake_case` and `camelCase` variants for most fields. If a column is not recognized, it is silently ignored and the field defaults to empty/zero. Check `result.warnings` for skipped rows.

## Adding a New Data Type

1. Add the type to `DataType` in `ingest.orchestrator.ts`
2. Create `mappers/[type].mapper.ts` following the existing pattern
3. Add the `case` in the orchestrator switch
4. Add seed rows to `data/seed/`
5. Add validators in `src/lib/validation/validators/`
