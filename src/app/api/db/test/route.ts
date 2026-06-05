import { NextResponse } from "next/server";
import { testConnection, getConnectionMode } from "@/lib/databricks";

/**
 * GET /api/db/test
 *
 * Tests the active database connection (Databricks or local SQLite fallback).
 * Returns connection mode, latency, and any error messages.
 *
 * Response shape:
 *   { mode, success, message, latencyMs?, timestamp }
 */
export async function GET() {
  const mode = getConnectionMode();
  const result = await testConnection();

  return NextResponse.json(
    {
      mode,
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
      timestamp: new Date().toISOString(),
    },
    { status: result.success ? 200 : 503 }
  );
}
