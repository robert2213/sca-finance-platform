// Upload history service (Sprint 11A.2).
//
// In-memory persistence only — no Databricks, no DB tables, no filesystem.
// The goal is to validate the service/route architecture before introducing
// durable storage. Because each Vercel route runs as a separate serverless
// function, this store is NOT shared across routes in production; that is an
// accepted limitation of the in-memory phase and the reason durable storage
// (DatabricksUploadHistory) is the planned 11A.4 replacement. Within a single
// process (local `next dev` / `next start`) all routes share one instance.

import type {
  StagedUpload,
  NewUploadInput,
  UploadStatus,
  UploadHistoryStore,
} from "./staging.types";

function generateUploadId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `upl_${ts}_${rand}`;
}

/** Process-local, Map-backed implementation of UploadHistoryStore. */
export class InMemoryUploadHistory implements UploadHistoryStore {
  // Map preserves insertion order, which we use directly for "most recent first".
  private readonly records = new Map<string, StagedUpload>();

  addUpload(input: NewUploadInput): StagedUpload {
    const record: StagedUpload = {
      ...input,
      uploadId: generateUploadId(),
      uploadedAt: new Date().toISOString(),
      status: "uploaded",
    };
    this.records.set(record.uploadId, record);
    return record;
  }

  getUpload(uploadId: string): StagedUpload | undefined {
    return this.records.get(uploadId);
  }

  listUploads(): StagedUpload[] {
    // Insertion order reversed → most recent first (deterministic, no timestamp ties).
    return Array.from(this.records.values()).reverse();
  }

  updateStatus(uploadId: string, status: UploadStatus): StagedUpload | undefined {
    const existing = this.records.get(uploadId);
    if (!existing) return undefined;
    // Re-setting an existing key preserves its insertion position in the Map.
    const updated: StagedUpload = { ...existing, status };
    this.records.set(uploadId, updated);
    return updated;
  }
}

// ─── Active store — the single swap point ─────────────────────────────────────
// Routes import `uploadHistory` (typed as UploadHistoryStore) and never the
// concrete class. To adopt durable storage later, replace the instance below
// with e.g. `new DatabricksUploadHistory(...)` — no route changes required.
//
// Stored on globalThis so the singleton survives Next.js dev hot-reloads (which
// re-evaluate modules) and is shared by every route within the same process.
const globalForUploadHistory = globalThis as unknown as {
  __nexoraUploadHistory?: UploadHistoryStore;
};

export const uploadHistory: UploadHistoryStore =
  globalForUploadHistory.__nexoraUploadHistory ??
  (globalForUploadHistory.__nexoraUploadHistory = new InMemoryUploadHistory());
