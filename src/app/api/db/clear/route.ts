import { NextRequest, NextResponse } from "next/server";
import { getAdapter } from "@/lib/databricks";
import { withTenant, readJson, jsonError } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";

// dim_period (shared fiscal calendar) is intentionally NOT clearable here — it
// is reference data shared across tenants.
const ALLOWED_TABLES = [
  "fact_transactions",
  "dim_vendor",
  "dim_cost_center",
  "dim_contractor",
  "dim_headcount",
] as const;

type AllowedTable = (typeof ALLOWED_TABLES)[number];

/**
 * POST /api/db/clear
 * Clears the CALLER'S TENANT rows from one or more tables. Requires `data:clear`.
 * Tenant-scoped: only rows where client_id = the caller's tenant are removed —
 * one organization can never wipe another organization's data.
 * Body: { tables: string[] }
 */
async function handleClear(request: NextRequest, ctx: TenantContext) {
  const body = await readJson<{ tables?: string[] }>(request);
  const requested = body.tables ?? [];

  const invalid = requested.filter((t) => !ALLOWED_TABLES.includes(t as AllowedTable));
  if (invalid.length) {
    return jsonError(
      `Unknown or non-clearable tables: ${invalid.join(", ")}. Allowed: ${ALLOWED_TABLES.join(", ")}`,
      400
    );
  }
  if (!requested.length) {
    return jsonError("Provide at least one table name", 400);
  }

  const adapter = getAdapter();
  const results: { table: string; status: "cleared" | "error"; rowsDeleted?: number; error?: string }[] = [];

  for (const table of requested) {
    try {
      // Tenant-scoped delete — never deletes another tenant's rows.
      const result = await adapter.query<{ deleted: number }>(
        `DELETE FROM ${table} WHERE client_id = ?`,
        [ctx.clientId]
      );
      results.push({ table, status: "cleared", rowsDeleted: result.rowCount });
    } catch (err) {
      results.push({
        table,
        status: "error",
        error: err instanceof Error ? err.message : "Delete failed",
      });
    }
  }

  const allOk = results.every((r) => r.status === "cleared");
  return NextResponse.json(
    { success: allOk, tenant: ctx.clientId, results },
    { status: allOk ? 200 : 207 }
  );
}

export const POST = withTenant(handleClear, { permission: "data:clear", action: "db.clear" });
