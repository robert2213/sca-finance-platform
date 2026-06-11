// Financial-stage resolver/factory (Sprint 11A.6).
//
// Mirrors upload-history.resolver: routes import the resolved `financialStage`
// (or call getFinancialStage()) and depend only on the FinancialStage interface.
// The resolved store is cached on globalThis so it survives Next.js dev
// hot-reloads and is shared by all routes in one process.
//
// SWAP POINT: today this always returns the in-memory stage (no fact_transactions
// writes this sprint). When a DatabricksFinancialStage lands (a later sprint),
// select it HERE by `getConnectionMode() === "databricks"` — exactly like
// upload-history.resolver — and NOTHING in the routes changes.

import type { FinancialStage } from "./financial-stage.types";
import { InMemoryFinancialStage } from "./financial-stage.service";

const globalForFinancialStage = globalThis as unknown as {
  __nexoraFinancialStage?: FinancialStage;
};

/** Resolve (and memoize) the active financial stage. Idempotent within a process. */
export function getFinancialStage(): FinancialStage {
  const existing = globalForFinancialStage.__nexoraFinancialStage;
  if (existing) return existing;

  // Swap point — see file header. For now: in-memory only.
  const stage: FinancialStage = new InMemoryFinancialStage();

  globalForFinancialStage.__nexoraFinancialStage = stage;
  return stage;
}

/** The active, resolved financial stage. Routes import this binding. */
export const financialStage: FinancialStage = getFinancialStage();
