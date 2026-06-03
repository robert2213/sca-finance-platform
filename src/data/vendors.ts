import type { Vendor } from "@/types/finance";

export const vendors: Vendor[] = [
  {
    id: "V-001",
    name: "Microsoft (Azure + M365)",
    category: "Software",
    contractStart: "2024-01-01",
    contractEnd: "2026-12-31",
    annualValue: 2_850_000,
    ytdSpend: 1_195_000,
    remainingCommitment: 1_655_000,
    businessUnit: "Cloud Engineering",
    autoRenew: true,
    riskLevel: "Low",
  },
  {
    id: "V-002",
    name: "Amazon Web Services",
    category: "Cloud",
    contractStart: "2023-07-01",
    contractEnd: "2026-06-30",
    annualValue: 4_560_000,
    ytdSpend: 1_995_000,
    remainingCommitment: 2_565_000,
    businessUnit: "Cloud Engineering",
    autoRenew: false,
    riskLevel: "High",
  },
  {
    id: "V-003",
    name: "ServiceNow",
    category: "Software",
    contractStart: "2025-01-01",
    contractEnd: "2026-08-31",
    annualValue: 620_000,
    ytdSpend: 258_000,
    remainingCommitment: 362_000,
    businessUnit: "IT Operations",
    autoRenew: false,
    riskLevel: "High",
  },
  {
    id: "V-004",
    name: "Salesforce",
    category: "Software",
    contractStart: "2024-03-01",
    contractEnd: "2027-02-28",
    annualValue: 980_000,
    ytdSpend: 408_000,
    remainingCommitment: 572_000,
    businessUnit: "Applications",
    autoRenew: true,
    riskLevel: "Low",
  },
  {
    id: "V-005",
    name: "Palo Alto Networks",
    category: "Software",
    contractStart: "2025-04-01",
    contractEnd: "2026-09-30",
    annualValue: 540_000,
    ytdSpend: 225_000,
    remainingCommitment: 315_000,
    businessUnit: "Security",
    autoRenew: false,
    riskLevel: "Medium",
  },
  {
    id: "V-006",
    name: "Snowflake",
    category: "Cloud",
    contractStart: "2024-06-01",
    contractEnd: "2027-05-31",
    annualValue: 1_200_000,
    ytdSpend: 508_000,
    remainingCommitment: 692_000,
    businessUnit: "Data & Analytics",
    autoRenew: true,
    riskLevel: "Low",
  },
  {
    id: "V-007",
    name: "Accenture (Project Delivery)",
    category: "Professional Services",
    contractStart: "2026-01-01",
    contractEnd: "2026-10-31",
    annualValue: 1_800_000,
    ytdSpend: 745_000,
    remainingCommitment: 1_055_000,
    businessUnit: "Enterprise Architecture",
    autoRenew: false,
    riskLevel: "Medium",
  },
  {
    id: "V-008",
    name: "Okta",
    category: "Software",
    contractStart: "2025-09-01",
    contractEnd: "2026-08-31",
    annualValue: 310_000,
    ytdSpend: 129_000,
    remainingCommitment: 181_000,
    businessUnit: "Security",
    autoRenew: false,
    riskLevel: "High",
  },
  {
    id: "V-009",
    name: "Google Cloud Platform",
    category: "Cloud",
    contractStart: "2024-01-01",
    contractEnd: "2026-12-31",
    annualValue: 1_440_000,
    ytdSpend: 650_000,
    remainingCommitment: 790_000,
    businessUnit: "Cloud Engineering",
    autoRenew: true,
    riskLevel: "Low",
  },
  {
    id: "V-010",
    name: "Deloitte (ERP Consulting)",
    category: "Professional Services",
    contractStart: "2026-02-01",
    contractEnd: "2026-07-31",
    annualValue: 960_000,
    ytdSpend: 403_000,
    remainingCommitment: 557_000,
    businessUnit: "Applications",
    autoRenew: false,
    riskLevel: "High",
  },
  {
    id: "V-011",
    name: "Cisco (Network Infra)",
    category: "Hardware",
    contractStart: "2023-10-01",
    contractEnd: "2026-09-30",
    annualValue: 780_000,
    ytdSpend: 325_000,
    remainingCommitment: 455_000,
    businessUnit: "Infrastructure",
    autoRenew: true,
    riskLevel: "Low",
  },
  {
    id: "V-012",
    name: "Workday",
    category: "Software",
    contractStart: "2024-07-01",
    contractEnd: "2027-06-30",
    annualValue: 720_000,
    ytdSpend: 300_000,
    remainingCommitment: 420_000,
    businessUnit: "Applications",
    autoRenew: true,
    riskLevel: "Low",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getVendorsExpiringSoon(withinDays = 180): Vendor[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  return vendors.filter((v) => new Date(v.contractEnd) <= cutoff);
}

export function getTotalAnnualCommitment(): number {
  return vendors.reduce((s, v) => s + v.annualValue, 0);
}

export function getTotalYTDVendorSpend(): number {
  return vendors.reduce((s, v) => s + v.ytdSpend, 0);
}

export function getVendorsByRisk(level: Vendor["riskLevel"]): Vendor[] {
  return vendors.filter((v) => v.riskLevel === level);
}

export function getTopVendorsBySpend(n = 5): Vendor[] {
  return [...vendors].sort((a, b) => b.ytdSpend - a.ytdSpend).slice(0, n);
}
