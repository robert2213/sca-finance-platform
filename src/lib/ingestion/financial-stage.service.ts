// Financial staging service — in-memory implementation (Sprint 11A.6).
//
// Accepts canonical financial records and holds them in a process-local buffer
// (NO Databricks, NO fact_transactions writes). This is the staging layer that
// sits between validation and the future Delta load. Mirrors the in-memory
// upload-history store: the active implementation is chosen by
// financial-stage.resolver.ts, so a DatabricksFinancialStage can later be swapped
// in by editing only the resolver.

import type {
  CanonicalFinancialRecord,
  FinancialStage,
  StageOutcome,
  UploadStageSummary,
} from "./financial-stage.types";

/** Process-local financial stage. Rejects records missing period or cost_center. */
export class InMemoryFinancialStage implements FinancialStage {
  private readonly records: CanonicalFinancialRecord[] = [];

  async stage(records: CanonicalFinancialRecord[]): Promise<StageOutcome> {
    let staged = 0;
    let rejected = 0;
    records.forEach((r) => {
      if (r.period && r.cost_center) {
        this.records.push(r);
        staged += 1;
      } else {
        rejected += 1;
      }
    });
    return { staged, rejected };
  }

  async getByUpload(uploadId: string): Promise<CanonicalFinancialRecord[]> {
    return this.records.filter((r) => r.upload_id === uploadId);
  }

  async count(): Promise<number> {
    return this.records.length;
  }

  async listUploadSummaries(): Promise<UploadStageSummary[]> {
    const byUpload = new Map<string, UploadStageSummary>();
    this.records.forEach((r) => {
      const existing = byUpload.get(r.upload_id);
      if (existing) {
        existing.count += 1;
      } else {
        byUpload.set(r.upload_id, {
          uploadId: r.upload_id,
          sourceType: r.source_type,
          sourceFile: r.source_file,
          count: 1,
        });
      }
    });
    return Array.from(byUpload.values());
  }
}
