# Security & Access Control

## Current Authentication Status

**No authentication is configured.** The app is currently a single-tenant, unauthenticated demo. This is acceptable for portfolio and internal demo use only. Authentication is required before any multi-client or internal deployment.

No `@clerk/nextjs`, `next-auth`, `supabase`, or other auth libraries are installed. No `middleware.ts` file exists. No route guards are applied.

## Auth Layer (Roles)

`src/lib/auth/roles.ts` defines the role model and permission map.

### Roles

| Role | Description |
|---|---|
| `admin` | Full access — config, data management, all reports |
| `finance_user` | Can upload data, run agents, view all reports — cannot manage config or clear data |
| `executive` | Read-only dashboard + agent chat — no upload, no config |
| `read_only` | No access to agents, reports, or data upload |

### Permissions

| Permission | admin | finance_user | executive | read_only |
|---|---|---|---|---|
| `canViewAllCostCenters` | ✓ | ✓ | ✓ | — |
| `canUploadData` | ✓ | ✓ | — | — |
| `canRunAgents` | ✓ | ✓ | ✓ | — |
| `canViewExecutiveReports` | ✓ | ✓ | ✓ | — |
| `canManageConfig` | ✓ | — | — | — |
| `canClearData` | ✓ | — | — | — |
| `canViewValidationResults` | ✓ | ✓ | — | — |

### Usage

```typescript
import { hasPermission } from "@/lib/auth/roles";

if (!hasPermission(userRole, "canUploadData")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

Route guards are deferred — see the `// TODO: Apply route-level role guards` comments in layout files.

## Recommended Auth Implementation

1. **Install Clerk**: `npm install @clerk/nextjs`
2. **Add to `.env.local`**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
3. **Create `middleware.ts`** at project root:
   ```typescript
   import { clerkMiddleware } from "@clerk/nextjs/server";
   export default clerkMiddleware();
   export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
   ```
4. **Map Clerk org roles** to `UserRole` via Clerk's `publicMetadata`
5. **Apply `hasPermission()`** in API route handlers and page-level guards
6. **Add `clientId` to Clerk org metadata** to support multi-tenant data isolation

## Data Sensitivity

- Financial data (actuals, budgets, headcount, vendor contracts) is sensitive — treat as confidential
- No PII should be stored in the current schema (headcount records use position IDs, not employee names)
- Credentials must never appear in source code — use `.env.local` (gitignored) for all secrets
- Databricks tokens should be scoped to read-only SQL warehouse access where possible

## Deferred Items

- Route guards on all pages (`/`, `/cfo`, `/fpa`, `/vendors`, etc.)
- Cost-center-scoped access for Finance Business Partners (see `finance-bp` agent)
- Audit log for data upload and config changes
- Session timeout and token refresh handling
