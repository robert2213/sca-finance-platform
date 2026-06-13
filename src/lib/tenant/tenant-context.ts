/**
 * Tenant context — the single source of truth for "who is asking and which
 * tenant are they in" on the server.
 *
 * Design goals:
 *  - Backward compatible: when Clerk is not configured, the platform behaves
 *    exactly as the original single-tenant demo (DEFAULT_CLIENT_ID, full
 *    access). Nothing breaks for the existing demo deployment.
 *  - Session-derived tenancy: when Clerk IS configured, the active tenant is
 *    derived from the user's Clerk Organization — never from a constant.
 *  - No silent cross-tenant fallback: an authenticated user with no active
 *    organization gets an EMPTY clientId, so tenant-scoped queries return
 *    nothing instead of leaking another tenant's (or the demo's) data.
 *
 * This module is server-only. Calling Clerk's auth() requires clerkMiddleware
 * to have run, so we only call it when Clerk is enabled.
 */

import { cache } from "react";
import { DEFAULT_CLIENT_ID } from "@/config/client.resolver";
import { roleFromClerk, type Role } from "@/lib/auth/rbac";

export interface TenantContext {
  /** Data-isolation key written to / filtered on every client_id column. */
  clientId: string;
  /** Clerk organization id (null in demo mode or when no org is active). */
  orgId: string | null;
  /** Authenticated user id (null in demo mode). */
  userId: string | null;
  /** Resolved application role. */
  role: Role;
  /** True when Clerk is not configured — original demo behavior. */
  isDemo: boolean;
  /** True when there is an authenticated principal (or demo). */
  isAuthenticated: boolean;
  /** True when a usable tenant scope is present (clientId non-empty). */
  hasTenant: boolean;
}

/** Clerk is considered enabled only when both keys are present. */
export function isClerkEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

/** The context used when Clerk is not configured (original demo). */
function demoContext(): TenantContext {
  return {
    clientId: DEFAULT_CLIENT_ID,
    orgId: null,
    userId: null,
    role: "OrganizationAdmin", // demo operates with full tenant control
    isDemo: true,
    isAuthenticated: true,
    hasTenant: true,
  };
}

/** Anonymous / unauthenticated context (Clerk on, no valid session). */
function anonymousContext(): TenantContext {
  return {
    clientId: "",
    orgId: null,
    userId: null,
    role: "ReadOnly",
    isDemo: false,
    isAuthenticated: false,
    hasTenant: false,
  };
}

/**
 * Resolve the tenant context for the current request. Memoized per-request via
 * React cache() so repeated calls in one render/route don't re-hit Clerk or the
 * role lookup.
 */
export const getTenantContext = cache(async (): Promise<TenantContext> => {
  if (!isClerkEnabled()) return demoContext();

  try {
    // Imported lazily so the module graph stays clean when Clerk is disabled.
    const { auth } = await import("@clerk/nextjs/server");
    const session = await auth();
    const { userId, orgId, orgRole, sessionClaims } = session;

    if (!userId) return anonymousContext();

    // Platform role (cross-tenant) lives on the user's public metadata, surfaced
    // via session claims when a JWT template exposes it.
    const platformRole =
      (sessionClaims as { metadata?: { platformRole?: string } } | null)?.metadata
        ?.platformRole ?? null;

    // Authenticated but no active organization → no tenant scope. Do NOT fall
    // back to the demo tenant; that would leak data.
    if (!orgId) {
      const role = platformRole === "SystemAdmin" ? ("SystemAdmin" as Role) : ("ReadOnly" as Role);
      return {
        clientId: "",
        orgId: null,
        userId,
        role,
        isDemo: false,
        isAuthenticated: true,
        hasTenant: false,
      };
    }

    // Prefer the persisted app-level role from the mirror table; fall back to a
    // coarse mapping of the Clerk org role. Never let a lookup failure crash the
    // request — degrade to the coarse role.
    let assignedAppRole: string | null = null;
    try {
      const { getUser } = await import("@/lib/services/user.service");
      const member = await getUser(orgId, userId);
      // Fail closed for disabled members — no tenant scope, no access. A disabled
      // user must not retain even ReadOnly access via the coarse Clerk fallback.
      if (member && member.status === "disabled") {
        return {
          clientId: "",
          orgId,
          userId,
          role: "ReadOnly",
          isDemo: false,
          isAuthenticated: true,
          hasTenant: false,
        };
      }
      assignedAppRole = member ? member.role : null;
    } catch {
      assignedAppRole = null;
    }

    const role = roleFromClerk({ platformRole, clerkOrgRole: orgRole, assignedAppRole });

    return {
      clientId: orgId, // tenantId === Clerk org id
      orgId,
      userId,
      role,
      isDemo: false,
      isAuthenticated: true,
      hasTenant: true,
    };
  } catch {
    // Clerk threw (misconfiguration / middleware not run). Fail closed: no tenant.
    return anonymousContext();
  }
});

/**
 * Convenience for server components that just need the active tenant id to pass
 * into the query layer. Returns the demo client in demo mode, the org-scoped
 * client id when authenticated with an org, or "" (which yields no rows) when
 * authenticated without a tenant.
 */
export async function getTenantClientId(): Promise<string> {
  const ctx = await getTenantContext();
  return ctx.clientId;
}

export class TenantError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401
  ) {
    super(message);
    this.name = "TenantError";
  }
}

/**
 * For API routes / mutations: require an authenticated principal with a usable
 * tenant scope. Throws TenantError (handled by withTenant) otherwise.
 */
export async function requireTenant(): Promise<TenantContext> {
  const ctx = await getTenantContext();
  if (!ctx.isAuthenticated) {
    throw new TenantError("Authentication required", 401);
  }
  if (!ctx.hasTenant) {
    throw new TenantError("No active organization for this session", 403);
  }
  return ctx;
}
