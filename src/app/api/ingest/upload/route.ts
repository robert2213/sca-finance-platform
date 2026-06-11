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
import { financialStage } from "@/lib/ingestion/financial-stage.resolver";
import { toCanonicalRecords } from "@/lib/ingestion/financial-record.transformer";
import type { UploadStatus } from "@/lib/ingestion/staging.types";
import { detectDataType, type DetectionConfidence } from "@/lib/ingestion/data-type-detector";
import defaultConfig from "@/config/client.config";

/**
 * POST /api/ingest/upload  — Sprint 11A.1 thin slice + 11A.2 history persistence
 *
 * Additive endpoint that runs an uploaded file through:
 *   data-type detection (11A.5) → file-structure validation (11A.3) → parse →
 *   map → semantic validation → stage → history.
 * Records the result in the in-memory upload history service and returns a
 * structured summary (uploadId, lifecycle status, and split file/semantic
 * validation reporting). If file-structure validation fails, the pipeline stops
 * and returns a structured 422 (the upload is recorded as "failed"). NO
 * Databricks writes; fully independent of the legacy POST /api/ingest route.
 *
 * Body: multipart/form-data
 *   file      — required — a .csv or .xlsx file
 *   dataType  — optional — one of: gl-actuals | budget | forecast | headcount |
 *               vendors | external-labor. If omitted, it is AUTO-DETECTED from the
 *               header row (Sprint 11A.5); if provided, it overrides detection.
 *   period    — optional — ISO month "YYYY-MM"  (default: first configured period)
 *
 * Returns: UploadSummary JSON (uploadId, status, and detection fields). The record
 * is retrievable via GET /api/ingest/uploads and GET /api/ingest/uploads/[uploadId].
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
  // ── Sprint 11A.5: automatic data-type detection (all fields above unchanged) ──
  detectedDataType: string | null;        // detector's best match (independent of any override)
  confidence: DetectionConfidence;        // high | medium | low
  detectionScore: number;                 // winner match ratio, 0..1
  matchedColumns: string[];               // detector signals matched (winning type)
  missingColumns: string[];               // detector signals not matched (winning type)
  // ── Sprint 11A.6: staging pipeline row metrics ──
  rowsReceived: number;    // raw data rows parsed from the file
  rowsValidated: number;   // mapped rows eligible for staging (0 when blocked)
  rowsStaged: number;      // canonical records accepted by the financial stage
  rowsRejected: number;    // rowsReceived − rowsStaged
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

  // dataType — OPTIONAL (Sprint 11A.5). If provided it overrides auto-detection
  // (back-compat); if omitted, the type is detected from the header row below.
  const dataTypeParam = ((formData.get("dataType") as string | null) ?? "").trim();
  if (dataTypeParam && !VALID_DATA_TYPES.includes(dataTypeParam as DataType)) {
    return NextResponse.json(
      { error: `Invalid dataType "${dataTypeParam}". Must be one of: ${VALID_DATA_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

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

    // ── 1. AUTOMATIC DATA TYPE DETECTION (Sprint 11A.5) ──
    // Runs before file validation so the required-columns check validates against
    // the resolved type. An explicit dataType form field overrides detection.
    const detection = detectDataType(headers);
    const usedDetection = !dataTypeParam;
    // Effective type for mapping/validation. "gl-actuals" is only a neutral
    // placeholder for the machinery when detection found nothing (null) and no
    // param was given — such uploads are caught by the low-confidence gate below.
    const dataType: DataType =
      (dataTypeParam || detection.dataType || "gl-actuals") as DataType;

    const detectionFields = {
      detectedDataType: detection.dataType,
      confidence: detection.confidence,
      detectionScore: detection.score,
      matchedColumns: detection.matchedColumns,
      missingColumns: detection.missingColumns,
    };

    // ── 2. FILE-STRUCTURE VALIDATION (Sprint 11A.3) — runs BEFORE parse/map ──
    const fileValidation = validateFileStructure({
      fileName: file.name,
      dataType,
      headers,
      rows: rawRows,
      declaredPeriod: periodInput,
    });
    const fileErrors = fileValidation.issues.filter((i) => i.severity === "error");
    const fileWarnings = fileValidation.issues.filter((i) => i.severity === "warning");

    // Record a file-structure failure and return a structured 422 (shared by the
    // structural and required-columns rejection branches below).
    const fileFailureResponse = async (): Promise<NextResponse> => {
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
        ...detectionFields,
        rowsReceived: rowCount,
        rowsValidated: 0,
        rowsStaged: 0,
        rowsRejected: rowCount,
      };
      return NextResponse.json(errorSummary, { status: 422 });
    };

    // Rejection precedence (do NOT continue to parse/map/stage):
    //   (a) STRUCTURAL file errors (empty/unsupported/duplicate-header) — type-
    //       independent, clearest message — always win.
    const structuralFileError = fileErrors.some((e) => e.validator !== "required-columns");
    if (structuralFileError) {
      return fileFailureResponse();
    }
    //   (b) else low-confidence auto-detection → structured rejection. Not recorded
    //       in history: there is no trustworthy type to stage.
    if (usedDetection && detection.confidence === "low") {
      return NextResponse.json(
        {
          error:
            "Could not confidently determine the data type from the file headers. " +
            "Pass an explicit dataType form field to override automatic detection.",
          ...detectionFields,
          supportedDataTypes: VALID_DATA_TYPES,
          scores: detection.scores,
        },
        { status: 422 }
      );
    }
    //   (c) else remaining file errors (missing required columns for the resolved type).
    if (fileValidation.status === "error") {
      return fileFailureResponse();
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

    // ── 4. HISTORY (Sprint 11A.2/11A.4) ──
    // addUpload() registers as "uploaded"; the final status is set after staging.
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

    // ── 5. TRANSFORM → STAGE (Sprint 11A.6) ──
    // Only validated uploads (no blocking errors) are staged. Mapped records are
    // transformed into canonical financial records and written to the in-memory
    // financial stage. NO fact_transactions / Databricks writes this sprint.
    let rowsStaged = 0;
    if (errorCount === 0 && ingest.data.length > 0) {
      const canonical = toCanonicalRecords(dataType, ingest.data, {
        uploadId: record.uploadId,
        sourceFile: file.name,
        clientId,
      });
      const outcome = await financialStage.stage(canonical);
      rowsStaged = outcome.staged;
    }
    const rowsReceived = rowCount;
    const rowsValidated = errorCount === 0 ? ingest.rowsMapped : 0;
    const rowsRejected = Math.max(0, rowsReceived - rowsStaged);

    // Lifecycle: uploaded → validated → staged (rows in the stage), or failed.
    const status: UploadStatus =
      errorCount > 0 ? "failed" : rowsStaged > 0 ? "staged" : "validated";
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
      ...detectionFields,
      rowsReceived,
      rowsValidated,
      rowsStaged,
      rowsRejected,
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
    description: "Auto-detect type (11A.5), validate structure (11A.3), parse + map + semantically validate, transform to canonical rows + stage (11A.6), and record in the upload history (11A.2/11A.4).",
    pipeline: ["data-type-detection", "file-structure-validation", "parse", "map", "semantic-validation", "transform", "stage", "history"],
    acceptedFileTypes: ["csv", "xlsx"],
    dataTypes: VALID_DATA_TYPES,
    maxFileSizeMB: 50,
    fields: {
      file: "required — a .csv or .xlsx file",
      dataType: "optional — auto-detected from headers when omitted; overrides detection when provided",
      period: "optional — ISO month YYYY-MM; defaults to first configured period",
    },
    history: {
      list: "GET /api/ingest/uploads",
      detail: "GET /api/ingest/uploads/[uploadId]",
    },
    staging: {
      inspect: "GET /api/ingest/staged",
      byUpload: "GET /api/ingest/staged?uploadId=[uploadId]",
    },
  });
}
