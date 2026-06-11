// Staging model for the ingestion pipeline (Sprint 11A.2).
//
// A StagedUpload is the metadata record produced after an upload has been
// parsed, mapped, and validated. It is the contract between the upload
// endpoint, the upload-history service, and the history API routes. It holds
// NO row data — only the shape/quality summary needed to decide whether the
// upload is ready for a later Databricks load.

import type { ValidationStatus } from "@/lib/models/finance.types";
import type { DataType } from "./ingest.orchestrator";

/**
 * Lifecycle status of an upload as it moves through the pipeline.
 *   uploaded  — record created, file received and parsed
 *   validated — validation ran with no blocking errors; ready for staging
 *   staged    — data staged for Databricks load (reserved for a later sprint)
 *   failed    — validation produced errors, or processing threw
 */
export type UploadStatus = "uploaded" | "validated" | "staged" | "failed";

/** A single staged-upload metadata record. */
export interface StagedUpload {
  uploadId: string;
  fileName: string;
  fileType: "csv" | "xlsx";
  dataType: DataType;
  period: string;                    // ISO month stamp used during mapping/validation
  uploadedAt: string;                // ISO 8601 timestamp
  rowCount: number;
  columnCount: number;
  validationStatus: ValidationStatus; // pass | warn | error
  errorCount: number;
  warningCount: number;
  readyForStaging: boolean;
  status: UploadStatus;
}

/**
 * Fields the caller supplies when registering an upload. `uploadId`,
 * `uploadedAt`, and the initial `status` are assigned by the store.
 */
export type NewUploadInput = Omit<StagedUpload, "uploadId" | "uploadedAt" | "status">;

/**
 * Storage abstraction for upload history. API routes depend on this interface
 * only — never on a concrete implementation — so the in-memory store can be
 * swapped for a durable (e.g. Databricks-backed) one without changing any route.
 *
 * Async (Sprint 11A.4): methods return Promises so a Databricks-backed
 * implementation (which performs async SQL I/O) can satisfy the same contract.
 * The in-memory implementation simply resolves immediately.
 */
export interface UploadHistoryStore {
  /** Register a new upload; resolves to the created record (status: "uploaded"). */
  addUpload(input: NewUploadInput): Promise<StagedUpload>;
  /** Fetch one record by id, or undefined if not found. */
  getUpload(uploadId: string): Promise<StagedUpload | undefined>;
  /** All records, most recent first. */
  listUploads(): Promise<StagedUpload[]>;
  /** Transition a record's status; resolves to the updated record, or undefined if not found. */
  updateStatus(uploadId: string, status: UploadStatus): Promise<StagedUpload | undefined>;
}
