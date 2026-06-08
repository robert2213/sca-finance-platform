-- Migration 002: Backfill client_id for all existing rows
-- Run this AFTER migration 001 (add-client-id).
-- Sets client_id = 'demo-client' for all rows where client_id is NULL.
-- This represents the initial/demo tenant — update before adding real clients.
--
-- Catalog: nexora  Schema: finance

UPDATE nexora.finance.fact_transactions
  SET client_id = 'demo-client'
  WHERE client_id IS NULL;

UPDATE nexora.finance.dim_vendor
  SET client_id = 'demo-client'
  WHERE client_id IS NULL;

UPDATE nexora.finance.dim_cost_center
  SET client_id = 'demo-client'
  WHERE client_id IS NULL;

UPDATE nexora.finance.dim_contractor
  SET client_id = 'demo-client'
  WHERE client_id IS NULL;

UPDATE nexora.finance.dim_headcount
  SET client_id = 'demo-client'
  WHERE client_id IS NULL;

-- Verify row counts after backfill
SELECT 'fact_transactions' AS tbl, COUNT(*) AS total_rows, COUNT(client_id) AS rows_with_client_id FROM nexora.finance.fact_transactions
UNION ALL
SELECT 'dim_vendor',      COUNT(*), COUNT(client_id) FROM nexora.finance.dim_vendor
UNION ALL
SELECT 'dim_cost_center', COUNT(*), COUNT(client_id) FROM nexora.finance.dim_cost_center
UNION ALL
SELECT 'dim_contractor',  COUNT(*), COUNT(client_id) FROM nexora.finance.dim_contractor
UNION ALL
SELECT 'dim_headcount',   COUNT(*), COUNT(client_id) FROM nexora.finance.dim_headcount;
