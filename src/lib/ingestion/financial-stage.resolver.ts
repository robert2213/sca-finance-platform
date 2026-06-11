// Financial-stage resolver/factory (Sprint 11A.6, swap wired in 11A.7).
//
// Mirrors upload-history.resolver: routes import the resolved `financialStage`
// (or call getFinancialStage()) and depend only on the FinancialStage interface.
// The resolved store is cached on globalThis so it survives Next.js dev
// hot-reloads and is shared by all routes in one process.
//
// Backend selection (Sprint 11A.7):
//   • Databricks configured (DATABRICKS_HOST/TOKEN/HTTP_PATH set) →
//       DatabricksFinancialStage, with an InMemoryFinancialStage injected as its
//       runtime fallback (used automatically if a Databricks write/read fails or
//       the fact_transactions lineage columns from migration 004 are absent).
//   • otherwise → InMemoryFinancialStage (process-local; local dev / no creds).
//
// This is the ONLY place that knows which backend is active — nothing in the
// routes changes between modes.

import type { FinancialStage } from "./financial-stage.types";
import { InMemoryFinancialStage } from "./financial-stage.service";
import { DatabricksFinancialStage } from "./databricks-financial-stage.service";
import { getConnectionMode } from "@/lib/databricks";

const globalForFinancialStage = globalThis as unknown as {
  __nexoraFinancialStage?: FinancialStage;
};

/**
 * Resolve (and memoize) the active financial stage. Databricks-backed when
 * configured, otherwise the in-memory stage. Idempotent within a process.
 */
export function getFinancialStage(): FinancialStage {
  const existing = globalForFinancialStage.__nexoraFinancialStage;
  if (existing) return existing;

  const fallback = new InMemoryFinancialStage();
  const stage: FinancialStage =
    getConnectionMode() === "databricks"
      ? new DatabricksFinancialStage(fallback)
      : fallback;

  globalForFinancialStage.__nexoraFinancialStage = stage;
  return stage;
}

/** The active, resolved financial stage. Routes import this binding. */
export const financialStage: FinancialStage = getFinancialStage();
