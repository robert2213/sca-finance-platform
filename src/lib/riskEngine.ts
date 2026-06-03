import type { RiskFlag } from "@/types/finance";
import { actuals } from "@/data/actuals";
import { getVendorsExpiringSoon, getVendorsByRisk } from "@/data/vendors";
import { getOverBudgetContractors, getEndingSoonContractors } from "@/data/externalLabor";
import { getOpenReqs } from "@/data/headcount";
import { getTotalCloudYTD, getTotalCloudBudgetYTD } from "@/data/cloudSpend";

let riskIdCounter = 1;
function mkId() { return `RISK-${String(riskIdCounter++).padStart(3, "0")}`; }

export function generateRiskFlags(): RiskFlag[] {
  riskIdCounter = 1; // reset on each call for determinism
  const flags: RiskFlag[] = [];

  // ── Cloud overage ──────────────────────────────────────────────────────────
  const cloudActual = getTotalCloudYTD();
  const cloudBudget = getTotalCloudBudgetYTD();
  const cloudVar    = cloudActual - cloudBudget;
  if (cloudVar > 0) {
    flags.push({
      id: mkId(),
      severity: cloudVar > 100_000 ? "critical" : "warning",
      title: "Cloud Spend Trending Over Budget",
      description: `YTD cloud spend is $${(cloudVar / 1000).toFixed(0)}K over budget. AWS EC2 and GCP BigQuery are the primary drivers. Full-year overrun projected at $${((cloudVar / 5) * 12 / 1000).toFixed(0)}K.`,
      category: "Cloud",
      impact: (cloudVar / 5) * 7, // remaining 7 months extrapolated
    });
  }

  // ── Contracts expiring in < 90 days ────────────────────────────────────────
  const criticalExpiry = getVendorsExpiringSoon(90);
  for (const v of criticalExpiry) {
    flags.push({
      id: mkId(),
      severity: "critical",
      title: `Contract Expiring: ${v.name}`,
      description: `Contract ends ${v.contractEnd}. Remaining commitment: $${(v.remainingCommitment / 1000).toFixed(0)}K. No auto-renew. Procurement action required immediately.`,
      category: "Procurement",
      impact: v.remainingCommitment,
    });
  }

  // ── Contracts expiring in 90–180 days ─────────────────────────────────────
  const warningExpiry = getVendorsExpiringSoon(180).filter(
    (v) => !criticalExpiry.find((c) => c.id === v.id)
  );
  for (const v of warningExpiry) {
    flags.push({
      id: mkId(),
      severity: "warning",
      title: `Contract Renewal Window: ${v.name}`,
      description: `Contract expires ${v.contractEnd}. Annual value $${(v.annualValue / 1000).toFixed(0)}K. Begin renewal or RFP process within 30 days.`,
      category: "Procurement",
      impact: v.annualValue,
    });
  }

  // ── Over-budget contractors ────────────────────────────────────────────────
  const overBudget = getOverBudgetContractors();
  if (overBudget.length > 0) {
    const totalExcess = overBudget.reduce((s, c) => s + (c.ytdSpend - c.budget), 0);
    flags.push({
      id: mkId(),
      severity: "warning",
      title: `${overBudget.length} Contractors Over Budget`,
      description: `${overBudget.map((c) => c.name).join(", ")} are tracking over their approved budgets. Total excess: $${(totalExcess / 1000).toFixed(0)}K YTD. Review SOW scope creep.`,
      category: "External Labor",
      impact: totalExcess,
    });
  }

  // ── Contractors ending soon with no extension ──────────────────────────────
  const endingSoon = getEndingSoonContractors();
  if (endingSoon.length > 0) {
    flags.push({
      id: mkId(),
      severity: "info",
      title: `${endingSoon.length} Contractor Engagements Ending This Quarter`,
      description: `${endingSoon.map((c) => c.name).join(", ")} are ending within 90 days. Confirm if extensions are required or knowledge transfer plans are in place.`,
      category: "External Labor",
      impact: 0,
    });
  }

  // ── High-risk vendors ─────────────────────────────────────────────────────
  const highRisk = getVendorsByRisk("High");
  if (highRisk.length > 0) {
    flags.push({
      id: mkId(),
      severity: "warning",
      title: `${highRisk.length} High-Risk Vendor Relationships`,
      description: `${highRisk.map((v) => v.name).join(", ")} are flagged as high risk due to expiring contracts or concentration. Combined annual value: $${(highRisk.reduce((s, v) => s + v.annualValue, 0) / 1_000_000).toFixed(1)}M.`,
      category: "Procurement",
      impact: highRisk.reduce((s, v) => s + v.ytdSpend, 0),
    });
  }

  // ── Open reqs in critical BUs ─────────────────────────────────────────────
  const openReqs = getOpenReqs();
  const criticalOpenReqs = openReqs.filter(
    (h) => h.businessUnit === "Security" || h.businessUnit === "Cloud Engineering"
  );
  if (criticalOpenReqs.length > 0) {
    flags.push({
      id: mkId(),
      severity: "info",
      title: `${criticalOpenReqs.length} Open Reqs in Security & Cloud Engineering`,
      description: `Unfilled positions: ${criticalOpenReqs.map((h) => h.title).join("; ")}. Continued reliance on contractors to backfill. Carry cost risk: $${(criticalOpenReqs.reduce((s, h) => s + h.annualSalary, 0) / 1000).toFixed(0)}K/yr unfunded labor.`,
      category: "Headcount",
      impact: criticalOpenReqs.reduce((s, h) => s + h.annualSalary / 12, 0) * 3,
    });
  }

  // ── Top cost center over 5% unfavorable variance ──────────────────────────
  const latestMonth = "May";
  const mayActuals = actuals.filter((r) => r.month === latestMonth);
  const bigVariance = mayActuals.filter((r) => r.variancePct > 0.05);
  if (bigVariance.length > 0) {
    flags.push({
      id: mkId(),
      severity: "warning",
      title: `${bigVariance.length} Cost Centers with >5% Unfavorable Variance in May`,
      description: `${bigVariance.map((r) => r.costCenterName).join(", ")} are tracking more than 5% over budget for the month. Review with cost center owners before month close.`,
      category: "FP&A",
      impact: bigVariance.reduce((s, r) => s + r.variance, 0),
    });
  }

  return flags.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function generateRecommendedActions() {
  return [
    {
      id: "ACT-001",
      priority: "High" as const,
      title: "Initiate AWS Contract Renewal Negotiation",
      description: "AWS EDP expires June 30. Engage AWS account team for multi-year commit pricing. Target 15% discount on current run rate.",
      owner: "Procurement + Cloud Engineering",
      dueDate: "2026-06-15",
    },
    {
      id: "ACT-002",
      priority: "High" as const,
      title: "Review Over-Budget External Labor SOWs",
      description: "4 contractors are over their approved budgets. Obtain amended SOWs or issue PO amendments before June month-end close.",
      owner: "IT Finance / FP&A",
      dueDate: "2026-06-30",
    },
    {
      id: "ACT-003",
      priority: "High" as const,
      title: "Cloud Cost Optimization Review",
      description: "Engage FinOps team to review EC2 right-sizing and BigQuery slot commitments. Estimated savings opportunity: $180K annually.",
      owner: "Cloud Engineering + FinOps",
      dueDate: "2026-07-15",
    },
    {
      id: "ACT-004",
      priority: "Medium" as const,
      title: "Deloitte ERP Engagement Close-Out",
      description: "Contract ends July 31. Ensure all deliverables are accepted, final invoices processed, and knowledge transfer complete.",
      owner: "Applications + Procurement",
      dueDate: "2026-07-31",
    },
    {
      id: "ACT-005",
      priority: "Medium" as const,
      title: "ServiceNow Renewal or Alternative RFP",
      description: "Contract expires August 31. Evaluate whether to renew at current rate or issue RFP for ITSM platform alternatives.",
      owner: "IT Operations + Procurement",
      dueDate: "2026-07-01",
    },
    {
      id: "ACT-006",
      priority: "Low" as const,
      title: "Headcount Pipeline Review — Security & Cloud",
      description: "7 open reqs in Security and Cloud Engineering. Coordinate with TA on target fill dates to reduce contractor dependency.",
      owner: "IT Finance + HR",
      dueDate: "2026-07-15",
    },
  ];
}
