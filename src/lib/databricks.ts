/**
 * Nexora — Databricks connection factory
 *
 * Returns a DatabricksAdapter when DATABRICKS_HOST / DATABRICKS_TOKEN /
 * DATABRICKS_HTTP_PATH are all set in the environment; otherwise falls back
 * to the LocalAdapter (sql.js in-memory SQLite pre-seeded from static data).
 *
 * Usage:
 *   import { dbQuery, testConnection, getConnectionMode } from "@/lib/databricks";
 *   const rows = await dbQuery("SELECT * FROM fact_transactions WHERE period = ?", ["2026-05"]);
 */

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
  executionTime: number; // ms
}

export interface DBAdapter {
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }>;
  close(): Promise<void>;
}

export type ConnectionMode = "databricks" | "local";

function isConfigured(): boolean {
  return !!(
    process.env.DATABRICKS_HOST &&
    process.env.DATABRICKS_TOKEN &&
    process.env.DATABRICKS_HTTP_PATH
  );
}

export function getConnectionMode(): ConnectionMode {
  return isConfigured() ? "databricks" : "local";
}

let _adapter: DBAdapter | null = null;

function buildAdapter(): DBAdapter {
  if (isConfigured()) {
    // Lazy-require to keep this module importable even when @databricks/sql
    // isn't bundled into the client (serverExternalPackages handles this).
    const { DatabricksAdapter } = require("./adapters/databricks-adapter");
    return new DatabricksAdapter({
      host: process.env.DATABRICKS_HOST!,
      token: process.env.DATABRICKS_TOKEN!,
      httpPath: process.env.DATABRICKS_HTTP_PATH!,
      catalog: process.env.DATABRICKS_CATALOG ?? "nexora",
      schema: process.env.DATABRICKS_SCHEMA ?? "finance",
    });
  }

  const { LocalAdapter } = require("./adapters/local-adapter");
  return new LocalAdapter();
}

export function getAdapter(): DBAdapter {
  if (!_adapter) {
    _adapter = buildAdapter();
  }
  return _adapter;
}

/** Reset the adapter singleton (useful after env-var changes or in tests). */
export async function resetAdapter(): Promise<void> {
  if (_adapter) {
    await _adapter.close();
    _adapter = null;
  }
}

/** Execute a SQL query against whichever backend is active. */
export async function dbQuery<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return getAdapter().query<T>(sql, params);
}

/** Test the active connection and return status info. */
export async function testConnection() {
  return getAdapter().testConnection();
}
