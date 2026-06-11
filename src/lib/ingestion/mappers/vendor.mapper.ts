import type { VendorSpendRecord, RiskLevel, DataSource } from "@/lib/models/finance.types";
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

export function mapVendors(
  rows: Record<string, string>[],
  clientId: string,
  period: string,
  source: DataSource = "upload"
): MapResult<VendorSpendRecord> {
  const data: VendorSpendRecord[] = [];
  const warnings: string[] = [];

  rows.forEach((row, i) => {
    const vendorId   = pick(row, "vendor_id", "id");
    const vendorName = pick(row, "vendor_name", "name", "vendor");
    const rawRisk    = pick(row, "risk_level", "risk");
    const riskLevel  = VALID_RISK.includes(rawRisk as RiskLevel)
      ? (rawRisk as RiskLevel)
      : "Medium";

    if (!vendorId && !vendorName) {
      warnings.push(`Row ${i + 2}: missing vendor_id and vendor_name — skipped`);
      return;
    }

    if (rawRisk && !VALID_RISK.includes(rawRisk as RiskLevel)) {
      warnings.push(`Row ${i + 2}: unrecognized risk_level "${rawRisk}", defaulted to "Medium"`);
    }

    data.push({
      clientId,
      period,
      vendorId:       vendorId || vendorName.toLowerCase().replace(/\s+/g, "-"),
      vendorName,
      category:       pick(row, "category", "vendor_category"),
      businessUnit:   pick(row, "business_unit", "bu"),
      costCenterId:   pick(row, "cost_center_id", "cost_center"),
      annualValue:    num(pick(row, "annual_value", "contract_value", "value")),
      ytdSpend:       num(pick(row, "ytd_spend", "spend", "amount")),
      contractStart:  pick(row, "contract_start", "start_date") || "",
      contractEnd:    pick(row, "contract_end", "end_date") || "",
      autoRenew:      bool(pick(row, "auto_renew", "auto_renewal")),
      riskLevel,
      source,
    });
  });

  return { data, warnings };
}
