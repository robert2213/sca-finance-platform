# Databricks Schema — Design Assessment & Production Guide

**Assessed:** June 8, 2026  
**Status:** Deployed to `nexora.finance` catalog

---

## Tables

| Table | Type | Partition | Purpose |
|---|---|---|---|
| `fact_transactions` | Fact | `period` | All actuals, budgets, and forecasts |
| `dim_vendor` | Dimension | None | Vendor contracts and spend |
| `dim_cost_center` | Dimension | None | Cost center master |
| `dim_contractor` | Dimension | None | External labor engagements |
| `dim_headcount` | Dimension | None | Position roster |
| `dim_period` | Dimension | None | Fiscal calendar |
| `data_quality_log` | Audit | None | Ingestion quality events |

---

## Concern: Unified fact_transactions Table

### Design

`fact_transactions` stores actuals, budget, and forecast rows in a single table differentiated by `transaction_type STRING` (values: `'actual'` | `'budget'` | `'forecast'`).

### Risk Assessment: **MEDIUM — Acceptable with documentation and constraints**

**Why it works:**

- Delta Lake handles mixed-type workloads efficiently — the partition on `period` ensures scans are fast regardless of `transaction_type`
- Variance queries (actuals vs. budget) are a single aggregation on one table, not a JOIN across two tables
- The ingest pipeline already enforces `transaction_type` at write time — no ambiguous rows today
- This pattern is standard in financial data warehouses (Kimball-style "role-playing dimension" equivalent)

**Real risks:**

| Risk | Severity | Mitigation |
|---|---|---|
| Query forgets `WHERE transaction_type` filter | Medium | Add table comment + query templates to docs |
| Budget rows accidentally get `amount_actual` populated | Medium | Add CHECK constraint (see below) |
| No client_id in DDL for multi-tenancy | High | Add `client_id` column before first client go-live |
| Row count stats mislead (counts all three types) | Low | Document querying conventions |

### Recommended Constraints (run once after table creation)

```sql
-- Enforce valid transaction types
ALTER TABLE nexora.finance.fact_transactions
ADD CONSTRAINT chk_transaction_type
CHECK (transaction_type IN ('actual', 'budget', 'forecast'));

-- Enforce valid source systems
ALTER TABLE nexora.finance.fact_transactions
ADD CONSTRAINT chk_source_system
CHECK (source_system IN ('gl-export', 'budget-export', 'payroll', 'quickbooks', 'stripe', 'headcount', 'contractors', 'vendors', 'other', 'static'));
```

### Standard Query Patterns

```sql
-- YTD actuals by business unit
SELECT business_unit, SUM(amount_actual) AS ytd_actual
FROM nexora.finance.fact_transactions
WHERE transaction_type = 'actual'
  AND period BETWEEN '2026-01' AND '2026-06'
GROUP BY business_unit;

-- Budget vs actuals variance (ALWAYS filter by transaction_type)
SELECT
  t1.cost_center_id,
  t1.period,
  SUM(CASE WHEN t1.transaction_type = 'actual' THEN t1.amount_actual ELSE 0 END) AS actuals,
  SUM(CASE WHEN t1.transaction_type = 'budget' THEN t1.amount_budget ELSE 0 END) AS budget
FROM nexora.finance.fact_transactions t1
WHERE t1.period = '2026-05'
GROUP BY t1.cost_center_id, t1.period;
```

### Production Alternative (not required now)

Separate tables (`fact_actuals`, `fact_budget`, `fact_forecast`) avoid the type filter requirement but introduce JOIN complexity for variance calculations and a more complex ETL. **Not recommended** for current scale — the unified table is correct for this use case.

---

## Multi-Tenancy Gap (Pre-Client Go-Live Action Required)

`client_id` is defined in the application type layer (`src/lib/models/finance.types.ts`) but **not yet in the DDL or written by the ingestion pipeline**.

Before deploying Client A or Client B:

```sql
-- Add client_id to fact_transactions
ALTER TABLE nexora.finance.fact_transactions ADD COLUMN client_id STRING;

-- Add to all dimension tables
ALTER TABLE nexora.finance.dim_vendor       ADD COLUMN client_id STRING;
ALTER TABLE nexora.finance.dim_cost_center  ADD COLUMN client_id STRING;
ALTER TABLE nexora.finance.dim_headcount    ADD COLUMN client_id STRING;
ALTER TABLE nexora.finance.dim_contractor   ADD COLUMN client_id STRING;
```

Update `src/lib/ingestion/ingest.orchestrator.ts` to write `client_id` from the active client config.

Update all queries in `src/lib/queries/` to filter `WHERE client_id = :clientId`.

---

## Schema Recreation (Fresh Environment)

```bash
# 1. Set environment variables
export DATABRICKS_HOST=...
export DATABRICKS_TOKEN=...
export DATABRICKS_HTTP_PATH=...

# 2. Start the dev server
npm run dev

# 3. Initialize tables (idempotent — safe to re-run)
curl http://localhost:3000/api/db/init

# 4. Load synthetic data
pwsh tests/load-synthetic-data.ps1

# 5. Verify
curl http://localhost:3000/api/db/test
```

## Expected Row Counts After Load

| Table | Expected Rows |
|---|---|
| `fact_transactions` | ~1,080 |
| `dim_vendor` | 30 |
| `dim_headcount` | 58 |
| `dim_contractor` | 15 |
| `dim_cost_center` | 6 |
| `dim_period` | 12 |
