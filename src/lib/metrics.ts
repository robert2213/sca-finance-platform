import {
  getYTDActual, getYTDBudget, getYTDVariance,
  getTotalContractorYTDSpend, getTotalContractorBudget,
  getHeadcountSummary, getTotalAnnualSalaryBudget,
  getTotalYTDVendorSpend, getTotalAnnualCommitment,
  getTotalCloudYTD, getTotalCloudBudgetYTD,
} from "@/data/index";
import type { KPI } from "@/types/finance";

export function buildDashboardKPIs(): KPI[] {
  const ytdActual    = getYTDActual();
  const ytdBudget    = getYTDBudget();
  const ytdVariance  = getYTDVariance();
  const ytdVarPct    = ytdBudget > 0 ? ytdVariance / ytdBudget : 0;

  const extLaborActual = getTotalContractorYTDSpend();
  const extLaborBudget = getTotalContractorBudget();
  const extLaborVar    = extLaborActual - extLaborBudget;

  const hc = getHeadcountSummary();

  const vendorSpend    = getTotalYTDVendorSpend();
  const vendorCommit   = getTotalAnnualCommitment();

  const cloudActual = getTotalCloudYTD();
  const cloudBudget = getTotalCloudBudgetYTD();

  return [
    {
      label: "YTD Total IT Spend",
      value: ytdActual,
      budget: ytdBudget,
      prior: ytdBudget * 0.94,  // prior year same period (simulated)
      format: "currency",
      trend: ytdVariance > 0 ? "up" : "down",
      trendPositive: false,     // spending over budget is bad
    },
    {
      label: "YTD Budget Variance",
      value: ytdVarPct,
      budget: 0,
      prior: 0.02,              // prior period variance
      format: "percent",
      trend: ytdVariance > 0 ? "up" : "down",
      trendPositive: false,
    },
    {
      label: "External Labor Spend",
      value: extLaborActual,
      budget: extLaborBudget,
      prior: extLaborBudget * 0.88,
      format: "currency",
      trend: extLaborVar > 0 ? "up" : "down",
      trendPositive: false,
    },
    {
      label: "Cloud Spend YTD",
      value: cloudActual,
      budget: cloudBudget,
      prior: cloudBudget * 0.91,
      format: "currency",
      trend: cloudActual > cloudBudget ? "up" : "down",
      trendPositive: false,
    },
    {
      label: "Vendor Commitment",
      value: vendorSpend,
      budget: vendorCommit / 2,  // approx half-year budget
      prior: (vendorCommit / 2) * 0.95,
      format: "currency",
      trend: "up",
      trendPositive: false,
    },
    {
      label: "Active Headcount",
      value: hc.filled,
      budget: hc.total,
      prior: hc.filled - 1,
      format: "headcount",
      trend: "flat",
      trendPositive: true,
    },
    {
      label: "Open Requisitions",
      value: hc.open,
      budget: 0,
      prior: hc.open + 2,
      format: "headcount",
      trend: "down",
      trendPositive: true,      // fewer open reqs = good if intentional
    },
    {
      label: "Annual Salary Budget",
      value: getTotalAnnualSalaryBudget(),
      budget: getTotalAnnualSalaryBudget() * 1.05,
      prior: getTotalAnnualSalaryBudget() * 0.97,
      format: "currency",
      trend: "up",
      trendPositive: false,
    },
  ];
}
