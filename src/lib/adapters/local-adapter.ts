/**
 * LocalAdapter — sql.js (WASM SQLite) fallback for when Databricks is not configured.
 * Pre-seeded from existing static data files so the full pipeline works end-to-end
 * in development without any cloud credentials.
 */

import path from "path";
import fs from "fs";
import type { DBAdapter, QueryResult } from "../databricks";
import type { SqlJsStatic, Database } from "sql.js";

// Persist the SQLite database to disk so data survives HMR reloads.
const DB_PATH = path.join(process.cwd(), "data", "nexora-local.sqlite");

// Lazy-loaded sql.js instance
let _sqlJs: SqlJsStatic | null = null;
let _db: Database | null = null;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!_sqlJs) {
    const initSqlJs = (await import("sql.js")).default;
    _sqlJs = await initSqlJs({
      locateFile: (file: string) =>
        path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
    });
  }
  return _sqlJs;
}

function saveToDisk(db: Database) {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch {
    // Non-fatal — best-effort persistence
  }
}

async function getDb(): Promise<Database> {
  if (_db) return _db;

  const SQL = await getSqlJs();

  // Load from disk if an existing database file is present
  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      _db = new SQL.Database(fileBuffer);
      // Ensure schema is up-to-date (idempotent IF NOT EXISTS)
      initSchema(_db);
      return _db;
    } catch {
      // Corrupt file — fall through to fresh init
    }
  }

  _db = new SQL.Database();
  initSchema(_db);
  await seedFromStaticData(_db);
  saveToDisk(_db);
  return _db;
}

