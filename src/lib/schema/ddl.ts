/**
 * Phase 4 — Finance Data Model DDL
 *
 * These statements create the Databricks Delta Lake tables used by Nexora.
 * Run via GET /api/db/init (idempotent — uses CREATE TABLE IF NOT EXISTS).
 *
 * For the local SQLite fallback, equivalent tables are created by
 * src/lib/adapters/local-adapter.ts initSchema().
 *
 * Note: DEFAULT column values and GENERATED ALWAYS AS IDENTITY require the
 * delta.feature.allowColumnDefaults table property to be enabled first.
 * To keep init idempotent on a fresh workspace those features are omitted here;
 * application code is responsible for supplying all non-nullable values.
 */

export const DDL_FACT_TRANSACTIONS = `
CREATE TABLE IF NOT EXISTS fact_transactions (
  transaction_id    STRING        NOT NULL  COMMENT 'Unique key: source-costCenter-date-amount-idx',
  date              DATE          NOT NULL  COMMENT 'Transaction date (YYYY-MM-DD)',
  period            STRING        NOT NULL  COMMENT 'Fiscal period (YYYY-MM)',
  cost_center_id    STRING        NOT NULL  COMMENT 'FK → dim_cost_center.cost_center_id',
  cost_center_name  STRING        NOT NULL,
  vendor_id         STRING                  COMMENT 'FK → dim_vendor.vendor_id (nullable)',
  category          STRING        NOT NULL  COMMENT 'CostCategory: Cloud, Software, Labor, etc.',
  subcategory       STRING,
  business_unit     STRING        NOT NULL,
  amount_actual     DOUBLE        NOT NULL,
  amount_budget     DOUBLE        NOT NULL,
  amount_forecast   DOUBLE        NOT NULL,
  transaction_type  STRING        NOT NULL  COMMENT 'actual | budget | forecast',
  source_system     STRING        NOT NULL  COMMENT 'gl-export | payroll | quickbooks | stripe | static'
)
USING DELTA
PARTITIONED BY (period)
COMMENT 'Central fact table for all financial transactions'
TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact'   = 'true'
)
`;

export const DDL_DIM_VENDOR = `
CREATE TABLE IF NOT EXISTS dim_vendor (
  vendor_id         STRING  NOT NULL  PRIMARY KEY,
  vendor_name       STRING  NOT NULL,
  vendor_category   STRING  NOT NULL,
  contract_start    DATE,
  contract_end      DATE,
  contract_value    DOUBLE  NOT NULL  COMMENT 'Annual contract value (USD)',
  ytd_spend         DOUBLE  NOT NULL,
  remaining         DOUBLE  NOT NULL,
  business_unit     STRING,
  auto_renew        BOOLEAN NOT NULL,
  risk_level        STRING  NOT NULL  COMMENT 'Low | Medium | High',
  status            STRING  NOT NULL
)
USING DELTA
COMMENT 'Vendor master — contracts, spend, and risk'
`;

export const DDL_DIM_COST_CENTER = `
CREATE TABLE IF NOT EXISTS dim_cost_center (
  cost_center_id    STRING  NOT NULL  PRIMARY KEY,
  cost_center_name  STRING  NOT NULL,
  department        STRING  NOT NULL,
  owner             STRING,
  budget_owner      STRING
)
USING DELTA
COMMENT 'Cost center master'
`;

export const DDL_DIM_PERIOD = `
CREATE TABLE IF NOT EXISTS dim_period (
  period_id    STRING   NOT NULL  PRIMARY KEY  COMMENT 'YYYY-MM',
  year         INTEGER  NOT NULL,
  month        INTEGER  NOT NULL,
  month_name   STRING   NOT NULL,
  quarter      INTEGER  NOT NULL,
  is_closed    BOOLEAN  NOT NULL
)
USING DELTA
COMMENT 'Fiscal period dimension'
`;

export const DDL_DIM_CONTRACTOR = `
CREATE TABLE IF NOT EXISTS dim_contractor (
  contractor_id     STRING  NOT NULL  PRIMARY KEY,
  contractor_name   STRING  NOT NULL,
  role              STRING  NOT NULL,
  vendor            STRING  NOT NULL,
  cost_center_id    STRING  NOT NULL,
  cost_center_name  STRING,
  business_unit     STRING  NOT NULL,
  monthly_rate      DOUBLE  NOT NULL,
  ytd_spend         DOUBLE  NOT NULL,
  budget            DOUBLE  NOT NULL,
  start_date        DATE,
  end_date          DATE,
  status            STRING  NOT NULL
)
USING DELTA
COMMENT 'External labor / contractor engagements'
`;

export const DDL_DIM_HEADCOUNT = `
CREATE TABLE IF NOT EXISTS dim_headcount (
  position_id    STRING  NOT NULL  PRIMARY KEY,
  title          STRING  NOT NULL,
  business_unit  STRING  NOT NULL,
  level          STRING  NOT NULL,
  status         STRING  NOT NULL  COMMENT 'Filled | Open | Pending Offer | On Leave',
  location       STRING,
  open_date      DATE,
  fill_date      DATE,
  annual_salary  DOUBLE  NOT NULL,
  is_backfill    BOOLEAN NOT NULL
)
USING DELTA
COMMENT 'Headcount plan and position roster'
`;

export const DDL_DATA_QUALITY_LOG = `
CREATE TABLE IF NOT EXISTS data_quality_log (
  log_id       BIGINT,
  logged_at    TIMESTAMP NOT NULL,
  source_file  STRING    NOT NULL,
  table_name   STRING    NOT NULL,
  action       STRING    NOT NULL,
  detail       STRING,
  row_count    INTEGER   NOT NULL
)
USING DELTA
COMMENT 'Audit log of all data quality actions during ingestion'
TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true')
`;

export const ALL_DDL = [
  { name: "dim_cost_center",   sql: DDL_DIM_COST_CENTER },
  { name: "dim_period",        sql: DDL_DIM_PERIOD },
  { name: "dim_vendor",        sql: DDL_DIM_VENDOR },
  { name: "dim_contractor",    sql: DDL_DIM_CONTRACTOR },
  { name: "dim_headcount",     sql: DDL_DIM_HEADCOUNT },
  { name: "fact_transactions", sql: DDL_FACT_TRANSACTIONS },
  { name: "data_quality_log",  sql: DDL_DATA_QUALITY_LOG },
];
