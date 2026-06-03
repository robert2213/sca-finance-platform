import type { HeadcountRecord, BusinessUnit } from "@/types/finance";

export const headcount: HeadcountRecord[] = [
  // Infrastructure
  { id: "HC-001", title: "Director, Infrastructure Engineering", businessUnit: "Infrastructure",        level: "Dir", status: "Filled",        location: "Austin, TX",    fillDate:  "2024-03-15", annualSalary: 195_000, isBackfill: false },
  { id: "HC-002", title: "Sr. Network Engineer",                 businessUnit: "Infrastructure",        level: "IC4", status: "Filled",        location: "Remote",        fillDate:  "2025-01-10", annualSalary: 148_000, isBackfill: false },
  { id: "HC-003", title: "Network Engineer II",                  businessUnit: "Infrastructure",        level: "IC3", status: "Open",          location: "Austin, TX",    openDate:  "2026-02-01",                           annualSalary: 115_000, isBackfill: true  },
  { id: "HC-004", title: "Data Center Technician",               businessUnit: "Infrastructure",        level: "IC3", status: "Pending Offer", location: "Austin, TX",    openDate:  "2026-01-15",                           annualSalary: 92_000,  isBackfill: false },

  // Security
  { id: "HC-005", title: "VP, Cybersecurity",                    businessUnit: "Security",              level: "VP",  status: "Filled",        location: "Austin, TX",    fillDate:  "2023-11-01", annualSalary: 265_000, isBackfill: false },
  { id: "HC-006", title: "Sr. Security Engineer",                businessUnit: "Security",              level: "IC5", status: "Filled",        location: "Remote",        fillDate:  "2025-04-22", annualSalary: 185_000, isBackfill: false },
  { id: "HC-007", title: "IAM Architect",                        businessUnit: "Security",              level: "IC5", status: "Open",          location: "Remote",        openDate:  "2026-03-01",                           annualSalary: 175_000, isBackfill: false },
  { id: "HC-008", title: "Security Analyst II",                  businessUnit: "Security",              level: "IC3", status: "Filled",        location: "Austin, TX",    fillDate:  "2025-08-15", annualSalary: 105_000, isBackfill: true  },

  // Applications
  { id: "HC-009", title: "Director, Enterprise Applications",    businessUnit: "Applications",          level: "Dir", status: "Filled",        location: "Austin, TX",    fillDate:  "2024-06-01", annualSalary: 205_000, isBackfill: false },
  { id: "HC-010", title: "SAP Solutions Architect",              businessUnit: "Applications",          level: "IC5", status: "Filled",        location: "Remote",        fillDate:  "2025-02-10", annualSalary: 180_000, isBackfill: false },
  { id: "HC-011", title: "Salesforce Developer",                 businessUnit: "Applications",          level: "IC3", status: "Open",          location: "Remote",        openDate:  "2026-04-01",                           annualSalary: 118_000, isBackfill: false },
  { id: "HC-012", title: "HRIS Analyst",                         businessUnit: "Applications",          level: "IC3", status: "Filled",        location: "Austin, TX",    fillDate:  "2025-09-05", annualSalary: 98_000,  isBackfill: true  },

  // Data & Analytics
  { id: "HC-013", title: "Head of Data Engineering",             businessUnit: "Data & Analytics",      level: "M2",  status: "Filled",        location: "Austin, TX",    fillDate:  "2024-01-15", annualSalary: 220_000, isBackfill: false },
  { id: "HC-014", title: "Sr. Data Engineer",                    businessUnit: "Data & Analytics",      level: "IC4", status: "Filled",        location: "Remote",        fillDate:  "2025-05-01", annualSalary: 165_000, isBackfill: false },
  { id: "HC-015", title: "Data Engineer II",                     businessUnit: "Data & Analytics",      level: "IC3", status: "Open",          location: "Remote",        openDate:  "2026-01-20",                           annualSalary: 128_000, isBackfill: false },
  { id: "HC-016", title: "Analytics Engineer",                   businessUnit: "Data & Analytics",      level: "IC3", status: "Open",          location: "Remote",        openDate:  "2026-03-15",                           annualSalary: 122_000, isBackfill: false },

  // Cloud Engineering
  { id: "HC-017", title: "VP, Cloud Engineering",                businessUnit: "Cloud Engineering",     level: "VP",  status: "Filled",        location: "Austin, TX",    fillDate:  "2023-07-01", annualSalary: 280_000, isBackfill: false },
  { id: "HC-018", title: "Principal Cloud Architect",            businessUnit: "Cloud Engineering",     level: "IC5", status: "Filled",        location: "Remote",        fillDate:  "2024-09-01", annualSalary: 210_000, isBackfill: false },
  { id: "HC-019", title: "Sr. Cloud Engineer (AWS)",             businessUnit: "Cloud Engineering",     level: "IC4", status: "Filled",        location: "Remote",        fillDate:  "2025-03-15", annualSalary: 168_000, isBackfill: false },
  { id: "HC-020", title: "Cloud Engineer II (Azure)",            businessUnit: "Cloud Engineering",     level: "IC3", status: "Pending Offer", location: "Remote",        openDate:  "2026-02-15",                           annualSalary: 130_000, isBackfill: true  },
  { id: "HC-021", title: "FinOps Analyst",                       businessUnit: "Cloud Engineering",     level: "IC3", status: "Open",          location: "Austin, TX",    openDate:  "2026-04-15",                           annualSalary: 112_000, isBackfill: false },

  // IT Operations
  { id: "HC-022", title: "Manager, IT Operations",               businessUnit: "IT Operations",         level: "M1",  status: "Filled",        location: "Austin, TX",    fillDate:  "2024-11-01", annualSalary: 155_000, isBackfill: false },
  { id: "HC-023", title: "Help Desk Lead",                       businessUnit: "IT Operations",         level: "IC3", status: "Filled",        location: "Austin, TX",    fillDate:  "2025-01-20", annualSalary: 88_000,  isBackfill: true  },
  { id: "HC-024", title: "IT Support Analyst",                   businessUnit: "IT Operations",         level: "IC3", status: "Open",          location: "Austin, TX",    openDate:  "2026-05-01",                           annualSalary: 78_000,  isBackfill: false },

  // Enterprise Architecture
  { id: "HC-025", title: "Chief Architect",                      businessUnit: "Enterprise Architecture", level: "Dir", status: "Filled",      location: "Austin, TX",    fillDate:  "2023-09-01", annualSalary: 240_000, isBackfill: false },
  { id: "HC-026", title: "Sr. Enterprise Architect",             businessUnit: "Enterprise Architecture", level: "IC5", status: "On Leave",    location: "Remote",                                                           annualSalary: 190_000, isBackfill: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getHeadcountSummary() {
  return {
    total:       headcount.length,
    filled:      headcount.filter((h) => h.status === "Filled").length,
    open:        headcount.filter((h) => h.status === "Open").length,
    pendingOffer: headcount.filter((h) => h.status === "Pending Offer").length,
    onLeave:     headcount.filter((h) => h.status === "On Leave").length,
  };
}

export function getOpenReqs(): HeadcountRecord[] {
  return headcount.filter((h) => h.status === "Open" || h.status === "Pending Offer");
}

export function getTotalAnnualSalaryBudget(): number {
  return headcount.reduce((s, h) => s + h.annualSalary, 0);
}

export function getHCByBusinessUnit() {
  const map = new Map<BusinessUnit, { total: number; filled: number; open: number; salaryBudget: number }>();
  for (const h of headcount) {
    const e = map.get(h.businessUnit) ?? { total: 0, filled: 0, open: 0, salaryBudget: 0 };
    map.set(h.businessUnit, {
      total:        e.total + 1,
      filled:       e.filled + (h.status === "Filled" ? 1 : 0),
      open:         e.open   + (h.status === "Open" || h.status === "Pending Offer" ? 1 : 0),
      salaryBudget: e.salaryBudget + h.annualSalary,
    });
  }
  return Array.from(map.entries()).map(([bu, v]) => ({ bu, ...v }));
}
