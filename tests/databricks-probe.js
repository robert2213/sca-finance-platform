/**
 * Standalone Databricks probe (Sprint 11A.7.1 audit + verification).
 *
 * Reads .env.local, connects via @databricks/sql, and runs whatever SQL is
 * passed on the command line (default: schema + ingested-row audit of
 * fact_transactions). Read-only by default — used to ground the audit in the
 * REAL live schema and later to verify loaded rows.
 *
 *   node tests/databricks-probe.js                 # default audit
 *   node tests/databricks-probe.js "SELECT ..."    # ad-hoc query
 */
const fs = require("fs");
const path = require("path");

// ── Load .env.local (Next loads it automatically; a plain node script does not) ──
function loadEnv(file) {
  const p = path.join(__dirname, "..", file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}
loadEnv(".env.local");

const HOST = process.env.DATABRICKS_HOST;
const TOKEN = process.env.DATABRICKS_TOKEN;
const HTTP_PATH = process.env.DATABRICKS_HTTP_PATH;
const CATALOG = process.env.DATABRICKS_CATALOG || "nexora";
const SCHEMA = process.env.DATABRICKS_SCHEMA || "finance";
const TABLE = `${CATALOG}.${SCHEMA}.fact_transactions`;

async function run() {
  const { DBSQLClient } = require("@databricks/sql");
  const client = new DBSQLClient();
  await client.connect({ host: HOST, path: HTTP_PATH, token: TOKEN });
  const session = await client.openSession({ initialCatalog: CATALOG, initialSchema: SCHEMA });

  async function q(sql) {
    const op = await session.executeStatement(sql, { maxRows: 100000 });
    const rows = await op.fetchAll();
    await op.close();
    return rows;
  }

  const adhoc = process.argv[2];
  if (adhoc) {
    console.log("SQL:", adhoc);
    console.log(JSON.stringify(await q(adhoc), null, 2));
  } else {
    console.log("=== DESCRIBE", TABLE, "===");
    const cols = await q(`DESCRIBE TABLE ${TABLE}`);
    for (const c of cols) console.log(`  ${c.col_name}\t${c.data_type}`);

    console.log("\n=== Row counts ===");
    console.log(JSON.stringify(await q(
      `SELECT COUNT(*) AS total,
              COUNT_IF(source_system = 'upload') AS uploaded,
              COUNT_IF(client_id = 'demo-client') AS demo_client
       FROM ${TABLE}`
    ), null, 2));

    console.log("\n=== Distinct source_system / transaction_type ===");
    console.log(JSON.stringify(await q(
      `SELECT source_system, transaction_type, COUNT(*) AS n
       FROM ${TABLE} GROUP BY source_system, transaction_type ORDER BY n DESC`
    ), null, 2));
  }

  await session.close();
  await client.close();
}

run().then(() => process.exit(0)).catch((e) => { console.error("PROBE ERROR:", e.message); process.exit(1); });
