// Canonical finance data model for the SCA Finance Platform.
// All entities include clientId (multi-tenant), period (ISO month), and source/validation fields.
// These types are the ingest-to-store contract — parsers produce them, validators consume them.

export type DataSource = "upload" | "seed" | "connector";
export type ValidationStatus = "pass" | "warn" | "error";
export type TransactionType = "actual" | "budget" | "forecast";
export type HeadcountStatus = "Filled" | "Open" | "On Leave" | "Terminated";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type AccountCategory = "OpEx" | "CapEx" | "Revenue" | "Headcount";

// ─── Dimensional entities ──────────────────────────────────────────────────────

export interface Account {
  clientId: string;
  code: string;
  name: string;
  category: AccountCategory;
  subcategory?: string;
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface CostCenter {
  clientId: string;
  id: string;
  name: string;
  department: string;
  businessUnitId: string;
  owner?: string;
  budgetOwner?: string;
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface Department {
  clientId: string;
  id: string;
  name: string;
  businessUnitId: string;
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface BusinessUnit {
  clientId: string;
  id: string;
  name: string;
  leadName?: string;
  budgetOwner?: string;
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface TimePeriod {
  clientId: string;
  periodId: string;            // ISO month: "2026-01"
  year: number;
  month: number;               // 1–12
  monthName: string;
  quarter: number;             // 1–4
  isClosed: boolean;
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

// ─── Fact entities ─────────────────────────────────────────────────────────────

export interface ActualEntry {
  clientId: string;
  period: string;              // ISO month "2026-01"
  transactionId: string;
  transactionType: "actual";
  costCenterId: string;
  costCenterName: string;
  businessUnit: string;
  accountCode: string;
  category: string;
  subcategory?: string;
  vendorId?: string;
  vendorName?: string;
  description?: string;
  amountActual: number;
  amountBudget: number;
  variance: number;            // amountActual - amountBudget
  variancePct: number;         // variance / amountBudget
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface BudgetEntry {
  clientId: string;
  period: string;
  costCenterId: string;
  costCenterName: string;
  businessUnit: string;
  accountCode: string;
  category: string;
  subcategory?: string;
  amountBudget: number;
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface ForecastEntry {
  clientId: string;
  period: string;
  costCenterId: string;
  costCenterName: string;
  businessUnit: string;
  accountCode: string;
  category: string;
  subcategory?: string;
  amountForecast: number;
  forecastCycle: string;       // "3+9", "6+6", "9+3"
  forecastedAt: string;        // ISO date
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface HeadcountRecord {
  clientId: string;
  period: string;
  positionId: string;
  title: string;
  businessUnit: string;
  department: string;
  costCenterId: string;
  level?: string;
  status: HeadcountStatus;
  annualSalary: number;
  managerId?: string;
  hireDate?: string;           // ISO date
  termDate?: string;           // ISO date
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface ExternalLaborRecord {
  clientId: string;
  period: string;
  contractorId: string;
  name: string;
  businessUnit: string;
  costCenterId: string;
  role: string;
  monthlyRate: number;
  contractValue: number;
  ytdSpend: number;
  startDate: string;           // ISO date
  endDate: string;             // ISO date
  status: "Active" | "Ending Soon" | "Over Budget" | "Completed";
  sowNumber?: string;
  vendorId?: string;
  autoRenew: boolean;
  riskLevel: RiskLevel;
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface VendorSpendRecord {
  clientId: string;
  period: string;
  vendorId: string;
  vendorName: string;
  category: string;
  businessUnit: string;
  costCenterId: string;
  annualValue: number;
  ytdSpend: number;
  contractStart: string;       // ISO date
  contractEnd: string;         // ISO date
  autoRenew: boolean;
  riskLevel: RiskLevel;
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}

export interface KPIRecord {
  clientId: string;
  period: string;
  metricKey: string;
  metricName: string;
  value: number;
  budget?: number;
  prior?: number;
  unit: "currency" | "percent" | "count" | "days";
  source: DataSource;
  validatedAt?: Date;
  validationStatus?: ValidationStatus;
}
