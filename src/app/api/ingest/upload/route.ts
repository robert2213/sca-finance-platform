import { NextRequest, NextResponse } from "next/server";
import { ingestFile, type DataType } from "@/lib/ingestion/ingest.orchestrator";
import { parseCsvString } from "@/lib/ingestion/parsers/csv.parser";
import { parseXlsx } from "@/lib/ingestion/parsers/xlsx.parser";
import { runValidation } from "@/lib/validation/validation.runner";
import type { ValidationStatus } from "@/lib/models/finance.types";
import type { ValidationError, ValidationWarning } from "@/lib/validation/validation.types";
import { validateFileStructure } from "@/lib/validation/file-validation.runner";
import { extractCsvHeaders, extractXlsxHeaders } from "@/lib/validation/file-headers";
import { classifyFileType } from "@/lib/validation/file-validators/unsupported-file.validator";
import type { FileValidationIssue } from "@/lib/validation/file-validation.types";
import { uploadHistory } from "@/lib/ingestion/upload-history.resolver";
import type { UploadStatus } from "@/lib/ingestion/staging.types";
import defaultConfig from "@/config/client.config";

/**
 * POST /api/ingest/upload  — Sprint 11A.1 thin slice + 11A.2 history persistence
 *
 * Additive endpoint that runs an uploaded file through:
 *   file-structure validation (11A.3) → parse → map → semantic validation →
 *   stage → history.
 * Records the result in the in-memory upload history service and returns a
 * structured summary (uploadId, lifecycle status, and split file/semantic
 * validation reporting). If file-structure validation fails, the pipeline stops
 * and returns a structured 422 (the upload is recorded as "failed"). NO
 * Databricks writes; fully independent of the legacy POST /api/ingest route.
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
  readyForStaging: boolean;    // no errors (file OR semantic) AND at least one row
  status: UploadStatus;        // lifecycle status (11A.2)
  // ── Sprint 11A.3: split validation reporting (all fields above are unchanged) ──
  fileValidationStatus: ValidationStatus;             // file-structure layer status
  fileErrors: FileValidationIssue[];                  // blocking file-structure issues
  fileWarnings: FileValidationIssue[];                // advisory file-structure issues
  semanticValidationStatus: ValidationStatus | null;  // null when file validation blocked the run
  semanticErrors: ValidationError[];                  // blocking semantic issues (mapped records)
  semanticWarnings: ValidationWarning[];              // advisory semantic issues (mapped records)
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

  const fileType = classifyFileType(file.name);
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
    // ── Read raw content + extract row data and the RAW header row ──
    // The semantic-stack parsers key rows by header (collapsing duplicates), so
    // the raw header row is extracted separately for file-structure validation.
    // ingestFile re-parses internally (the documented thin-slice double-parse).
    let content: string | ArrayBuffer;
    let rawRows: Record<string, string>[];
    let headers: string[];

    if (fileType === "csv") {
      const text = await file.text();
      content = text;
      rawRows = parseCsvString(text).rows;
      headers = extractCsvHeaders(text);
    } else {
      const buffer = await file.arrayBuffer();
      content = buffer;
      rawRows = parseXlsx(buffer).rows;
      headers = extractXlsxHeaders(buffer);
    }

    const rowCount = rawRows.length;
    const columnCount = headers.length;
    const sampleRows = rawRows.slice(0, SAMPLE_ROW_LIMIT);

    // ── 1. FILE-STRUCTURE VALIDATION (Sprint 11A.3) — runs BEFORE parse/map ──
    const fileValidation = validateFileStructure({
      fileName: file.name,
      dataType,
      headers,
      rows: rawRows,
      declaredPeriod: periodInput,
    });
    const fileErrors = fileValidation.issues.filter((i) => i.severity === "error");
    const fileWarnings = fileValidation.issues.filter((i) => i.severity === "warning");

    // If file structure is invalid, record the failure and STOP — do not parse,
    // map, semantically validate, or stage. Return a structured 422.
    if (fileValidation.status === "error") {
      const failed = await uploadHistory.addUpload({
        fileName: file.name,
        fileType,
        dataType,
        period,
        rowCount,
        columnCount,
        validationStatus: "error",
        errorCount: fileErrors.length,
        warningCount: fileWarnings.length,
        readyForStaging: false,
      });
      await uploadHistory.updateStatus(failed.uploadId, "failed");

      const errorSummary: UploadSummary = {
        uploadId: failed.uploadId,
        fileName: file.name,
        fileType,
        dataType,
        rowCount,
        columnCount,
        validationStatus: "error",
        errorCount: fileErrors.length,
        warningCount: fileWarnings.length,
        sampleRows,
        readyForStaging: false,
        status: "failed",
        fileValidationStatus: fileValidation.status,
        fileErrors,
        fileWarnings,
        semanticValidationStatus: null, // semantic layer never ran
        semanticErrors: [],
        semanticWarnings: [],
      };
      return NextResponse.json(errorSummary, { status: 422 });
    }

    // ── 2. PARSE → MAP (V2 orchestrator) ──
    const ingest = await ingestFile(content, file.name, { dataType, period, clientId, source: "upload" });

    // ── 3. SEMANTIC VALIDATION (mapped records, existing runner — unchanged) ──
    const validation = runValidation(dataType, period, ingest.data, defaultConfig);
    const semanticErrors = validation.errors;
    const semanticWarnings = validation.warnings;
    const semanticValidationStatus: ValidationStatus =
      semanticErrors.length > 0 ? "error" : semanticWarnings.length > 0 ? "warn" : "pass";

    // ── Combined totals — existing top-level fields = file + semantic (+ ingest warnings) ──
    const errorCount = fileErrors.length + semanticErrors.length;
    const warningCount = fileWarnings.length + semanticWarnings.length + ingest.warnings.length;
    const validationStatus: ValidationStatus =
      errorCount > 0 ? "error" : warningCount > 0 ? "warn" : "pass";
    const readyForStaging = errorCount === 0 && rowCount > 0;

    // ── 4. STAGE + HISTORY (Sprint 11A.2, in-memory) ──
    // Lifecycle: addUpload() registers as "uploaded", then we transition to the
    // post-validation status. ("staged" is reserved for the future load step.)
    const record = await uploadHistory.addUpload({
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
    await uploadHistory.updateStatus(record.uploadId, status);

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
      sampleRows,
      readyForStaging,
      status,
      fileValidationStatus: fileValidation.status,
      fileErrors,
      fileWarnings,
      semanticValidationStatus,
      semanticErrors,
      semanticWarnings,
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
    description: "Validate file structure (11A.3), then parse + map + semantically validate an upload, then record it in the in-memory upload history (11A.2).",
    pipeline: ["file-structure-validation", "parse", "map", "semantic-validation", "stage", "history"],
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
