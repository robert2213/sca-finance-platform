/**
 * Organization & user domain models for the multi-tenant control plane.
 *
 * The organization is the security boundary. In Clerk-enabled mode the Clerk
 * Organization is the system of record for identity & membership; this table
 * mirrors it and stores tenant settings/status. The tenant identifier
 * (`tenantId`) is the value written to every `client_id` column on finance
 * data, so it IS the data-isolation key.
 *
 * Convention: tenantId === Clerk organization id (e.g. "org_2ab…"). In demo
 * mode the single organization uses tenantId "demo-client".
 */

export type OrganizationStatus =
  | "onboarding" // created, not yet enabled for users
  | "active"     // live
  | "suspended"  // access frozen (billing/security) — data retained
  | "offboarded"; // terminated — scheduled for export/delete

export interface OrganizationSettings {
  /** Module keys enabled for this tenant (mirrors ClientConfig.activeModules). */
  activeModules?: string[];
  /** Agent ids enabled for this tenant (mirrors ClientConfig.agents). */
  enabledAgents?: string[];
  /** Optional branding overrides. */
  primaryColor?: string;
  logoPath?: string;
  /** Fiscal config overrides. */
  fiscalYearStart?: string;
  reportingCurrency?: string;
  /** Free-form notes for the account team. */
  notes?: string;
}

export interface Organization {
  /** Stable org id. In Clerk mode this is the Clerk organization id. */
  id: string;
  name: string;
  /** Data-isolation key written to every client_id column. Equals `id`. */
  tenantId: string;
  status: OrganizationStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  settings: OrganizationSettings;
}

export type UserStatus = "invited" | "active" | "disabled";

/**
 * Mirror of a user's membership in an organization, with the authoritative
 * application role. Clerk owns the credential/session; this row owns the
 * app-level role assignment and lifecycle status for audit and fast lookups.
 */
export interface OrgUser {
  userId: string;   // Clerk user id (or generated in demo mode)
  orgId: string;    // FK → Organization.id
  email: string;
  role: string;     // one of rbac.ts Role values
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

/** Append-only security/audit event. */
export interface AuditEvent {
  ts: string;            // ISO timestamp
  orgId: string | null;  // tenant scope (null for platform-level events)
  actorUserId: string;   // who performed the action ("system"/"anonymous" allowed)
  action: string;        // e.g. "user.invite", "data.upload", "access.deny"
  target: string | null; // affected entity id (user id, table, etc.)
  outcome: "success" | "failure" | "allow" | "deny";
  detail?: string | null; // JSON string with extra context
}

const VALID_STATUSES: OrganizationStatus[] = ["onboarding", "active", "suspended", "offboarded"];

export function isOrganizationStatus(v: unknown): v is OrganizationStatus {
  return typeof v === "string" && VALID_STATUSES.includes(v as OrganizationStatus);
}

export function parseSettings(raw: string | null | undefined): OrganizationSettings {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? (parsed as OrganizationSettings) : {};
  } catch {
    return {};
  }
}
