import { NextRequest, NextResponse } from "next/server";
import { getAdapter, getConnectionMode } from "@/lib/databricks";
import { ALL_DDL } from "@/lib/schema/ddl";
import { withTenant, assertPermission } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";

// Permission-gated + session-dependent — never statically optimized.
export const dynamic = "force-dynamic";

/**
 * GET /api/db/init
 *
 * Idempotently creates all Nexora Delta tables in Databricks. Schema management
 * is a platform operation — restricted to SystemAdmin (or the demo deployment).
 * In local mode, tables are created automatically by the LocalAdapter — this
 * endpoint returns a 200 with a "local mode" notice instead of running DDL.
 */
async function handleInit(_request: NextRequest, ctx: TenantContext) {
  if (!ctx.isDemo) assertPermission(ctx, "platform:manage_organizations");

  const mode = getConnectionMode();

  if (mode === "local") {
    return NextResponse.json({
      mode: "local",
      message: "Running in local SQLite mode — tables are auto-initialized. No action required.",
      tables: ALL_DDL.map((d) => d.name),
    });
  }

  const adapter = getAdapter();
  const catalog = process.env.DATABRICKS_CATALOG ?? "nexora";
  const schema = process.env.DATABRICKS_SCHEMA ?? "finance";
  const results: { table: string; status: "created" | "error"; error?: string }[] = [];

  // Ensure catalog and schema exist before creating tables
  try {
    await adapter.query(`CREATE CATALOG IF NOT EXISTS \`${catalog}\``);
  } catch {
    // Some workspace configurations don't allow CREATE CATALOG — ignore if it already exists
  }
  try {
    await adapter.query(`CREATE SCHEMA IF NOT EXISTS \`${catalog}\`.\`${schema}\``);
  } catch (err) {
    return NextResponse.json(
      { mode: "databricks", success: false, message: `Failed to create schema ${catalog}.${schema}: ${err instanceof Error ? err.message : err}` },
      { status: 500 }
    );
  }

  for (const { name, sql } of ALL_DDL) {
    try {
      await adapter.query(sql.trim());
      results.push({ table: name, status: "created" });
    } catch (err) {
      results.push({
        table: name,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const allOk = results.every((r) => r.status === "created");

  return NextResponse.json(
    {
      mode: "databricks",
      success: allOk,
      tables: results,
      message: allOk
        ? "All Delta tables initialized successfully"
        : `${results.filter((r) => r.status === "error").length} tables failed — check errors`,
    },
    { status: allOk ? 200 : 207 }
  );
}

export const GET = withTenant(handleInit, { requireActiveTenant: false, action: "db.init" });
