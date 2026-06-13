import { NextRequest, NextResponse } from "next/server";
import { dbQuery, getConnectionMode } from "@/lib/databricks";
import { withTenant, readJson, jsonError, assertPermission } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";

/**
 * POST /api/db/query
 * Raw SELECT execution against the active adapter. Because raw SQL BYPASSES the
 * tenant query layer, it is restricted to platform operators (SystemAdmin) — or
 * the demo deployment. Regular tenant users must use the scoped query/agent APIs.
 *
 * Body: { sql: string, params?: unknown[] }
 */
async function handleQuery(request: NextRequest, ctx: TenantContext) {
  // Demo mode keeps this dev tool open; otherwise require platform-level access.
  if (!ctx.isDemo) assertPermission(ctx, "platform:view_all_tenants");

  const { sql, params } = await readJson<{ sql: string; params?: unknown[] }>(request);

  if (!sql?.trim().toLowerCase().startsWith("select")) {
    return jsonError("Only SELECT statements are permitted", 400);
  }

  try {
    const result = await dbQuery(sql, params);
    return NextResponse.json({
      mode: getConnectionMode(),
      rowCount: result.rowCount,
      executionTime: result.executionTime,
      rows: result.rows,
    });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Query failed", 500);
  }
}

export const POST = withTenant(handleQuery, { requireActiveTenant: false, action: "db.query" });
