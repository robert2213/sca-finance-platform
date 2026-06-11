import { dbQuery } from "@/lib/databricks";
import { DEFAULT_CLIENT_ID } from "@/config/client.resolver";
import type { BusinessUnit } from "@/types/finance";

export interface VendorRow {
  id: string;
  name: string;
  category: string;
  contractStart: string;
  contractEnd: string;
  annualValue: number;
  ytdSpend: number;
  remainingCommitment: number;
  businessUnit: BusinessUnit;
  autoRenew: boolean;
  riskLevel: "Low" | "Medium" | "High";
}

export async function getVendors(clientId: string = DEFAULT_CLIENT_ID): Promise<VendorRow[]> {
  const sql = `
    SELECT
      vendor_id, vendor_name, vendor_category,
      contract_start, contract_end,
      contract_value, ytd_spend, remaining,
      business_unit, auto_renew, risk_level
    FROM dim_vendor
    WHERE client_id = ?
    ORDER BY contract_value DESC
  `;
  const result = await dbQuery<{
    vendor_id: string;
    vendor_name: string;
    vendor_category: string;
    contract_start: string;
    contract_end: string;
    contract_value: number;
    ytd_spend: number;
    remaining: number;
    business_unit: string;
    auto_renew: number | boolean;
    risk_level: string;
  }>(sql, [clientId]);

  return result.rows.map((r) => ({
    id:                  r.vendor_id,
    name:                r.vendor_name,
    category:            r.vendor_category,
    contractStart:       r.contract_start ?? "",
    contractEnd:         r.contract_end ?? "",
    annualValue:         Number(r.contract_value) || 0,
    ytdSpend:            Number(r.ytd_spend) || 0,
    remainingCommitment: Number(r.remaining) || 0,
    businessUnit:        r.business_unit as BusinessUnit,
    autoRenew:           Boolean(r.auto_renew),
    riskLevel:           (r.risk_level ?? "Low") as VendorRow["riskLevel"],
  }));
}

export async function getVendorSpend(
  period: string,
  topN: number = 10,
  clientId: string = DEFAULT_CLIENT_ID
): Promise<{ vendorId: string | null; vendorName: string; totalSpend: number }[]> {
  const sql = `
    SELECT
      t.vendor_id,
      COALESCE(v.vendor_name, t.vendor_id, 'Unknown') AS vendor_name,
      SUM(t.amount_actual) AS total_spend
    FROM fact_transactions t
    LEFT JOIN dim_vendor v ON t.vendor_id = v.vendor_id
    WHERE t.period <= ? AND t.transaction_type = 'actual' AND t.client_id = ?
    GROUP BY t.vendor_id, vendor_name
    ORDER BY total_spend DESC
    LIMIT ?
  `;
  const result = await dbQuery<{
    vendor_id: string | null;
    vendor_name: string;
    total_spend: number;
  }>(sql, [period, clientId, topN]);

  return result.rows.map((r) => ({
    vendorId:    r.vendor_id,
    vendorName:  r.vendor_name,
    totalSpend:  Number(r.total_spend) || 0,
  }));
}
