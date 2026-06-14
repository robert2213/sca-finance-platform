# Data Validation Layer

`src/lib/validation/` runs structured validation on ingested data and returns `ValidationResult` objects. Nothing throws — all issues are captured as errors or warnings.

## ValidationResult Shape

```typescript
interface ValidationResult {
  dataType: string;
  period: string;
  rowsProcessed: number;
  errors: ValidationError[];    // blocking — data should not be stored
  warnings: ValidationWarning[];// non-blocking — review recommended
  passed: boolean;              // true when errors.length === 0
}
```

## Running Validation

```typescript
import { runValidation } from "@/lib/validation/validation.runner";
import defaultConfig from "@/config/client.config";

const result = runValidation("gl-actuals", "2026-06", mappedActuals, defaultConfig);

if (!result.passed) {
  console.error("Validation errors:", result.errors);
}
console.warn("Warnings:", result.warnings);
```

The runner is called from `ingest.orchestrator.ts` as the third step after parse → map → **validate** → store.

## Validators

| File | Checks |
|---|---|
| `required-fields.validator.ts` | Missing or empty required columns |
| `period.validator.ts` | ISO month format + within client's reporting periods |
| `cost-center.validator.ts` | Cost center ID/name exists in ClientConfig |
| `account.validator.ts` | GL account code/name exists in chart of accounts |
| `department.validator.ts` | Department name exists in ClientConfig |
| `duplicate.validator.ts` | Duplicate key combinations within the upload |
| `anomaly.validator.ts` | Negative amounts, statistical outliers (Z > 3.0) |
| `alignment.validator.ts` | Actuals vs budget variance threshold, forecast drift |

## Severity Levels

- **Errors** — data integrity issues: missing required fields, duplicate primary keys, invalid period format. Records with errors should be quarantined and not stored.
- **Warnings** — data quality issues: unrecognized cost centers, statistical outliers, forecast drift. Records with warnings may be stored but should be reviewed.

## ClientConfig Cross-Reference

Validators receive `ClientConfig` and use:
- `config.reportingPeriods` — valid period set for `period.validator.ts`
- `config.costCenters` — valid IDs and names for `cost-center.validator.ts`
- `config.chartOfAccounts` — valid codes and names for `account.validator.ts`
- `config.departments` — valid names for `department.validator.ts`

Keeping ClientConfig current ensures validation stays in sync with the client's org structure.

## Adding a New Validator

1. Create `validators/[name].validator.ts`
2. Export a function `validate[Name](rows, config?)` returning `ValidationError[]` or `ValidationWarning[]`
3. Import and call it from the relevant `case` in `validation.runner.ts`
