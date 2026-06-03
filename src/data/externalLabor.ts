import type { Contractor } from "@/types/finance";

export const contractors: Contractor[] = [
  {
    id: "EL-001",
    name: "Jordan Alvarez",
    role: "Cloud Infrastructure Engineer",
    vendor: "TechForce Staffing",
    costCenterId: "CC-501",
    costCenterName: "AWS Production",
    businessUnit: "Cloud Engineering",
    monthlyRate: 18_500,
    ytdSpend: 92_500,
    budget: 90_000,
    startDate: "2026-01-01",
    endDate: "2026-09-30",
    status: "Over Budget",
  },
  {
    id: "EL-002",
    name: "Priya Nair",
    role: "Senior Data Engineer",
    vendor: "Apex Consulting",
    costCenterId: "CC-401",
    costCenterName: "Data Platform",
    businessUnit: "Data & Analytics",
    monthlyRate: 21_000,
    ytdSpend: 105_000,
    budget: 110_000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "Active",
  },
  {
    id: "EL-003",
    name: "Marcus Webb",
    role: "Cybersecurity Analyst",
    vendor: "Shield IT Resources",
    costCenterId: "CC-201",
    costCenterName: "Cybersecurity Ops",
    businessUnit: "Security",
    monthlyRate: 16_000,
    ytdSpend: 80_000,
    budget: 80_000,
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    status: "Ending Soon",
  },
  {
    id: "EL-004",
    name: "Sofia Reyes",
    role: "SAP FICO Consultant",
    vendor: "Deloitte",
    costCenterId: "CC-301",
    costCenterName: "ERP & Finance Systems",
    businessUnit: "Applications",
    monthlyRate: 28_000,
    ytdSpend: 140_000,
    budget: 125_000,
    startDate: "2026-01-01",
    endDate: "2026-08-31",
    status: "Over Budget",
  },
  {
    id: "EL-005",
    name: "Derek Hoffman",
    role: "Network Architect",
    vendor: "NetCore Partners",
    costCenterId: "CC-101",
    costCenterName: "Network & Telecom",
    businessUnit: "Infrastructure",
    monthlyRate: 19_500,
    ytdSpend: 97_500,
    budget: 100_000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "Active",
  },
  {
    id: "EL-006",
    name: "Anita Patel",
    role: "ML Platform Engineer",
    vendor: "Apex Consulting",
    costCenterId: "CC-503",
    costCenterName: "GCP AI/ML Workloads",
    businessUnit: "Cloud Engineering",
    monthlyRate: 24_000,
    ytdSpend: 120_000,
    budget: 120_000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "Active",
  },
  {
    id: "EL-007",
    name: "Ryan Kowalski",
    role: "ServiceNow Developer",
    vendor: "CloudBridge Staffing",
    costCenterId: "CC-602",
    costCenterName: "ITSM & Tooling",
    businessUnit: "IT Operations",
    monthlyRate: 14_000,
    ytdSpend: 70_000,
    budget: 70_000,
    startDate: "2026-01-01",
    endDate: "2026-07-31",
    status: "Ending Soon",
  },
  {
    id: "EL-008",
    name: "Mei-Lin Chen",
    role: "BI & Analytics Developer",
    vendor: "DataVision Inc",
    costCenterId: "CC-402",
    costCenterName: "BI & Reporting",
    businessUnit: "Data & Analytics",
    monthlyRate: 15_500,
    ytdSpend: 62_000,
    budget: 70_000,
    startDate: "2026-02-01",
    endDate: "2026-11-30",
    status: "Active",
  },
  {
    id: "EL-009",
    name: "Carlos Mendoza",
    role: "Enterprise Architect",
    vendor: "Accenture",
    costCenterId: "CC-701",
    costCenterName: "EA & Strategy",
    businessUnit: "Enterprise Architecture",
    monthlyRate: 32_000,
    ytdSpend: 160_000,
    budget: 150_000,
    startDate: "2026-01-01",
    endDate: "2026-10-31",
    status: "Over Budget",
  },
  {
    id: "EL-010",
    name: "Tasha Williams",
    role: "IAM Engineer",
    vendor: "Shield IT Resources",
    costCenterId: "CC-202",
    costCenterName: "Identity & Access Mgmt",
    businessUnit: "Security",
    monthlyRate: 17_000,
    ytdSpend: 85_000,
    budget: 90_000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "Active",
  },
  {
    id: "EL-011",
    name: "James O'Brien",
    role: "Azure DevOps Engineer",
    vendor: "TechForce Staffing",
    costCenterId: "CC-502",
    costCenterName: "Azure Dev/Test",
    businessUnit: "Cloud Engineering",
    monthlyRate: 16_500,
    ytdSpend: 82_500,
    budget: 75_000,
    startDate: "2026-01-01",
    endDate: "2026-08-31",
    status: "Over Budget",
  },
  {
    id: "EL-012",
    name: "Nadia Okonkwo",
    role: "Data Governance Analyst",
    vendor: "DataVision Inc",
    costCenterId: "CC-401",
    costCenterName: "Data Platform",
    businessUnit: "Data & Analytics",
    monthlyRate: 13_500,
    ytdSpend: 54_000,
    budget: 67_500,
    startDate: "2026-02-01",
    endDate: "2026-12-31",
    status: "Active",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTotalContractorYTDSpend(): number {
  return contractors.reduce((s, c) => s + c.ytdSpend, 0);
}

export function getTotalContractorBudget(): number {
  return contractors.reduce((s, c) => s + c.budget, 0);
}

export function getOverBudgetContractors(): Contractor[] {
  return contractors.filter((c) => c.status === "Over Budget");
}

export function getEndingSoonContractors(): Contractor[] {
  return contractors.filter((c) => c.status === "Ending Soon");
}

export function getContractorsByBU() {
  const map = new Map<string, { ytdSpend: number; budget: number; count: number }>();
  for (const c of contractors) {
    const e = map.get(c.businessUnit) ?? { ytdSpend: 0, budget: 0, count: 0 };
    map.set(c.businessUnit, { ytdSpend: e.ytdSpend + c.ytdSpend, budget: e.budget + c.budget, count: e.count + 1 });
  }
  return Array.from(map.entries()).map(([bu, v]) => ({ bu, ...v }));
}
