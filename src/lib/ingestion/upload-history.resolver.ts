// Upload-history store resolver/factory (Sprint 11A.4).
//
// Chooses the active UploadHistoryStore based on the runtime backend:
//   • Databricks configured (DATABRICKS_HOST/TOKEN/HTTP_PATH set) →
//       DatabricksUploadHistory, with an InMemoryUploadHistory injected as its
//       runtime fallback (used automatically if a Databricks read/write fails).
//   • otherwise → InMemoryUploadHistory (process-local; local dev / no creds).
//
// Routes import the resolved `uploadHistory` (or call getUploadHistoryStore())
// and depend only on the UploadHistoryStore interface — they never know or care
// which backend is active. The resolved store is cached on globalThis so it
// survives Next.js dev hot-reloads and is shared by all routes in one process.

import type { UploadHistoryStore } from "./staging.types";
import { InMemoryUploadHistory } from "./upload-history.service";
import { DatabricksUploadHistory } from "./databricks-upload-history.service";
import { getConnectionMode } from "@/lib/databricks";

const globalForUploadHistory = globalThis as unknown as {
  __nexoraUploadHistoryStore?: UploadHistoryStore;
};

/**
 * Resolve (and memoize) the active upload-history store. Databricks-backed when
 * configured, otherwise the in-memory store. Idempotent within a process.
 */
export function getUploadHistoryStore(): UploadHistoryStore {
  const existing = globalForUploadHistory.__nexoraUploadHistoryStore;
  if (existing) return existing;

  const fallback = new InMemoryUploadHistory();
  const store: UploadHistoryStore =
    getConnectionMode() === "databricks"
      ? new DatabricksUploadHistory(fallback)
      : fallback;

  globalForUploadHistory.__nexoraUploadHistoryStore = store;
  return store;
}

/** The active, resolved upload-history store. Routes import this binding. */
export const uploadHistory: UploadHistoryStore = getUploadHistoryStore();
