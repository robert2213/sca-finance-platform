// Connector registry — stub definitions for external system integrations.
// Each connector describes its expected input/output shape.
// Implement by replacing the stub body with real API/SDK calls.

import type {
  ActualEntry,
  BudgetEntry,
  HeadcountRecord,
  ExternalLaborRecord,
  VendorSpendRecord,
} from "@/lib/models/finance.types";

export interface ConnectorResult<T> {
  data: T[];
  warnings: string[];
  connectorId: string;
  fetchedAt: Date;
}

// ─── QuickBooks Online ─────────────────────────────────────────────────────────
// TODO: QuickBooks integration — use @intuit/oauth-jsclient + REST API
// Input: QuickBooks realm ID + OAuth2 token
// Output: GL transactions mapped to ActualEntry[]
export async function fetchQuickBooksActuals(
  _realmId: string,
  _accessToken: string,
  _period: string
): Promise<ConnectorResult<ActualEntry>> {
  return {
    data: [],
    warnings: ["QuickBooks connector not yet implemented"],
    connectorId: "quickbooks",
    fetchedAt: new Date(),
  };
}

// ─── NetSuite ──────────────────────────────────────────────────────────────────
// TODO: NetSuite integration — use SuiteAnalytics REST API or SOAP
// Input: NetSuite account credentials + period
// Output: GL journal entries mapped to ActualEntry[]
export async function fetchNetSuiteActuals(
  _accountId: string,
  _period: string
): Promise<ConnectorResult<ActualEntry>> {
  return {
    data: [],
    warnings: ["NetSuite connector not yet implemented"],
    connectorId: "netsuite",
    fetchedAt: new Date(),
  };
}

// ─── Workday HCM ───────────────────────────────────────────────────────────────
// TODO: Workday integration — use Workday REST API (Staffing WD v37+)
// Input: Workday tenant URL + bearer token
// Output: Position records mapped to HeadcountRecord[]
export async function fetchWorkdayHeadcount(
  _tenantUrl: string,
  _accessToken: string,
  _period: string
): Promise<ConnectorResult<HeadcountRecord>> {
  return {
    data: [],
    warnings: ["Workday connector not yet implemented"],
    connectorId: "workday",
    fetchedAt: new Date(),
  };
}

// ─── Beeline / Fieldglass ──────────────────────────────────────────────────────
// TODO: VMS integration — use Beeline or SAP Fieldglass REST API
// Input: VMS API key + period
// Output: Contractor records mapped to ExternalLaborRecord[]
export async function fetchVmsContractors(
  _apiKey: string,
  _period: string
): Promise<ConnectorResult<ExternalLaborRecord>> {
  return {
    data: [],
    warnings: ["VMS connector not yet implemented"],
    connectorId: "vms",
    fetchedAt: new Date(),
  };
}

// ─── Databricks SQL ────────────────────────────────────────────────────────────
// TODO: Databricks integration — wire to src/lib/adapters/databricks-adapter.ts
// Input: SQL query string + warehouse config from env
// Output: Raw rows that feed through the relevant mapper
export async function fetchDatabricksActuals(
  _sql: string
): Promise<ConnectorResult<ActualEntry>> {
  return {
    data: [],
    warnings: ["Databricks connector not yet implemented — use src/lib/queries/actuals.ts directly"],
    connectorId: "databricks",
    fetchedAt: new Date(),
  };
}

// ─── Coupa ────────────────────────────────────────────────────────────────────
// TODO: Coupa integration — use Coupa REST API v2
// Input: Coupa instance URL + API key
// Output: PO/invoice data mapped to VendorSpendRecord[]
export async function fetchCoupaVendors(
  _instanceUrl: string,
  _apiKey: string,
  _period: string
): Promise<ConnectorResult<VendorSpendRecord>> {
  return {
    data: [],
    warnings: ["Coupa connector not yet implemented"],
    connectorId: "coupa",
    fetchedAt: new Date(),
  };
}

// ─── Adaptive Planning (Workday) ───────────────────────────────────────────────
// TODO: Adaptive Planning integration — use Workday Adaptive REST API
// Input: Adaptive credentials + fiscal period
// Output: Budget/forecast entries mapped to BudgetEntry[]
export async function fetchAdaptiveBudget(
  _apiKey: string,
  _period: string
): Promise<ConnectorResult<BudgetEntry>> {
  return {
    data: [],
    warnings: ["Adaptive Planning connector not yet implemented"],
    connectorId: "adaptive",
    fetchedAt: new Date(),
  };
}

export const connectorRegistry = {
  quickbooks: fetchQuickBooksActuals,
  netsuite:   fetchNetSuiteActuals,
  workday:    fetchWorkdayHeadcount,
  vms:        fetchVmsContractors,
  databricks: fetchDatabricksActuals,
  coupa:      fetchCoupaVendors,
  adaptive:   fetchAdaptiveBudget,
} as const;

export type ConnectorId = keyof typeof connectorRegistry;
