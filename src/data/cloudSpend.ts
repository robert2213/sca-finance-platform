import type { CloudSpendRecord, Month } from "@/types/finance";

export const cloudSpend: CloudSpendRecord[] = [
  // ── AWS ────────────────────────────────────────────────────────────────────
  { provider: "AWS", service: "EC2 / Compute",          businessUnit: "Cloud Engineering",   month: "Jan", spend: 148_000, budget: 142_000 },
  { provider: "AWS", service: "EC2 / Compute",          businessUnit: "Cloud Engineering",   month: "Feb", spend: 152_000, budget: 142_000 },
  { provider: "AWS", service: "EC2 / Compute",          businessUnit: "Cloud Engineering",   month: "Mar", spend: 158_000, budget: 145_000 },
  { provider: "AWS", service: "EC2 / Compute",          businessUnit: "Cloud Engineering",   month: "Apr", spend: 165_000, budget: 145_000 },
  { provider: "AWS", service: "EC2 / Compute",          businessUnit: "Cloud Engineering",   month: "May", spend: 172_000, budget: 148_000 },
  { provider: "AWS", service: "S3 / Storage",           businessUnit: "Data & Analytics",    month: "Jan", spend:  42_000, budget:  40_000 },
  { provider: "AWS", service: "S3 / Storage",           businessUnit: "Data & Analytics",    month: "Feb", spend:  44_000, budget:  40_000 },
  { provider: "AWS", service: "S3 / Storage",           businessUnit: "Data & Analytics",    month: "Mar", spend:  46_000, budget:  42_000 },
  { provider: "AWS", service: "S3 / Storage",           businessUnit: "Data & Analytics",    month: "Apr", spend:  49_000, budget:  42_000 },
  { provider: "AWS", service: "S3 / Storage",           businessUnit: "Data & Analytics",    month: "May", spend:  52_000, budget:  44_000 },
  { provider: "AWS", service: "RDS / Databases",        businessUnit: "Applications",        month: "Jan", spend:  38_000, budget:  38_000 },
  { provider: "AWS", service: "RDS / Databases",        businessUnit: "Applications",        month: "Feb", spend:  39_000, budget:  38_000 },
  { provider: "AWS", service: "RDS / Databases",        businessUnit: "Applications",        month: "Mar", spend:  40_000, budget:  38_000 },
  { provider: "AWS", service: "RDS / Databases",        businessUnit: "Applications",        month: "Apr", spend:  43_000, budget:  40_000 },
  { provider: "AWS", service: "RDS / Databases",        businessUnit: "Applications",        month: "May", spend:  46_000, budget:  40_000 },

  // ── Azure ──────────────────────────────────────────────────────────────────
  { provider: "Azure", service: "Virtual Machines",     businessUnit: "Cloud Engineering",   month: "Jan", spend:  38_000, budget:  38_000 },
  { provider: "Azure", service: "Virtual Machines",     businessUnit: "Cloud Engineering",   month: "Feb", spend:  40_000, budget:  38_000 },
  { provider: "Azure", service: "Virtual Machines",     businessUnit: "Cloud Engineering",   month: "Mar", spend:  43_000, budget:  40_000 },
  { provider: "Azure", service: "Virtual Machines",     businessUnit: "Cloud Engineering",   month: "Apr", spend:  46_000, budget:  40_000 },
  { provider: "Azure", service: "Virtual Machines",     businessUnit: "Cloud Engineering",   month: "May", spend:  49_000, budget:  42_000 },
  { provider: "Azure", service: "Azure SQL / CosmosDB", businessUnit: "Data & Analytics",    month: "Jan", spend:  22_000, budget:  22_000 },
  { provider: "Azure", service: "Azure SQL / CosmosDB", businessUnit: "Data & Analytics",    month: "Feb", spend:  23_000, budget:  22_000 },
  { provider: "Azure", service: "Azure SQL / CosmosDB", businessUnit: "Data & Analytics",    month: "Mar", spend:  25_000, budget:  22_000 },
  { provider: "Azure", service: "Azure SQL / CosmosDB", businessUnit: "Data & Analytics",    month: "Apr", spend:  27_000, budget:  24_000 },
  { provider: "Azure", service: "Azure SQL / CosmosDB", businessUnit: "Data & Analytics",    month: "May", spend:  29_000, budget:  24_000 },
  { provider: "Azure", service: "M365 / Productivity",  businessUnit: "IT Operations",       month: "Jan", spend:  33_000, budget:  33_000 },
  { provider: "Azure", service: "M365 / Productivity",  businessUnit: "IT Operations",       month: "Feb", spend:  33_500, budget:  33_000 },
  { provider: "Azure", service: "M365 / Productivity",  businessUnit: "IT Operations",       month: "Mar", spend:  33_500, budget:  33_000 },
  { provider: "Azure", service: "M365 / Productivity",  businessUnit: "IT Operations",       month: "Apr", spend:  33_500, budget:  33_000 },
  { provider: "Azure", service: "M365 / Productivity",  businessUnit: "IT Operations",       month: "May", spend:  34_000, budget:  33_000 },

  // ── GCP ────────────────────────────────────────────────────────────────────
  { provider: "GCP", service: "BigQuery",               businessUnit: "Data & Analytics",    month: "Jan", spend:  55_000, budget:  52_000 },
  { provider: "GCP", service: "BigQuery",               businessUnit: "Data & Analytics",    month: "Feb", spend:  58_000, budget:  52_000 },
  { provider: "GCP", service: "BigQuery",               businessUnit: "Data & Analytics",    month: "Mar", spend:  62_000, budget:  55_000 },
  { provider: "GCP", service: "BigQuery",               businessUnit: "Data & Analytics",    month: "Apr", spend:  67_000, budget:  55_000 },
  { provider: "GCP", service: "BigQuery",               businessUnit: "Data & Analytics",    month: "May", spend:  73_000, budget:  58_000 },
  { provider: "GCP", service: "Vertex AI / ML",         businessUnit: "Cloud Engineering",   month: "Jan", spend:  28_000, budget:  28_000 },
  { provider: "GCP", service: "Vertex AI / ML",         businessUnit: "Cloud Engineering",   month: "Feb", spend:  31_000, budget:  28_000 },
  { provider: "GCP", service: "Vertex AI / ML",         businessUnit: "Cloud Engineering",   month: "Mar", spend:  35_000, budget:  30_000 },
  { provider: "GCP", service: "Vertex AI / ML",         businessUnit: "Cloud Engineering",   month: "Apr", spend:  39_000, budget:  32_000 },
  { provider: "GCP", service: "Vertex AI / ML",         businessUnit: "Cloud Engineering",   month: "May", spend:  44_000, budget:  34_000 },
  { provider: "GCP", service: "GKE / Kubernetes",       businessUnit: "Cloud Engineering",   month: "Jan", spend:  35_000, budget:  35_000 },
  { provider: "GCP", service: "GKE / Kubernetes",       businessUnit: "Cloud Engineering",   month: "Feb", spend:  34_000, budget:  35_000 },
  { provider: "GCP", service: "GKE / Kubernetes",       businessUnit: "Cloud Engineering",   month: "Mar", spend:  32_000, budget:  35_000 },
  { provider: "GCP", service: "GKE / Kubernetes",       businessUnit: "Cloud Engineering",   month: "Apr", spend:  30_000, budget:  32_000 },
  { provider: "GCP", service: "GKE / Kubernetes",       businessUnit: "Cloud Engineering",   month: "May", spend:  27_000, budget:  30_000 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTotalCloudSpendByMonth(): { month: Month; aws: number; azure: number; gcp: number; total: number }[] {
  const months: Month[] = ["Jan", "Feb", "Mar", "Apr", "May"];
  return months.map((month) => {
    const rows = cloudSpend.filter((r) => r.month === month);
    const aws   = rows.filter((r) => r.provider === "AWS").reduce((s, r) => s + r.spend, 0);
    const azure = rows.filter((r) => r.provider === "Azure").reduce((s, r) => s + r.spend, 0);
    const gcp   = rows.filter((r) => r.provider === "GCP").reduce((s, r) => s + r.spend, 0);
    return { month, aws, azure, gcp, total: aws + azure + gcp };
  });
}

export function getTotalCloudYTD(): number {
  return cloudSpend.reduce((s, r) => s + r.spend, 0);
}

export function getTotalCloudBudgetYTD(): number {
  return cloudSpend.reduce((s, r) => s + r.budget, 0);
}

export function getCloudByProvider(): { provider: string; ytdSpend: number; ytdBudget: number }[] {
  const providers = ["AWS", "Azure", "GCP"] as const;
  return providers.map((p) => {
    const rows = cloudSpend.filter((r) => r.provider === p);
    return {
      provider: p,
      ytdSpend:  rows.reduce((s, r) => s + r.spend, 0),
      ytdBudget: rows.reduce((s, r) => s + r.budget, 0),
    };
  });
}
