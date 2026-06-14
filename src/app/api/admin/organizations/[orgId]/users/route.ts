import { NextRequest, NextResponse } from "next/server";
import { withTenant, readJson, requireFields, assertOrgScope } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";
import { listUsers, upsertUser } from "@/lib/services/user.service";
import { logAudit } from "@/lib/audit/audit.service";
import { isRole, type Role } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

function orgIdOf(seg: { params?: Record<string, string | string[]> }): string {
  const raw = seg.params?.orgId;
  return Array.isArray(raw) ? raw[0] : raw ?? "";
}

/** GET /api/admin/organizations/[orgId]/users — roster for the org. */
async function listOrgUsers(_req: NextRequest, ctx: TenantContext, seg: { params?: Record<string, string | string[]> }) {
  const orgId = orgIdOf(seg);
  assertOrgScope(ctx, orgId);
  const users = await listUsers(orgId);
  return NextResponse.json({ count: users.length, users });
}

/** POST /api/admin/organizations/[orgId]/users — invite a user with a role. */
async function inviteUser(req: NextRequest, ctx: TenantContext, seg: { params?: Record<string, string | string[]> }) {
  const orgId = orgIdOf(seg);
  assertOrgScope(ctx, orgId);
  const body = await readJson<{ email?: string; role?: string }>(req);
  requireFields(body as Record<string, unknown>, ["email"]);
  const role: Role = isRole(body.role) ? body.role : "ReadOnly";

  const user = await upsertUser({
    userId: `invite:${body.email!.trim()}`,
    orgId,
    email: body.email!.trim(),
    role,
    status: "invited",
  });
  await logAudit({ orgId, actorUserId: ctx.userId ?? "system", action: "user.invite", target: body.email!.trim(), outcome: "success", detail: role });

  // Best-effort Clerk email invitation when configured.
  const { isClerkEnabled } = await import("@/lib/tenant/tenant-context");
  if (isClerkEnabled()) {
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      await client.organizations.createOrganizationInvitation({
        organizationId: orgId,
        emailAddress: body.email!.trim(),
        role: role === "OrganizationAdmin" ? "org:admin" : "org:member",
      });
    } catch {
      /* non-fatal: local invite record stands; Clerk email can be retried */
    }
  }

  return NextResponse.json(user, { status: 201 });
}

export const GET = withTenant(listOrgUsers, { permission: "org:view_activity", action: "admin.users.list" });
export const POST = withTenant(inviteUser, { permission: "org:invite_users", action: "admin.users.invite" });
