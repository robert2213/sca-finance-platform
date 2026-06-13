import { NextRequest, NextResponse } from "next/server";
import { parseCsv } from "@/lib/ingestion/csv-parser";
import { parseExcel } from "@/lib/ingestion/excel-parser";
import {
  mapToFactTransactions, mapToVendors,
  mapToHeadcount, mapToContractors, mapToCostCenters, mapToPeriods,
} from "@/lib/ingestion/field-mapper";
import { cleanTransactions, cleanVendors } from "@/lib/ingestion/cleaner";
import {
  writeTransactions, writeVendors, writeQualityLog,
  writeHeadcount, writeContractors, writeCostCenters, writePeriods,
} from "@/lib/ingestion/writer";
import type { IngestionResult, SourceSystem } from "@/lib/ingestion/types";
import { withTenant } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * POST /api/ingest
 *
 * Body: multipart/form-data
 *   file        — required — the file to ingest (CSV or Excel)
 *   sourceSystem — required — one of: gl-export | budget-export | payroll |
 *                             vendors | quickbooks | stripe | other
 *
 * Returns: IngestionResult JSON
 */
async function handleIngest(request: NextRequest, ctx: TenantContext) {
  const start = Date.now();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const sourceSystem = (formData.get("sourceSystem") as SourceSystem | null) ?? "other";

  if (!file) {
    return NextResponse.json({ error: "Missing required field: file" }, { status: 400 });
  }

  const validSources: SourceSystem[] = [
    "gl-export", "budget-export", "payroll", "vendors", "quickbooks", "stripe",
    "headcount", "contractors", "cost-centers", "periods", "other",
  ];
  if (!validSources.includes(sourceSystem)) {
    return NextResponse.json(
      { error: `Invalid sourceSystem. Must be one of: ${validSources.join(", ")}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 50 MB.` },
      { status: 413 }
    );
  }

  // ─── Parse the file ─────────────────────────────────────────────────────────

  const fileName = file.name;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed: { rows: { [key: string]: string | number | null }[]; parseErrors: string[] };

  if (ext === "csv") {
    parsed = parseCsv(buffer);
  } else if (ext === "xlsx" || ext === "xls") {
    parsed = parseExcel(buffer);
  } else {
    return NextResponse.json(
      { error: `Unsupported file type ".${ext}". Supported: csv, xlsx, xls` },
      { status: 415 }
    );
  }

  if (!parsed.rows.length) {
    return NextResponse.json<IngestionResult>(
      {
        success: false,
        sourceSystem,
        fileName,
        rowsReceived: 0,
        rowsProcessed: 0,
        rowsFlagged: 0,
        rowsSkipped: 0,
        qualityLog: [],
        errors: [...parsed.parseErrors, "No data rows found in file"],
        durationMs: Date.now() - start,
      },
      { status: 422 }
    );
  }

  const rowsReceived = parsed.rows.length;
  // Tenant from the authenticated session — data is written under the caller's tenant.
  const clientId = ctx.clientId;

  // ─── Map → Clean → Write ────────────────────────────────────────────────────

  const errors: string[] = [...parsed.parseErrors];
  let rowsProcessed = 0;
  let rowsSkipped = 0;
  let rowsFlagged = 0;

  if (sourceSystem === "vendors") {
    // Vendor records → dim_vendor
    const { vendors: mapped, unmapped } = mapToVendors(parsed.rows, sourceSystem, clientId);
    rowsSkipped += unmapped.length;

    const { cleaned, qualityLog } = cleanVendors(mapped);
    rowsFlagged = qualityLog.filter((e) =>
      e.action === "anomaly_flagged" || e.action === "negative_flagged"
    ).length;
    rowsSkipped += mapped.length - cleaned.length;

    const { written, errors: writeErrors } = await writeVendors(cleaned);
    rowsProcessed = written;
    errors.push(...writeErrors);

    await writeQualityLog(qualityLog, fileName, "dim_vendor");

    return NextResponse.json<IngestionResult>({
      success: writeErrors.length === 0,
      sourceSystem, fileName, rowsReceived, rowsProcessed,
      rowsFlagged, rowsSkipped, qualityLog, errors,
      durationMs: Date.now() - start,
    });
  }

  if (sourceSystem === "headcount") {
    const { headcount: mapped, unmapped } = mapToHeadcount(parsed.rows, clientId);
    rowsSkipped += unmapped.length;
    const { written, errors: writeErrors } = await writeHeadcount(mapped);
    rowsProcessed = written;
    errors.push(...writeErrors);
    return NextResponse.json<IngestionResult>({
      success: writeErrors.length === 0,
      sourceSystem, fileName, rowsReceived, rowsProcessed,
      rowsFlagged: 0, rowsSkipped, qualityLog: [], errors,
      durationMs: Date.now() - start,
    });
  }

  if (sourceSystem === "contractors") {
    const { contractors: mapped, unmapped } = mapToContractors(parsed.rows, clientId);
    rowsSkipped += unmapped.length;
    const { written, errors: writeErrors } = await writeContractors(mapped);
    rowsProcessed = written;
    errors.push(...writeErrors);
    return NextResponse.json<IngestionResult>({
      success: writeErrors.length === 0,
      sourceSystem, fileName, rowsReceived, rowsProcessed,
      rowsFlagged: 0, rowsSkipped, qualityLog: [], errors,
      durationMs: Date.now() - start,
    });
  }

  if (sourceSystem === "cost-centers") {
    const { costCenters: mapped, unmapped } = mapToCostCenters(parsed.rows, clientId);
    rowsSkipped += unmapped.length;
    const { written, errors: writeErrors } = await writeCostCenters(mapped);
    rowsProcessed = written;
    errors.push(...writeErrors);
    return NextResponse.json<IngestionResult>({
      success: writeErrors.length === 0,
      sourceSystem, fileName, rowsReceived, rowsProcessed,
      rowsFlagged: 0, rowsSkipped, qualityLog: [], errors,
      durationMs: Date.now() - start,
    });
  }

  if (sourceSystem === "periods") {
    const { periods: mapped, unmapped } = mapToPeriods(parsed.rows);
    rowsSkipped += unmapped.length;
    const { written, errors: writeErrors } = await writePeriods(mapped);
    rowsProcessed = written;
    errors.push(...writeErrors);
    return NextResponse.json<IngestionResult>({
      success: writeErrors.length === 0,
      sourceSystem, fileName, rowsReceived, rowsProcessed,
      rowsFlagged: 0, rowsSkipped, qualityLog: [], errors,
      durationMs: Date.now() - start,
    });
  }

  // All other source systems → fact_transactions
  const { transactions: mapped, unmapped } = mapToFactTransactions(
    parsed.rows,
    sourceSystem,
    clientId
  );
  rowsSkipped += unmapped.length;
  if (unmapped.length) {
    errors.push(`${unmapped.length} rows skipped — could not find date, cost center, or amount columns`);
  }

  const { cleaned, qualityLog } = cleanTransactions(mapped);
  rowsFlagged = qualityLog.filter((e) =>
    e.action === "anomaly_flagged" || e.action === "negative_flagged"
  ).length;
  rowsSkipped += mapped.length - cleaned.length; // duplicates removed

  const { written, errors: writeErrors } = await writeTransactions(cleaned);
  rowsProcessed = written;
  errors.push(...writeErrors);

  await writeQualityLog(qualityLog, fileName, "fact_transactions");

  return NextResponse.json<IngestionResult>({
    success: writeErrors.length === 0,
    sourceSystem,
    fileName,
    rowsReceived,
    rowsProcessed,
    rowsFlagged,
    rowsSkipped,
    qualityLog,
    errors,
    durationMs: Date.now() - start,
  });
}

// Only members with data:upload may ingest, and rows are written under their tenant.
export const POST = withTenant(handleIngest, { permission: "data:upload", action: "ingest.upload" });

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "POST /api/ingest",
    acceptedSources: [
      "gl-export", "budget-export", "payroll", "vendors",
      "quickbooks", "stripe", "headcount", "contractors",
      "cost-centers", "periods", "other",
    ],
    acceptedFileTypes: ["csv", "xlsx", "xls"],
    maxFileSizeMB: 50,
    fields: {
      file: "required — the file to ingest",
      sourceSystem: "required — one of the accepted sources above",
    },
  });
}
