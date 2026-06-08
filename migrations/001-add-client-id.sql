-- Migration 001: Add client_id to all fact and dimension tables
-- Run this once against your existing Databricks workspace BEFORE deploying Client A or Client B.
-- Safe to run multiple times (ADD COLUMN IF NOT EXISTS is idempotent in Databricks).
--
-- After running this migration, run migration 002 to backfill existing rows.
-- Catalog: nexora  Schema: finance

-- ── fact_transactions ──────────────────────────────────────────────────────────
ALTER TABLE nexora.finance.fact_transactions
  ADD COLUMN IF NOT EXISTS client_id STRING
  COMMENT 'Multi-tenant client identifier — required for all new writes';

-- ── dim_vendor ─────────────────────────────────────────────────────────────────
ALTER TABLE nexora.finance.dim_vendor
  ADD COLUMN IF NOT EXISTS client_id STRING
  COMMENT 'Multi-tenant client identifier';

-- ── dim_cost_center ────────────────────────────────────────────────────────────
ALTER TABLE nexora.finance.dim_cost_center
  ADD COLUMN IF NOT EXISTS client_id STRING
  COMMENT 'Multi-tenant client identifier';

-- ── dim_contractor ─────────────────────────────────────────────────────────────
ALTER TABLE nexora.finance.dim_contractor
  ADD COLUMN IF NOT EXISTS client_id STRING
  COMMENT 'Multi-tenant client identifier';

-- ── dim_headcount ──────────────────────────────────────────────────────────────
ALTER TABLE nexora.finance.dim_headcount
  ADD COLUMN IF NOT EXISTS client_id STRING
  COMMENT 'Multi-tenant client identifier';
