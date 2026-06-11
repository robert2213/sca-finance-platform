import { dbQuery } from "@/lib/databricks";
import { DEFAULT_CLIENT_ID } from "@/config/client.resolver";
import type { BusinessUnit } from "@/types/finance";

export interface ContractorRow {
  id: string;
  name: string;
  role: string;
  vendor: string;
  costCenterId: string;
  costCenterName: string;
  businessUnit: BusinessUnit;
  monthlyRate: number;
  ytdSpend: number;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  variance: number;
}

export async function getContractors(clientId: string = DEFAULT_CLIENT_ID): Promise<ContractorRow[]> {
  const sql = `
    SELECT
      contractor_id, contractor_name, role, vendor,
      cost_center_id, COALESCE(cost_center_name, cost_center_id) AS cost_center_name,
      business_unit, monthly_rate, ytd_spend, budget,
      start_date, end_date, status
    FROM dim_contractor
    WHERE client_id = ?
    ORDER BY business_unit, contractor_name
  `;
  const result = await dbQuery<{
    contractor_id: string;
    contractor_name: string;
    role: string;
    vendor: string;
    cost_center_id: string;
    cost_center_name: string;
    business_unit: string;
    monthly_rate: number;
    ytd_spend: number;
    budget: number;
    start_date: string;
    end_date: string;
    status: string;
  }>(sql, [clientId]);

  return result.rows.map((r) => {
    const ytdSpend = Number(r.ytd_spend) || 0;
    const budget   = Number(r.budget) || 0;
    return {
      id:             r.contractor_id,
      name:           r.contractor_name,
      role:           r.role,
      vendor:         r.vendor,
      costCenterId:   r.cost_center_id,
      costCenterName: r.cost_center_name,
      businessUnit:   r.business_unit as BusinessUnit,
      monthlyRate:    Number(r.monthly_rate) || 0,
      ytdSpend,
      budget,
      startDate:    r.start_date ?? "",
      endDate:      r.end_date ?? "",
      status:       r.status,
      variance:     ytdSpend - budget,
    };
  });
}

export async function getOverBudgetContractors(clientId: string = DEFAULT_CLIENT_ID): Promise<ContractorRow[]> {
  const all = await getContractors(clientId);
  return all.filter((c) => c.ytdSpend > c.budget);
}

export async function getEndingSoonContractors(
  withinDays = 60,
  clientId: string = DEFAULT_CLIENT_ID
): Promise<ContractorRow[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const sql = `
    SELECT
      contractor_id, contractor_name, role, vendor,
      cost_center_id, COALESCE(cost_center_name, cost_center_id) AS cost_center_name,
      business_unit, monthly_rate, ytd_spend, budget,
      start_date, end_date, status
    FROM dim_contractor
    WHERE end_date <= ? AND status != 'On Hold' AND client_id = ?
    ORDER BY end_date
  `;
  const result = await dbQuery<{
    contractor_id: string;
    contractor_name: string;
    role: string;
    vendor: string;
    cost_center_id: string;
    cost_center_name: string;
    business_unit: string;
    monthly_rate: number;
    ytd_spend: number;
    budget: number;
    start_date: string;
    end_date: string;
    status: string;
  }>(sql, [cutoffStr, clientId]);

  return result.rows.map((r) => {
    const ytdSpend = Number(r.ytd_spend) || 0;
    const budget   = Number(r.budget) || 0;
    return {
      id:             r.contractor_id,
      name:           r.contractor_name,
      role:           r.role,
      vendor:         r.vendor,
      costCenterId:   r.cost_center_id,
      costCenterName: r.cost_center_name ?? r.cost_center_id,
      businessUnit:   r.business_unit as BusinessUnit,
      monthlyRate:    Number(r.monthly_rate) || 0,
      ytdSpend,
      budget,
      startDate:    r.start_date ?? "",
      endDate:      r.end_date ?? "",
      status:       r.status,
      variance:     ytdSpend - budget,
    };
  });
}

export async function getContractorsByBU(clientId: string = DEFAULT_CLIENT_ID): Promise<{
  bu: BusinessUnit;
  count: number;
  ytdSpend: number;
  budget: number;
}[]> {
  const sql = `
    SELECT
      business_unit,
      COUNT(*) AS cnt,
      SUM(ytd_spend) AS ytd_spend,
      SUM(budget) AS budget
    FROM dim_contractor
    WHERE client_id = ?
    GROUP BY business_unit
    ORDER BY ytd_spend DESC
  `;
  const result = await dbQuery<{
    business_unit: string;
    cnt: number;
    ytd_spend: number;
    budget: number;
  }>(sql, [clientId]);

  return result.rows.map((r) => ({
    bu:       r.business_unit as BusinessUnit,
    count:    Number(r.cnt) || 0,
    ytdSpend: Number(r.ytd_spend) || 0,
    budget:   Number(r.budget) || 0,
  }));
}
