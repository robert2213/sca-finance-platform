/**
 * DatabricksAdapter — wraps @databricks/sql for use in Next.js API routes.
 *
 * All imports from @databricks/sql are dynamic so webpack never statically
 * bundles the package (which has native lz4 bindings). The module is loaded
 * at runtime by Node.js via the serverComponentsExternalPackages config.
 */

import type { DBAdapter, QueryResult } from "../databricks";

interface DatabricksConfig {
  host: string;
  token: string;
  httpPath: string;
  catalog: string;
  schema: string;
}

// Singleton client — one Thrift connection per Node.js process.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharedClient: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getConnectedClient(config: DatabricksConfig): Promise<any> {
  if (!sharedClient) {
    // Dynamic import keeps @databricks/sql out of the webpack bundle.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DBSQLClient } = require("@databricks/sql");
    sharedClient = new DBSQLClient();
    await sharedClient.connect({
      host: config.host,
      path: config.httpPath,
      token: config.token,
    });
  }
  return sharedClient;
}

// Replace positional ? placeholders with :p0, :p1, ... for named params
function toNamedSql(sql: string): string {
  let idx = 0;
  return sql.replace(/\?/g, () => `:p${idx++}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildNamedParams(params: unknown[]): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DBSQLParameter, DBSQLParameterType } = require("@databricks/sql");
  const map: Record<string, unknown> = {};
  for (let i = 0; i < params.length; i++) {
    const v = params[i];
    let type: string;
    if (typeof v === "number") {
      type = Number.isInteger(v)
        ? DBSQLParameterType.INT
        : DBSQLParameterType.DOUBLE;
    } else if (typeof v === "boolean") {
      type = DBSQLParameterType.BOOLEAN;
    } else {
      type = DBSQLParameterType.STRING;
    }
    map[`p${i}`] = new DBSQLParameter({ value: v, type });
  }
  return map;
}

export class DatabricksAdapter implements DBAdapter {
  private config: DatabricksConfig;

  constructor(config: DatabricksConfig) {
    this.config = config;
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    const client = await getConnectedClient(this.config);
    const session = await client.openSession({
      initialCatalog: this.config.catalog,
      initialSchema: this.config.schema,
    });

    try {
      const namedSql = params?.length ? toNamedSql(sql) : sql;
      const operation = await session.executeStatement(namedSql, {
        maxRows: 100_000,
        ...(params?.length
          ? { namedParameters: buildNamedParams(params) }
          : {}),
      });
      const rows = (await operation.fetchAll()) as T[];
      await operation.close();
      return {
        rows,
        rowCount: rows.length,
        executionTime: Date.now() - start,
      };
    } finally {
      await session.close();
    }
  }

  async testConnection(): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
  }> {
    try {
      const result = await this.query<{ test: number }>(
        "SELECT 1 AS test, current_timestamp() AS ts"
      );
      return {
        success: true,
        message: `Databricks connected — host: ${this.config.host}, catalog: ${this.config.catalog}.${this.config.schema}`,
        latencyMs: result.executionTime,
      };
    } catch (err) {
      // Reset singleton so next request tries a fresh connection
      if (sharedClient) {
        try {
          await sharedClient.close();
        } catch {
          /* ignore */
        }
        sharedClient = null;
      }
      return {
        success: false,
        message:
          err instanceof Error ? err.message : "Databricks connection failed",
      };
    }
  }

  async close(): Promise<void> {
    if (sharedClient) {
      await sharedClient.close();
      sharedClient = null;
    }
  }
}
