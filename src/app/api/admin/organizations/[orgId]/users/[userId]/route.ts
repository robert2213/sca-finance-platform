import { NextRequest, NextResponse } from "next/server";
import { withTenant, readJson, jsonError, assertOrgScope } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";
import { assignUserRole, changeUserStatus } from "@/lib/services/onboarding.service";
import { isRole, type Role } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

function idsOf(seg: { params?: Record<string, string | string[]> }) {
  const o = seg.params?.orgId;
  const u = seg.params?.userId;
  return {
    orgId: Array.isArray(o) ? o[0] : o ?? "",
    userId: Array.isArray(u) ? u[0] : u ?? "",
  };
}

/** PATCH /api/admin/organizations/[orgId]/users/[userId] — assign role. */
async function patchUser(req: NextRequest, ctx: TenantContext, seg: { params?: Record<string, string | string[]> }) {
  const { orgId, userId } = idsOf(seg);
  assertOrgScope(ctx, orgId);
  const body = await readJson<{ role?: string }>(req);
  if (!isRole(body.role)) return jsonError(`Invalid role. Allowed: SystemAdmin, OrganizationAdmin, CFO, FPA, Controller, Leader, ReadOnly`, 400);
  const updated = await assignUserRole(orgId, userId, body.role as Role, ctx.userId ?? "system");
  if (!updated) return jsonError(`User "${userId}" not found in org "${orgId}"`, 404);
  return NextResponse.json(updated);
}

/** DELETE /api/admin/organizations/[orgId]/users/[userId] — disable (soft remove). */
async function removeUser(_req: NextRequest, ctx: TenantContext, seg: { params?: Record<string, string | string[]> }) {
  const { orgId, userId } = idsOf(seg);
  assertOrgScope(ctx, orgId);
  const updated = await changeUserStatus(orgId, userId, "disabled", ctx.userId ?? "system");
  if (!updated) return jsonError(`User "${userId}" not found in org "${orgId}"`, 404);
  return NextResponse.json({ ok: true, user: updated });
}

export const PATCH = withTenant(patchUser, { permission: "org:assign_roles", action: "admin.users.role" });
export const DELETE = withTenant(removeUser, { permission: "org:remove_users", action: "admin.users.remove" });
