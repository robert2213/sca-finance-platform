import { NextResponse } from "next/server";
import { getAdapter, getConnectionMode } from "@/lib/databricks";
import { ALL_DDL } from "@/lib/schema/ddl";

/**
 * GET /api/db/init
 *
 * Idempotently creates all Nexora Delta tables in Databricks.
 * In local mode, tables are created automatically by the LocalAdapter — this
 * endpoint returns a 200 with a "local mode" notice instead of running DDL.
 *
 * Run this once when first connecting to a new Databricks workspace.
 */
export async function GET() {
  const mode = getConnectionMode();

  if (mode === "local") {
    return NextResponse.json({
      mode: "local",
      message: "Running in local SQLite mode — tables are auto-initialized. No action required.",
      tables: ALL_DDL.map((d) => d.name),
    });
  }

  const adapter = getAdapter();
  const results: { table: string; status: "created" | "error"; error?: string }[] = [];

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
