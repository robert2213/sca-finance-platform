// Ingest orchestrator — routes uploaded files through parser → mapper → validator → store.
// All paths return structured results; nothing throws silently.

import { parseCsvString } from "./parsers/csv.parser";
import { parseXlsx } from "./parsers/xlsx.parser";
import { mapGlActuals } from "./mappers/gl.mapper";
import { mapBudget } from "./mappers/budget.mapper";
import { mapForecast } from "./mappers/forecast.mapper";
import { mapHeadcount } from "./mappers/headcount.mapper";
import { mapVendors } from "./mappers/vendor.mapper";
import { mapExternalLabor } from "./mappers/external-labor.mapper";
import type { DataSource } from "@/lib/models/finance.types";
import type { ClientConfig } from "@/config/client.config";

export type DataType =
  | "gl-actuals"
  | "budget"
  | "forecast"
  | "headcount"
  | "vendors"
  | "external-labor";

export interface IngestOptions {
  dataType: DataType;
  period: string;           // ISO month "2026-01" — required for non-transactional types
  clientId: string;
  source?: DataSource;
  config?: ClientConfig;    // passed to validators
}

export interface IngestResult {
  dataType: DataType;
  period: string;
  rowsParsed: number;
  rowsMapped: number;
  warnings: string[];
  // Typed output — exactly one field will be populated depending on dataType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

function parseFile(
  content: string | ArrayBuffer,
  filename: string
): { rows: Record<string, string>[]; warnings: string[] } {
  const isXlsx =
    filename.endsWith(".xlsx") ||
    filename.endsWith(".xls") ||
    filename.endsWith(".xlsm");

  if (isXlsx && content instanceof ArrayBuffer) {
    return parseXlsx(content);
  }

  const csv = typeof content === "string" ? content : Buffer.from(content).toString("utf-8");
  return parseCsvString(csv);
}

export async function ingestFile(
  content: string | ArrayBuffer,
  filename: string,
  options: IngestOptions
): Promise<IngestResult> {
  const { dataType, period, clientId, source = "upload" } = options;
  const allWarnings: string[] = [];

  // 1. Parse
  const { rows, warnings: parseWarnings } = parseFile(content, filename);
  allWarnings.push(...parseWarnings);

  // 2. Map
  let mapped: unknown[] = [];
  let mapWarnings: string[] = [];

  switch (dataType) {
    case "gl-actuals": {
      const r = mapGlActuals(rows, clientId, source);
      mapped = r.data; mapWarnings = r.warnings; break;
    }
    case "budget": {
      const r = mapBudget(rows, clientId, source);
      mapped = r.data; mapWarnings = r.warnings; break;
    }
    case "forecast": {
      const r = mapForecast(rows, clientId, source);
      mapped = r.data; mapWarnings = r.warnings; break;
    }
    case "headcount": {
      const r = mapHeadcount(rows, clientId, period, source);
      mapped = r.data; mapWarnings = r.warnings; break;
    }
    case "vendors": {
      const r = mapVendors(rows, clientId, period, source);
      mapped = r.data; mapWarnings = r.warnings; break;
    }
    case "external-labor": {
      const r = mapExternalLabor(rows, clientId, period, source);
      mapped = r.data; mapWarnings = r.warnings; break;
    }
    default: {
      allWarnings.push(`Unknown data type: ${dataType}`);
    }
  }

  allWarnings.push(...mapWarnings);

  // 3. Validation — called from validation.runner.ts in a separate pass
  //    (validation is decoupled from ingest so it can be re-run without re-parsing)

  return {
    dataType,
    period,
    rowsParsed: rows.length,
    rowsMapped: mapped.length,
    warnings: allWarnings,
    data: mapped,
  };
}
