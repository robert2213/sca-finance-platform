# Finance Data Model

`src/lib/models/finance.types.ts` defines the canonical ingest-to-store contract. All parsers produce these types; all validators and writers consume them.

## Common Fields (on every interface)

| Field | Type | Description |
|---|---|---|
| `clientId` | `string` | Tenant identifier — isolates data per deployment |
| `period` | `string` | ISO month: `"2026-01"` |
| `source` | `"upload" \| "seed" \| "connector"` | How the record entered the system |
| `validatedAt` | `Date?` | When the validation runner last processed this record |
| `validationStatus` | `"pass" \| "warn" \| "error"` | Outcome of the last validation pass |

## Dimensional Entities

| Interface | Key Fields | Purpose |
|---|---|---|
| `Account` | `code`, `name`, `category` | Chart of accounts — valid GL codes |
| `CostCenter` | `id`, `name`, `department`, `businessUnitId` | Budget ownership structure |
| `Department` | `id`, `name`, `businessUnitId` | Org hierarchy |
| `BusinessUnit` | `id`, `name`, `leadName` | Top-level reporting segment |
| `TimePeriod` | `periodId`, `year`, `month`, `isClosed` | Fiscal calendar |

## Fact Entities

| Interface | Key Fields | Purpose |
|---|---|---|
| `ActualEntry` | `amountActual`, `amountBudget`, `variance`, `variancePct` | GL actuals vs. plan |
| `BudgetEntry` | `amountBudget` | Approved annual/monthly budget |
| `ForecastEntry` | `amountForecast`, `forecastCycle` | Rolling forecast (3+9, 6+6, 9+3) |
| `HeadcountRecord` | `status`, `annualSalary`, `title` | Position-level workforce data |
| `ExternalLaborRecord` | `monthlyRate`, `contractValue`, `ytdSpend` | SOW/contractor tracking |
| `VendorSpendRecord` | `annualValue`, `ytdSpend`, `contractEnd` | Vendor contract and spend |
| `KPIRecord` | `metricKey`, `value`, `budget`, `unit` | Summary metrics (optional) |

## Relationship Diagram

```
BusinessUnit
  └── Department
  └── CostCenter
        └── ActualEntry    (actual spend per period)
        └── BudgetEntry    (approved budget per period)
        └── ForecastEntry  (rolling forecast per period)
        └── HeadcountRecord
        └── ExternalLaborRecord
        └── VendorSpendRecord

TimePeriod → referenced by period field on all fact entities
Account    → referenced by accountCode on ActualEntry / BudgetEntry / ForecastEntry
```

## Extending the Model

Add fields to an interface, then update:
1. The relevant mapper (`src/lib/ingestion/mappers/`) to populate the new field
2. The relevant validator (`src/lib/validation/validators/`) to check it
3. The schema DDL (`src/lib/schema/ddl.ts`) if persisting to Databricks
