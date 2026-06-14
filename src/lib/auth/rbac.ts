/**
 * RBAC — Role-Based Access Control for the multi-tenant platform.
 *
 * This is the authoritative permission model. It is intentionally pure and
 * dependency-free so it can run on the server (route guards) and the client
 * (UI gating) identically.
 *
 * Roles map onto Clerk organization roles at the edge (see roleFromClerk);
 * the SystemAdmin role is an instance-level (cross-tenant) role stored on the
 * Clerk user's publicMetadata, NOT an organization role.
 *
 * Backward compatibility: the legacy 4-role model in `roles.ts` is preserved
 * and untouched. New code should use this module.
 */

// ─── Roles ──────────────────────────────────────────────────────────────────

export const ROLES = [
  "SystemAdmin",        // Sin City Analytics staff — cross-tenant platform operator
  "OrganizationAdmin",  // Tenant administrator — full control within one organization
  "CFO",                // Executive finance — read + agents + executive reporting
  "FPA",                // FP&A leader — variance/forecast, can upload data
  "Controller",         // Controller — close, data integrity, can upload data
  "Leader",             // Business leader — scoped dashboards + agents
  "ReadOnly",           // Read-only viewer
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export const PERMISSIONS = [
  // Platform / cross-tenant (SystemAdmin only)
  "platform:manage_organizations", // create/suspend/offboard any org
  "platform:view_all_tenants",     // cross-tenant visibility
  "platform:onboard_organization", // run the onboarding workflow

  // Organization administration (tenant-scoped)
  "org:manage_settings",
  "org:invite_users",
  "org:disable_users",
  "org:remove_users",
  "org:assign_roles",
  "org:view_activity",             // tenant audit log

  // Data plane (tenant-scoped)
  "data:upload",
  "data:clear",
  "data:view_validation",
  "config:manage",

  // Analytics / consumption (tenant-scoped)
  "agents:run",
  "reports:view_executive",
  "costcenters:view_all",
  "dashboards:view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// ─── Permission matrix ─────────────────────────────────────────────────────────
// Each role maps to the exact set of permissions it is granted. SystemAdmin is
// granted every permission. Everything is deny-by-default: a permission absent
// from a role's set is denied.

const ORG_ADMIN_PERMISSIONS: Permission[] = [
  "org:manage_settings",
  "org:invite_users",
  "org:disable_users",
  "org:remove_users",
  "org:assign_roles",
  "org:view_activity",
  "data:upload",
  "data:clear",
  "data:view_validation",
  "config:manage",
  "agents:run",
  "reports:view_executive",
  "costcenters:view_all",
  "dashboards:view",
];

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  SystemAdmin: new Set<Permission>(PERMISSIONS),
  OrganizationAdmin: new Set<Permission>(ORG_ADMIN_PERMISSIONS),
  CFO: new Set<Permission>([
    "dashboards:view",
    "costcenters:view_all",
    "reports:view_executive",
    "agents:run",
    "data:view_validation",
    "org:view_activity",
  ]),
  FPA: new Set<Permission>([
    "dashboards:view",
    "costcenters:view_all",
    "reports:view_executive",
    "agents:run",
    "data:upload",
    "data:view_validation",
  ]),
  Controller: new Set<Permission>([
    "dashboards:view",
    "costcenters:view_all",
    "reports:view_executive",
    "agents:run",
    "data:upload",
    "data:view_validation",
    "config:manage",
  ]),
  Leader: new Set<Permission>([
    "dashboards:view",
    "agents:run",
    "reports:view_executive",
  ]),
  ReadOnly: new Set<Permission>([
    "dashboards:view",
  ]),
};

/** Authoritative server-side check. Deny-by-default. */
export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/** True when the role is a cross-tenant platform operator. */
export function isPlatformRole(role: Role | null | undefined): boolean {
  return role === "SystemAdmin";
}

/** True when the role can administer its own organization. */
export function isOrgAdminRole(role: Role | null | undefined): boolean {
  return role === "SystemAdmin" || role === "OrganizationAdmin";
}

// ─── Visibility maps (for UI gating; enforcement still happens server-side) ─────

import type { ModuleKey } from "@/config/client.config";

/**
 * Which dashboard modules each role may see in navigation. Server-side data
 * access is still gated by `dashboards:view` + tenant scope; this only drives
 * what the UI offers. Business Leaders intentionally do not see the data
 * administration surface.
 */
const ALL_MODULES: ModuleKey[] = [
  "actuals", "budget", "forecast", "headcount", "vendors",
  "external_labor", "cloud_spend", "executive_reporting", "agents",
];

export function visibleModules(role: Role | null | undefined): ModuleKey[] {
  if (!role) return [];
  switch (role) {
    case "SystemAdmin":
    case "OrganizationAdmin":
    case "CFO":
    case "FPA":
    case "Controller":
      return ALL_MODULES;
    case "Leader":
      return ["actuals", "forecast", "headcount", "vendors", "cloud_spend", "executive_reporting", "agents"];
    case "ReadOnly":
      return ["actuals", "forecast", "vendors", "cloud_spend"];
    default:
      return [];
  }
}

/**
 * Which agent "skills" each role may invoke. ReadOnly cannot run agents at all
 * (also enforced via the `agents:run` permission). Leaders get the business
 * partner + executive narrative agents; finance roles get the full set.
 */
export function visibleAgents(role: Role | null | undefined): string[] {
  if (!role || !hasPermission(role, "agents:run")) return [];
  if (role === "Leader") return ["finance-bp", "cfo"];
  // SystemAdmin, OrganizationAdmin, CFO, FPA, Controller — full skill set
  return ["cfo", "fpa", "procurement", "external-labor", "headcount", "cio", "finance-bp", "validation"];
}

// ─── Clerk role mapping ─────────────────────────────────────────────────────────

/**
 * Map a Clerk organization membership role + optional platform flag to an
 * application Role. The persisted app role (from the app_user mirror table)
 * takes precedence and is resolved upstream in tenant-context; this is the
 * fallback when no explicit app role has been assigned yet.
 *
 *  - platformRole === "SystemAdmin" on the user → SystemAdmin (cross-tenant)
 *  - Clerk org role "org:admin" / "admin" → OrganizationAdmin
 *  - anything else (member) → ReadOnly (least privilege until a role is assigned)
 */
export function roleFromClerk(args: {
  platformRole?: string | null;
  clerkOrgRole?: string | null;
  assignedAppRole?: string | null;
}): Role {
  if (args.platformRole === "SystemAdmin") return "SystemAdmin";
  if (isRole(args.assignedAppRole)) return args.assignedAppRole;
  const orgRole = (args.clerkOrgRole ?? "").toLowerCase();
  if (orgRole === "org:admin" || orgRole === "admin") return "OrganizationAdmin";
  return "ReadOnly";
}

/** Human-readable label for a role (UI). */
export const ROLE_LABELS: Record<Role, string> = {
  SystemAdmin: "System Administrator",
  OrganizationAdmin: "Organization Administrator",
  CFO: "CFO",
  FPA: "FP&A Leader",
  Controller: "Controller",
  Leader: "Business Leader",
  ReadOnly: "Read-Only User",
};