// Default tenant for seeded/demo data — mirrors DEFAULT_CLIENT_ID. Kept as a
// literal here to avoid importing the config layer into the adapter.
const LOCAL_DEFAULT_CLIENT_ID = "demo-client";

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS fact_transactions (
      transaction_id    TEXT PRIMARY KEY,
      date              TEXT NOT NULL,
      period            TEXT NOT NULL,
      cost_center_id    TEXT NOT NULL,
      cost_center_name  TEXT NOT NULL,
      vendor_id         TEXT,
      category          TEXT NOT NULL,
      subcategory       TEXT,
      business_unit     TEXT NOT NULL,
      amount_actual     REAL NOT NULL DEFAULT 0,
      amount_budget     REAL NOT NULL DEFAULT 0,
      amount_forecast   REAL NOT NULL DEFAULT 0,
      transaction_type  TEXT NOT NULL,
      source_system     TEXT NOT NULL DEFAULT 'static',
      client_id         TEXT NOT NULL DEFAULT 'demo-client'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dim_vendor (
      vendor_id           TEXT PRIMARY KEY,
      vendor_name         TEXT NOT NULL,
      vendor_category     TEXT NOT NULL,
      contract_start      TEXT,
      contract_end        TEXT,
      contract_value      REAL NOT NULL DEFAULT 0,
      ytd_spend           REAL NOT NULL DEFAULT 0,
      remaining           REAL NOT NULL DEFAULT 0,
      business_unit       TEXT,
      auto_renew          INTEGER NOT NULL DEFAULT 0,
      risk_level          TEXT NOT NULL DEFAULT 'Low',
      status              TEXT NOT NULL DEFAULT 'Active',
      client_id           TEXT NOT NULL DEFAULT 'demo-client'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dim_cost_center (
      cost_center_id    TEXT PRIMARY KEY,
      cost_center_name  TEXT NOT NULL,
      department        TEXT NOT NULL,
      owner             TEXT,
      budget_owner      TEXT,
      client_id         TEXT NOT NULL DEFAULT 'demo-client'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dim_period (
      period_id    TEXT PRIMARY KEY,
      year         INTEGER NOT NULL,
      month        INTEGER NOT NULL,
      month_name   TEXT NOT NULL,
      quarter      INTEGER NOT NULL,
      is_closed    INTEGER NOT NULL DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dim_contractor (
      contractor_id     TEXT PRIMARY KEY,
      contractor_name   TEXT NOT NULL,
      role              TEXT NOT NULL,
      vendor            TEXT NOT NULL,
      cost_center_id    TEXT NOT NULL,
      cost_center_name  TEXT,
      business_unit     TEXT NOT NULL,
      monthly_rate      REAL NOT NULL DEFAULT 0,
      ytd_spend         REAL NOT NULL DEFAULT 0,
      budget            REAL NOT NULL DEFAULT 0,
      start_date        TEXT,
      end_date          TEXT,
      status            TEXT NOT NULL DEFAULT 'Active',
      client_id         TEXT NOT NULL DEFAULT 'demo-client'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dim_headcount (
      position_id     TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      business_unit   TEXT NOT NULL,
      level           TEXT NOT NULL,
      status          TEXT NOT NULL,
      location        TEXT,
      open_date       TEXT,
      fill_date       TEXT,
      annual_salary   REAL NOT NULL DEFAULT 0,
      is_backfill     INTEGER NOT NULL DEFAULT 0,
      client_id       TEXT NOT NULL DEFAULT 'demo-client'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS data_quality_log (
      log_id         INTEGER PRIMARY KEY AUTOINCREMENT,
      logged_at      TEXT NOT NULL,
      source_file    TEXT NOT NULL,
      table_name     TEXT NOT NULL,
      action         TEXT NOT NULL,
      detail         TEXT,
      row_count      INTEGER NOT NULL DEFAULT 0
    )
  `);

  // ── Multi-tenant control plane ───────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS organization (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      tenant_id   TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'onboarding',
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      settings    TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS app_user (
      user_id     TEXT NOT NULL,
      org_id      TEXT NOT NULL,
      email       TEXT NOT NULL,
      role        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'invited',
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      PRIMARY KEY (user_id, org_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS audit_log (
      event_id       TEXT PRIMARY KEY,
      ts             TEXT NOT NULL,
      org_id         TEXT,
      actor_user_id  TEXT NOT NULL,
      action         TEXT NOT NULL,
      target         TEXT,
      outcome        TEXT NOT NULL,
      detail         TEXT
    )
  `);

  migrateSchema(db);
  seedControlPlane(db);
}

/**
 * Idempotent migrations for pre-existing local databases created before the
 * multi-tenant columns existed. ADD COLUMN errors when the column is already
 * present — swallowed per-statement so this is safe to run on every load.
 */
function migrateSchema(db: Database) {
  const addClientId = [
    "fact_transactions", "dim_vendor", "dim_cost_center",
    "dim_contractor", "dim_headcount",
  ];
  for (const table of addClientId) {
    try {
      db.run(`ALTER TABLE ${table} ADD COLUMN client_id TEXT NOT NULL DEFAULT 'demo-client'`);
    } catch {
      // Column already exists — expected on up-to-date databases.
    }
  }
}

/** Seed the demo organization so the control plane is non-empty in demo mode. */
function seedControlPlane(db: Database) {
  try {
    const now = new Date().toISOString();
    db.run(
      `INSERT OR IGNORE INTO organization (id, name, tenant_id, status, created_at, updated_at, settings)
       VALUES (?, ?, ?, 'active', ?, ?, ?)`,
      [LOCAL_DEFAULT_CLIENT_ID, "Demo Client", LOCAL_DEFAULT_CLIENT_ID, now, now, "{}"]
    );
  } catch {
    // Non-fatal — best-effort seed.
  }
}

async function seedFromStaticData(db: Database) {
  // Dynamically import static data (avoids circular deps at module load time)
  const [
    { actuals },
    { vendors },
    { contractors },
    { headcount },
  ] = await Promise.all([
    import("@/data/actuals"),
    import("@/data/vendors"),
    import("@/data/externalLabor"),
    import("@/data/headcount"),
  ]);

  const monthToNum: Record<string, number> = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5,
    Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };

  const insertTx = db.prepare(`
    INSERT OR IGNORE INTO fact_transactions
    (transaction_id, date, period, cost_center_id, cost_center_name, category,
     business_unit, amount_actual, amount_budget, amount_forecast,
     transaction_type, source_system)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const row of actuals) {
    const mm = String(monthToNum[row.month] ?? 1).padStart(2, "0");
    const period = `${row.year}-${mm}`;
    const date = `${row.year}-${mm}-01`;
    const txId = `${row.costCenterId}-${period}-actual`;

    insertTx.run([
      txId, date, period,
      row.costCenterId, row.costCenterName, row.category,
      row.businessUnit,
      row.actual, row.budget, row.forecast,
      "actual", "static",
    ]);
  }
  insertTx.free();

  // Seed dim_vendor
  const insertVendor = db.prepare(`
    INSERT OR IGNORE INTO dim_vendor
    (vendor_id, vendor_name, vendor_category, contract_start, contract_end,
     contract_value, ytd_spend, remaining, business_unit, auto_renew,
     risk_level, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const v of vendors) {
    insertVendor.run([
      v.id, v.name, v.category,
      v.contractStart, v.contractEnd,
      v.annualValue, v.ytdSpend, v.remainingCommitment,
      v.businessUnit, v.autoRenew ? 1 : 0,
      v.riskLevel, "Active",
    ]);
  }
  insertVendor.free();

  // Seed dim_contractor
  const insertContractor = db.prepare(`
    INSERT OR IGNORE INTO dim_contractor
    (contractor_id, contractor_name, role, vendor, cost_center_id,
     cost_center_name, business_unit, monthly_rate, ytd_spend, budget,
     start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of contractors) {
    insertContractor.run([
      c.id, c.name, c.role, c.vendor, c.costCenterId,
      c.costCenterName, c.businessUnit, c.monthlyRate, c.ytdSpend, c.budget,
      c.startDate, c.endDate, c.status,
    ]);
  }
  insertContractor.free();

  // Seed dim_headcount
  const insertHC = db.prepare(`
    INSERT OR IGNORE INTO dim_headcount
    (position_id, title, business_unit, level, status, location,
     open_date, fill_date, annual_salary, is_backfill)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const h of headcount) {
    insertHC.run([
      h.id, h.title, h.businessUnit, h.level, h.status,
      h.location ?? null,
      h.openDate ?? null,
      h.fillDate ?? null,
      h.annualSalary, h.isBackfill ? 1 : 0,
    ]);
  }
  insertHC.free();

  // Seed dim_period
  const periods = Array.from(new Set(actuals.map(r => {
    const mm = String(monthToNum[r.month] ?? 1).padStart(2, "0");
    return `${r.year}-${mm}`;
  })));
  const quarterOf = (m: number) => Math.ceil(m / 3);
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const insertPeriod = db.prepare(`
    INSERT OR IGNORE INTO dim_period (period_id, year, month, month_name, quarter, is_closed)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const p of periods) {
    const [yr, mm] = p.split("-").map(Number);
    insertPeriod.run([p, yr, mm, monthNames[mm - 1], quarterOf(mm), 1]);
  }
  insertPeriod.free();
}

function execQuery<T>(
  db: Database,
  sql: string,
  params: unknown[]
): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params as (string | number | null | Uint8Array)[]);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return rows;
}

export class LocalAdapter implements DBAdapter {
  async query<T = Record<string, unknown>>(
    sql: string,
    params: unknown[] = []
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    const db = await getDb();
    const rows = execQuery<T>(db, sql, params);
    return { rows, rowCount: rows.length, executionTime: Date.now() - start };
  }

  async insertRows(
    tableName: string,
    rows: Record<string, unknown>[]
  ): Promise<void> {
    if (!rows.length) return;
    const db = await getDb();
    const cols = Object.keys(rows[0]);
    const placeholders = cols.map(() => "?").join(", ");
    const sql = `INSERT OR REPLACE INTO ${tableName} (${cols.join(", ")}) VALUES (${placeholders})`;
    const stmt = db.prepare(sql);
    for (const row of rows) {
      stmt.run(cols.map(c => row[c] as string | number | null));
    }
    stmt.free();
    saveToDisk(db); // persist writes across HMR reloads
  }

  async testConnection(): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
  }> {
    try {
      const result = await this.query<{ tables: number }>(
        "SELECT count(*) AS tables FROM sqlite_master WHERE type='table'"
      );
      const tables = result.rows[0]?.tables ?? 0;
      return {
        success: true,
        message: `Local SQLite adapter active — ${tables} tables initialized (Databricks not configured)`,
        latencyMs: result.executionTime,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Local adapter failed",
      };
    }
  }

  async close(): Promise<void> {
    if (_db) {
      _db.close();
      _db = null;
    }
  }
}
