-- Migration 004: Add ingestion-lineage columns to fact_transactions (Sprint 11A.7)
-- Enables the canonical financial-stage Delta load (DatabricksFinancialStage) to
-- stamp every loaded fact row with where it came from, while leaving existing
-- seeded/demo rows untouched (they keep NULL for all four new columns).
--
-- Run this ONCE manually against the Databricks SQL warehouse (Unity Catalog).
-- ADD COLUMNS is additive and non-destructive: it rewrites no data, drops no
-- column, and never touches existing rows. Safe to run on a populated table.
--
-- The app falls back to an in-memory financial stage until these columns exist
-- (any INSERT referencing them fails → DatabricksFinancialStage logs a warning
-- and delegates to InMemoryFinancialStage), so the upload endpoint keeps working
-- both before and after this migration runs — exactly like migration 003.
--
-- Catalog: nexora  Schema: finance
--   (override via DATABRICKS_CATALOG / DATABRICKS_SCHEMA env vars; the app
--    qualifies the table with those same values)
--
-- ── Canonical → fact_transactions column mapping (DatabricksFinancialStage) ──
--   CanonicalFinancialRecord field   fact_transactions column   Notes
--   ──────────────────────────────   ────────────────────────   ─────────────────────────────
--   (generated)                      transaction_id             `${upload_id}-<6-digit row idx>` (unique, NOT NULL, embeds upload_id)
--   period + "-01"                   date                       CAST(? AS DATE); first of the fiscal month (NOT NULL DATE)
--   period                           period                     ISO month "YYYY-MM" (partition key)
--   cost_center                      cost_center_id             NOT NULL
--   cost_center_name                 cost_center_name           NOT NULL ("" allowed)
--   entity_id (vendors only)         vendor_id                  nullable FK; "" for non-vendor types
--   category                         category                   NOT NULL ("" allowed)
--   (none)                           subcategory                "" (not modeled in the canonical record)
--   business_unit                    business_unit              NOT NULL ("" allowed)
--   amount_actual                    amount_actual              DOUBLE NOT NULL
--   amount_budget                    amount_budget              DOUBLE NOT NULL
--   amount_forecast                  amount_forecast            DOUBLE NOT NULL
--   source_type → transaction_type  transaction_type           gl-actuals→actual, budget→budget, forecast→forecast,
--                                                               headcount→budget, vendors→actual, external-labor→actual
--   "upload"                         source_system              marks rows ingested via the upload pipeline
--   client_id                        client_id                  multi-tenant id (carried per record)
--   upload_id                        upload_id        (NEW)     ingestion lineage — links back to ingest_upload_history
--   source_file                      source_file      (NEW)     ingestion lineage — original uploaded file name
--   source_type                      source_type      (NEW)     ingestion lineage — detected data type
--   (now)                            ingested_at      (NEW)     ingestion lineage — current_timestamp() at load
--
-- account_code and entity_name from the canonical record are intentionally NOT
-- persisted (fact_transactions has no column for them); they are lossy on load.

ALTER TABLE nexora.finance.fact_transactions ADD COLUMNS (
  upload_id    STRING     COMMENT 'Ingestion lineage: originating upload id (NULL for seeded/demo rows)',
  source_file  STRING     COMMENT 'Ingestion lineage: original uploaded file name',
  source_type  STRING     COMMENT 'Ingestion lineage: detected data type (gl-actuals|budget|forecast|headcount|vendors|external-labor)',
  ingested_at  TIMESTAMP  COMMENT 'Ingestion lineage: load timestamp (current_timestamp() at INSERT)'
);

-- Verify after running:
-- DESCRIBE TABLE nexora.finance.fact_transactions;
-- Rows loaded by a given upload:
--   SELECT COUNT(*) FROM nexora.finance.fact_transactions WHERE upload_id = '<upload_id>';
-- All ingested (non-demo) rows:
--   SELECT upload_id, source_type, source_file, COUNT(*) AS rows
--   FROM nexora.finance.fact_transactions
--   WHERE upload_id IS NOT NULL
--   GROUP BY upload_id, source_type, source_file
--   ORDER BY MAX(ingested_at) DESC;
