import type { ExternalLaborRecord, RiskLevel, DataSource } from "@/lib/models/finance.types";
import type { MapResult } from "./gl.mapper";

function num(v: string | undefined): number {
  if (!v) return 0;
  const n = parseFloat(v.replace(/[$,\s]/g, ""));
  return isNaN(n) ? 0 : n;
}

function bool(v: string | undefined): boolean {
  return ["true", "yes", "1", "y"].includes((v ?? "").toLowerCase());
}

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const val = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()];
    if (val !== undefined && val !== "") return val;
  }
  return "";
}

const VALID_RISK: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
type LaborStatus = ExternalLaborRecord["status"];
const VALID_STATUS: LaborStatus[] = ["Active", "Ending Soon", "Over Budget", "Completed"];

export function mapExternalLabor(
  rows: Record<string, string>[],
  clientId: string,
  period: string,
  source: DataSource = "upload"
): MapResult<ExternalLaborRecord> {
  const data: ExternalLaborRecord[] = [];
  const warnings: string[] = [];

  rows.forEach((row, i) => {
    const contractorId = pick(row, "contractor_id", "id");
    const name         = pick(row, "name", "contractor_name", "full_name");
    const rawRisk      = pick(row, "risk_level", "risk");
    const rawStatus    = pick(row, "status");
    const riskLevel    = VALID_RISK.includes(rawRisk as RiskLevel) ? (rawRisk as RiskLevel) : "Medium";
    const status       = VALID_STATUS.includes(rawStatus as LaborStatus) ? (rawStatus as LaborStatus) : "Active";

    if (!contractorId && !name) {
      warnings.push(`Row ${i + 2}: missing contractor_id and name — skipped`);
      return;
    }

    data.push({
      clientId,
      period,
      contractorId:  contractorId || name.toLowerCase().replace(/\s+/g, "-"),
      name,
      businessUnit:  pick(row, "business_unit", "bu"),
      costCenterId:  pick(row, "cost_center_id", "cost_center"),
      role:          pick(row, "role", "title"),
      monthlyRate:   num(pick(row, "monthly_rate", "rate")),
      contractValue: num(pick(row, "contract_value", "total_value")),
      ytdSpend:      num(pick(row, "ytd_spend", "spend")),
      startDate:     pick(row, "start_date", "contract_start"),
      endDate:       pick(row, "end_date", "contract_end"),
      status,
      sowNumber:     pick(row, "sow_number", "sow") || undefined,
      vendorId:      pick(row, "vendor_id", "vendor") || undefined,
      autoRenew:     bool(pick(row, "auto_renew", "auto_renewal")),
      riskLevel,
      source,
    });
  });

  return { data, warnings };
}
