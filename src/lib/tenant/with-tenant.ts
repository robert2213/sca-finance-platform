/**
 * withTenant — the standard guard for API route handlers.
 *
 * Wrapping a handler with withTenant guarantees, before the handler runs:
 *   1. Session validation  — an authenticated principal exists (or demo mode).
 *   2. Tenant validation    — a usable tenant scope exists (unless opted out).
 *   3. Permission validation— the caller's role holds the required permission.
 *
 * On failure it returns a clean JSON error (401/403) and writes a security
 * audit event — handlers never run unauthorized. The resolved TenantContext is
 * passed to the handler so it can scope every query by ctx.clientId.
 *
 * Backward compatibility: in demo mode (Clerk disabled) requireTenant resolves
 * the demo tenant with OrganizationAdmin, so existing endpoints keep working.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getTenantContext,
  requireTenant,
  TenantError,
  type TenantContext,
} from "./tenant-context";
import { hasPermission, type Permission } from "@/lib/auth/rbac";
import { logAudit } from "@/lib/audit/audit.service";

type RouteSegment = { params?: Record<string, string | string[]> };

type TenantHandler = (
  req: NextRequest,
  ctx: TenantContext,
  segment: RouteSegment
) => Promise<Response> | Response;

interface WithTenantOptions {
  /** Permission the caller must hold. Omit for authenticated-only endpoints. */
  permission?: Permission;
  /**
   * When false, allows authenticated principals without an active tenant
   * (e.g. SystemAdmin platform endpoints that operate across tenants).
   * Default true.
   */
  requireActiveTenant?: boolean;
  /** Action name used in audit logs. Defaults to the request method + path. */
  action?: string;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function withTenant(handler: TenantHandler, opts: WithTenantOptions = {}) {
  const { permission, requireActiveTenant = true, action } = opts;

  return async (req: NextRequest, segment: RouteSegment = {}): Promise<Response> => {
    const auditAction = action ?? `${req.method} ${new URL(req.url).pathname}`;

    let ctx: TenantContext;
    try {
      ctx = requireActiveTenant ? await requireTenant() : await getTenantContext();
    } catch (err) {
      const status = err instanceof TenantError ? err.status : 401;
      await safeAudit({
        orgId: null,
        actorUserId: "anonymous",
        action: auditAction,
        outcome: "deny",
        detail: err instanceof Error ? err.message : "unauthorized",
      });
      return jsonError(err instanceof Error ? err.message : "Unauthorized", status);
    }

    // Authenticated-only (no active tenant required) still needs a principal.
    if (!requireActiveTenant && !ctx.isAuthenticated) {
      await safeAudit({
        orgId: null,
        actorUserId: "anonymous",
        action: auditAction,
        outcome: "deny",
        detail: "authentication required",
      });
      return jsonError("Authentication required", 401);
    }

    if (permission && !hasPermission(ctx.role, permission)) {
      await safeAudit({
        orgId: ctx.orgId,
        actorUserId: ctx.userId ?? "anonymous",
        action: auditAction,
        target: permission,
        outcome: "deny",
        detail: `role ${ctx.role} lacks ${permission}`,
      });
      return jsonError("Forbidden — insufficient permissions", 403);
    }

    try {
      return await handler(req, ctx, segment);
    } catch (err) {
      if (err instanceof TenantError) {
        return jsonError(err.message, err.status);
      }
      console.error(`[withTenant] handler error on ${auditAction}:`, err);
      return jsonError("Internal server error", 500);
    }
  };
}

/** Assert a permission inside a handler (for fine-grained sub-checks). */
export function assertPermission(ctx: TenantContext, permission: Permission): void {
  if (!hasPermission(ctx.role, permission)) {
    throw new TenantError("Forbidden — insufficient permissions", 403);
  }
}

/**
 * Assert the caller may administer the target organization. SystemAdmin (and the
 * demo operator) may act cross-org; everyone else may only act on their OWN
 * active organization. Prevents an Organization Admin of tenant A from managing
 * tenant B by passing a different orgId in the URL.
 */
export function assertOrgScope(ctx: TenantContext, orgId: string): void {
  if (ctx.role === "SystemAdmin" || ctx.isDemo) return;
  if (!orgId || ctx.orgId !== orgId) {
    throw new TenantError("Forbidden — cannot administer another organization", 403);
  }
}

/** Parse + validate a JSON body, throwing TenantError(400) on malformed input. */
export async function readJson<T = Record<string, unknown>>(req: NextRequest): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new TenantError("Invalid JSON body", 400);
  }
}

/** Require that the named fields are present, non-empty strings. */
export function requireFields(
  body: Record<string, unknown>,
  fields: string[]
): void {
  const missing = fields.filter((f) => {
    const v = body[f];
    return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
  });
  if (missing.length) {
    throw new TenantError(`Missing required field(s): ${missing.join(", ")}`, 400);
  }
}

async function safeAudit(event: Parameters<typeof logAudit>[0]) {
  try {
    await logAudit(event);
  } catch {
    /* audit failures must never break a request */
  }
}
