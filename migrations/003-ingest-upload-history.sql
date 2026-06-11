-- Migration 003: Create ingest_upload_history (Sprint 11A.4)
-- Durable upload-history metadata for the file-ingestion pipeline.
-- Run this ONCE manually against the Databricks SQL warehouse (Unity Catalog).
-- Safe to re-run (CREATE TABLE IF NOT EXISTS is idempotent).
--
-- The app falls back to an in-memory store until this table exists, so the
-- upload endpoint keeps working both before and after the migration runs.
-- This table holds ONLY upload metadata — never financial fact rows.
--
-- Catalog: nexora  Schema: finance
--   (override via DATABRICKS_CATALOG / DATABRICKS_SCHEMA env vars; the app
--    qualifies the table with those same values)

CREATE TABLE IF NOT EXISTS nexora.finance.ingest_upload_history (
  upload_id          STRING    NOT NULL  COMMENT 'Application-generated id (upl_<ts>_<rand>) — logical primary key',
  client_id          STRING              COMMENT 'Multi-tenant client identifier',
  file_name          STRING              COMMENT 'Original uploaded file name',
  file_type          STRING              COMMENT 'csv | xlsx',
  data_type          STRING              COMMENT 'gl-actuals | budget | forecast | headcount | vendors | external-labor',
  period             STRING              COMMENT 'ISO month stamp used during mapping/validation',
  uploaded_at        TIMESTAMP           COMMENT 'When the upload was received',
  row_count          BIGINT              COMMENT 'Raw data rows parsed from the file',
  column_count       BIGINT              COMMENT 'Columns detected in the header row',
  validation_status  STRING              COMMENT 'pass | warn | error (combined file + semantic)',
  error_count        BIGINT              COMMENT 'Blocking validation errors',
  warning_count      BIGINT              COMMENT 'Advisory validation warnings',
  ready_for_staging  BOOLEAN             COMMENT 'No errors AND at least one row',
  status             STRING              COMMENT 'uploaded | validated | staged | failed',
  created_at         TIMESTAMP           COMMENT 'Row insert time',
  updated_at         TIMESTAMP           COMMENT 'Last status-transition time'
)
USING DELTA
COMMENT 'Nexora ingestion upload-history metadata (Sprint 11A.4). One row per upload; NO financial fact rows.'
TBLPROPERTIES ('delta.appendOnly' = 'false');

-- Optional informational primary key (NOT ENFORCED). Uncomment if your Unity
-- Catalog runtime supports table constraints:
-- ALTER TABLE nexora.finance.ingest_upload_history
--   ADD CONSTRAINT pk_ingest_upload_history PRIMARY KEY (upload_id) NOT ENFORCED;

-- Verify after creation:
-- DESCRIBE TABLE nexora.finance.ingest_upload_history;
-- SELECT COUNT(*) AS rows FROM nexora.finance.ingest_upload_history;
