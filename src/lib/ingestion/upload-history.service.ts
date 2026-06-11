// Upload history — in-memory store (Sprint 11A.2; async-ified in 11A.4).
//
// InMemoryUploadHistory is the process-local store. It is BOTH the local-dev
// store (when Databricks is not configured) AND the runtime fallback used by
// DatabricksUploadHistory when a Databricks read/write fails. The ACTIVE store
// is chosen in upload-history.resolver.ts.
//
// The UploadHistoryStore interface is async (11A.4) so a Databricks-backed
// implementation can satisfy the same contract; these in-memory methods are
// trivially async. Because each Vercel route runs as a separate serverless
// function, this store is NOT shared across routes in production — that is the
// limitation durable (Databricks) storage solves.

import type {
  StagedUpload,
  NewUploadInput,
  UploadStatus,
  UploadHistoryStore,
} from "./staging.types";

/** Generate an application-side upload id: upl_<base36 ts>_<base36 rand>. */
export function generateUploadId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `upl_${ts}_${rand}`;
}

/** Process-local, Map-backed implementation of UploadHistoryStore. */
export class InMemoryUploadHistory implements UploadHistoryStore {
  // Map preserves insertion order, which we use directly for "most recent first".
  private readonly records = new Map<string, StagedUpload>();

  async addUpload(input: NewUploadInput): Promise<StagedUpload> {
    const record: StagedUpload = {
      ...input,
      uploadId: generateUploadId(),
      uploadedAt: new Date().toISOString(),
      status: "uploaded",
    };
    this.records.set(record.uploadId, record);
    return record;
  }

  async getUpload(uploadId: string): Promise<StagedUpload | undefined> {
    return this.records.get(uploadId);
  }

  async listUploads(): Promise<StagedUpload[]> {
    // Insertion order reversed → most recent first (deterministic, no timestamp ties).
    return Array.from(this.records.values()).reverse();
  }

  async updateStatus(uploadId: string, status: UploadStatus): Promise<StagedUpload | undefined> {
    const existing = this.records.get(uploadId);
    if (!existing) return undefined;
    // Re-setting an existing key preserves its insertion position in the Map.
    const updated: StagedUpload = { ...existing, status };
    this.records.set(uploadId, updated);
    return updated;
  }
}
