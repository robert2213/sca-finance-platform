import { NextRequest, NextResponse } from "next/server";
import { ingestFile, type DataType } from "@/lib/ingestion/ingest.orchestrator";
import { parseCsvString } from "@/lib/ingestion/parsers/csv.parser";
import { parseXlsx } from "@/lib/ingestion/parsers/xlsx.parser";
import { runValidation } from "@/lib/validation/validation.runner";
import type { ValidationStatus } from "@/lib/models/finance.types";
import { uploadHistory } from "@/lib/ingestion/upload-history.service";
import type { UploadStatus } from "@/lib/ingestion/staging.types";
import defaultConfig from "@/config/client.config";

/**
 * POST /api/ingest/upload  — Sprint 11A.1 thin slice + 11A.2 history persistence
 *
 * Additive endpoint that runs an uploaded file through the existing V2 ingestion
 * stack (parse → map → validate), records the result in the in-memory upload
 * history service, and returns a structured summary including the uploadId and
 * lifecycle status. NO Databricks writes; fully independent of the legacy
 * POST /api/ingest route (which it does not touch).
 *
 * Body: multipart/form-data
 *   file      — required — a .csv or .xlsx file
 *   dataType  — optional — one of: gl-actuals | budget | forecast | headcount |
 *               vendors | external-labor        (default: gl-actuals)
 *   period    — optional — ISO month "YYYY-MM"  (default: first configured period)
 *
 * Returns: UploadSummary JSON (with uploadId + status). The record is retrievable
 * via GET /api/ingest/uploads and GET /api/ingest/uploads/[uploadId].
 */

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB — mirrors POST /api/ingest
const SAMPLE_ROW_LIMIT = 5;
const ISO_MONTH = /^\d{4}-\d{2}$/;

const VALID_DATA_TYPES: DataType[] = [
  "gl-actuals", "budget", "forecast", "headcount", "vendors", "external-labor",
];

type SupportedFileType = "csv" | "xlsx";

interface UploadSummary {
  uploadId: string;            // history record id (11A.2)
  fileName: string;
  fileType: SupportedFileType;
  dataType: DataType;
  rowCount: number;            // raw data rows parsed from the file
  columnCount: number;         // distinct columns detected in the first row
  validationStatus: ValidationStatus;
  errorCount: number;          // hard validation errors (block staging)
  warningCount: number;        // soft signals: parse + map + validation warnings
  sampleRows: Record<string, string>[];
  readyForStaging: boolean;    // no errors AND at least one row
  status: UploadStatus;        // lifecycle status (11A.2)
}

/** Map a filename extension to a supported file type, or null if unsupported. */
function detectFileType(fileName: string): SupportedFileType | null {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "csv") return "csv";
  if (ext === "xlsx" || ext === "xls" || ext === "xlsm") return "xlsx";
  return null;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Missing required field: file" }, { status: 400 });
  }

  const fileType = detectFileType(file.name);
  if (!fileType) {
    return NextResponse.json(
      { error: 'Unsupported file type. Supported: .csv, .xlsx' },
      { status: 415 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 50 MB.` },
      { status: 413 }
    );
  }

  // dataType — optional; defaults to gl-actuals. Auto-detection is future work.
  const dataTypeInput = ((formData.get("dataType") as string | null) ?? "").trim() || "gl-actuals";
  if (!VALID_DATA_TYPES.includes(dataTypeInput as DataType)) {
    return NextResponse.json(
      { error: `Invalid dataType "${dataTypeInput}". Must be one of: ${VALID_DATA_TYPES.join(", ")}` },
      { status: 400 }
    );
  }
  const dataType = dataTypeInput as DataType;

  // period — optional; defaults to the first configured reporting period.
  const periodInput = ((formData.get("period") as string | null) ?? "").trim();
  if (periodInput && !ISO_MONTH.test(periodInput)) {
    return NextResponse.json(
      { error: `Invalid period "${periodInput}". Expected ISO month "YYYY-MM".` },
      { status: 400 }
    );
  }
  const period = periodInput || defaultConfig.reportingPeriods[0];
  const clientId = defaultConfig.clientId;

  try {
    // ── Parse (raw, for file structure) + ingest (parse → map), both via V2 code ──
    // ingestFile re-parses internally; the extra raw parse is what surfaces the
    // file's own row/column shape (ingestFile only returns mapped records).
    let rawRows: Record<string, string>[];
    let ingest;

    if (fileType === "csv") {
      const text = await file.text();
      rawRows = parseCsvString(text).rows;
      ingest = await ingestFile(text, file.name, { dataType, period, clientId, source: "upload" });
    } else {
      const buffer = await file.arrayBuffer();
      rawRows = parseXlsx(buffer).rows;
      ingest = await ingestFile(buffer, file.name, { dataType, period, clientId, source: "upload" });
    }

    // ── Validate the mapped records via the existing runner ──
    const validation = runValidation(dataType, period, ingest.data, defaultConfig);

    const rowCount = rawRows.length;
    const columnCount = rowCount > 0 ? Object.keys(rawRows[0]).length : 0;
    const errorCount = validation.errors.length;
    const warningCount = validation.warnings.length + ingest.warnings.length;
    const validationStatus: ValidationStatus =
      errorCount > 0 ? "error" : warningCount > 0 ? "warn" : "pass";
    const readyForStaging = validation.passed && rowCount > 0;

    // ── Persist to upload history (Sprint 11A.2, in-memory) ──
    // Lifecycle: addUpload() registers as "uploaded", then we transition to the
    // post-validation status. ("staged" is reserved for the future load step.)
    const record = uploadHistory.addUpload({
      fileName: file.name,
      fileType,
      dataType,
      period,
      rowCount,
      columnCount,
      validationStatus,
      errorCount,
      warningCount,
      readyForStaging,
    });
    const status: UploadStatus = errorCount > 0 ? "failed" : "validated";
    uploadHistory.updateStatus(record.uploadId, status);

    const summary: UploadSummary = {
      uploadId: record.uploadId,
      fileName: file.name,
      fileType,
      dataType,
      rowCount,
      columnCount,
      validationStatus,
      errorCount,
      warningCount,
      sampleRows: rawRows.slice(0, SAMPLE_ROW_LIMIT),
      readyForStaging,
      status,
    };

    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "POST /api/ingest/upload",
    description: "Parse + map + validate an upload, then record it in the in-memory upload history (Sprint 11A.2).",
    acceptedFileTypes: ["csv", "xlsx"],
    dataTypes: VALID_DATA_TYPES,
    maxFileSizeMB: 50,
    fields: {
      file: "required — a .csv or .xlsx file",
      dataType: "optional — defaults to gl-actuals",
      period: "optional — ISO month YYYY-MM; defaults to first configured period",
    },
    history: {
      list: "GET /api/ingest/uploads",
      detail: "GET /api/ingest/uploads/[uploadId]",
    },
  });
}
