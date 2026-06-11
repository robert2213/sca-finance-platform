// Required-column profiles per data type (Sprint 11A.3).
//
// The file-structure layer checks the RAW header row, so profiles are expressed
// as *source* header aliases (snake_case, as produced by upstream finance
// systems) — NOT the camelCase target fields the semantic layer validates.
// Aliases mirror the candidate names each mapper's pick() accepts
// (src/lib/ingestion/mappers/*), restricted to the columns the semantic layer
// treats as hard-required, plus the type's measure column as a recommendation.
//
// Keyed by DataType string value to stay decoupled from the ingestion DataType
// union (the semantic runner uses the same loose-string convention).

/** A logical column and the raw header names accepted for it (case-insensitive). */
export interface RequiredColumn {
  logicalName: string;
  aliases: string[];
}

/** Per-data-type column expectations for file-structure validation. */
export interface ColumnProfile {
  dataType: string;
  /** Aliases for the in-file period column; [] when the period comes from the param. */
  periodColumns: string[];
  /** Missing → error. At least one alias must be present in the header row. */
  required: RequiredColumn[];
  /** Missing → warning (e.g. the amount/measure column, which defaults to 0). */
  recommended: RequiredColumn[];
}

const PERIOD_ALIASES = ["period_id", "period", "month"];
const COST_CENTER_ALIASES = ["cost_center_id", "cost_center", "cc_id"];
// "businessunit" is the lowercased form of the mapper's "businessUnit" alias;
// matching is case-insensitive (see normalizeHeader).
const BUSINESS_UNIT_ALIASES = ["business_unit", "businessunit", "bu"];

export const COLUMN_PROFILES: Record<string, ColumnProfile> = {
  "gl-actuals": {
    dataType: "gl-actuals",
    periodColumns: PERIOD_ALIASES,
    required: [
      { logicalName: "period", aliases: PERIOD_ALIASES },
      { logicalName: "cost_center_id", aliases: COST_CENTER_ALIASES },
      { logicalName: "business_unit", aliases: BUSINESS_UNIT_ALIASES },
      { logicalName: "category", aliases: ["category"] },
    ],
    recommended: [
      { logicalName: "amount_actual", aliases: ["amount_actual", "actual", "amount"] },
    ],
  },

  budget: {
    dataType: "budget",
    periodColumns: PERIOD_ALIASES,
    required: [
      { logicalName: "period", aliases: PERIOD_ALIASES },
      { logicalName: "cost_center_id", aliases: COST_CENTER_ALIASES },
      { logicalName: "category", aliases: ["category"] },
    ],
    recommended: [
      { logicalName: "amount_budget", aliases: ["amount_budget", "budget", "amount"] },
    ],
  },

  forecast: {
    dataType: "forecast",
    periodColumns: PERIOD_ALIASES,
    required: [
      { logicalName: "period", aliases: PERIOD_ALIASES },
      { logicalName: "cost_center_id", aliases: COST_CENTER_ALIASES },
      { logicalName: "category", aliases: ["category"] },
    ],
    recommended: [
      { logicalName: "amount_forecast", aliases: ["amount_forecast", "forecast", "amount"] },
    ],
  },

  headcount: {
    dataType: "headcount",
    periodColumns: [],
    required: [
      { logicalName: "position_id", aliases: ["position_id", "id", "employee_id"] },
      { logicalName: "title", aliases: ["title", "job_title", "role"] },
      { logicalName: "business_unit", aliases: BUSINESS_UNIT_ALIASES },
    ],
    recommended: [
      { logicalName: "annual_salary", aliases: ["annual_salary", "salary", "base_salary"] },
    ],
  },

  vendors: {
    dataType: "vendors",
    periodColumns: [],
    required: [
      { logicalName: "vendor_id", aliases: ["vendor_id", "id"] },
      { logicalName: "vendor_name", aliases: ["vendor_name", "name", "vendor"] },
    ],
    recommended: [
      { logicalName: "annual_value", aliases: ["annual_value", "contract_value", "value"] },
    ],
  },

  "external-labor": {
    dataType: "external-labor",
    periodColumns: [],
    required: [
      { logicalName: "contractor_id", aliases: ["contractor_id", "id"] },
      { logicalName: "name", aliases: ["name", "contractor_name", "full_name"] },
      { logicalName: "business_unit", aliases: BUSINESS_UNIT_ALIASES },
    ],
    recommended: [
      { logicalName: "contract_value", aliases: ["contract_value", "total_value"] },
    ],
  },
};

/** Normalize a header for case-insensitive comparison. */
export function normalizeHeader(h: string): string {
  return (h ?? "").trim().toLowerCase();
}

/** True if any alias is present among the headers (case-insensitive). */
export function hasAlias(headers: string[], aliases: string[]): boolean {
  const present = new Set(headers.map(normalizeHeader));
  return aliases.some((a) => present.has(normalizeHeader(a)));
}

/** Return the actual header string matching any alias, or undefined. */
export function findHeader(headers: string[], aliases: string[]): string | undefined {
  const wanted = new Set(aliases.map(normalizeHeader));
  return headers.find((h) => wanted.has(normalizeHeader(h)));
}

/** Look up the profile for a data type, or undefined if none is defined. */
export function getColumnProfile(dataType: string): ColumnProfile | undefined {
  return COLUMN_PROFILES[dataType];
}
