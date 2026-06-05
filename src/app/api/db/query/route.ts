import { NextRequest, NextResponse } from "next/server";
import { dbQuery, getConnectionMode } from "@/lib/databricks";

/**
 * POST /api/db/query
 * Development/testing endpoint — run a raw SQL query against the active adapter.
 * Only accepts SELECT statements.
 *
 * Body: { sql: string, params?: unknown[] }
 */
export async function POST(request: NextRequest) {
  const { sql, params } = await request.json() as { sql: string; params?: unknown[] };

  if (!sql?.trim().toLowerCase().startsWith("select")) {
    return NextResponse.json(
      { error: "Only SELECT statements are permitted" },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 500 }
    );
  }
}
