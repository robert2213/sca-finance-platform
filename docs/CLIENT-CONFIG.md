# Client Configuration

`src/config/client.config.ts` is the single source of truth for all client-specific values. Replace this file (or override via environment) to onboard a new client with zero code changes.

## Structure

```typescript
interface ClientConfig {
  clientId:          string;          // unique slug, used as a DB partition key
  clientName:        string;          // displayed in nav, page titles, reports
  logoPath:          string;          // path under /public
  primaryColor:      string;          // hex, used for custom theming
  fiscalYearStart:   Month;           // which month opens the fiscal year
  reportingCurrency: "USD";           // ISO 4217 (extend as needed)
  reportingPeriods:  string[];        // ISO months: ["2026-01", ..., "2026-12"]
  forecastCycles:    string[];        // e.g. ["3+9", "6+6", "9+3"]
  businessUnits:     BusinessUnit[];
  costCenters:       CostCenter[];
  departments:       Department[];
  chartOfAccounts:   Account[];
  activeModules:     ModuleKey[];
  agents:            AgentConfig[];
}
```

## Consuming in Components

```typescript
// In any client component:
import { useClientConfig } from "@/lib/hooks/useClientConfig";

function MyComponent() {
  const { clientName, businessUnits, activeModules } = useClientConfig();
  // ...
}
```

```typescript
// In server components or static metadata:
import defaultConfig from "@/config/client.config";

export const metadata = {
  title: { default: defaultConfig.clientName }
};
```

## Onboarding a New Client

1. Copy `src/config/client.config.ts` to `src/config/clients/acme.config.ts`
2. Fill in the client's `clientId`, `clientName`, `businessUnits`, `costCenters`, and `chartOfAccounts`
3. Update `activeModules` to enable only licensed modules
4. Set `agents` array to enable/disable specific AI agents
5. In `src/app/layout.tsx`, import the client config instead of `defaultConfig`
6. Deploy — all components read from context, no other files change

## Active Modules

| Key | Feature |
|---|---|
| `actuals` | Budget vs. actuals tracking |
| `budget` | Annual budget management |
| `forecast` | Rolling forecast |
| `headcount` | Workforce planning |
| `vendors` | Vendor contract management |
| `external_labor` | Contractor & SOW tracking |
| `cloud_spend` | Cloud provider cost breakdown |
| `executive_reporting` | CFO/CIO narrative reporting |
| `agents` | AI finance agent chat workspaces |

## Validation

Validators in `src/lib/validation/` receive `ClientConfig` and use `costCenters`, `chartOfAccounts`, and `businessUnits` as the valid reference sets for cross-field validation. Keep these arrays in sync with your chart of accounts and org structure.
