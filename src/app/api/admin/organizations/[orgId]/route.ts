import { NextRequest, NextResponse } from "next/server";
import { withTenant, readJson, jsonError, assertOrgScope } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";
import { getOrganization, updateOrganizationSettings } from "@/lib/services/organization.service";
import { logAudit } from "@/lib/audit/audit.service";
import type { OrganizationSettings } from "@/lib/models/organization";

export const dynamic = "force-dynamic";

function orgIdOf(seg: { params?: Record<string, string | string[]> }): string {
  const raw = seg.params?.orgId;
  return Array.isArray(raw) ? raw[0] : raw ?? "";
}

/** GET /api/admin/organizations/[orgId] — org detail (own org or SystemAdmin). */
async function getOrg(_req: NextRequest, ctx: TenantContext, seg: { params?: Record<string, string | string[]> }) {
  const orgId = orgIdOf(seg);
  assertOrgScope(ctx, orgId);
  const org = await getOrganization(orgId);
  if (!org) return jsonError(`Organization "${orgId}" not found`, 404);
  return NextResponse.json(org);
}

/** PATCH /api/admin/organizations/[orgId] — update org settings. */
async function patchOrg(req: NextRequest, ctx: TenantContext, seg: { params?: Record<string, string | string[]> }) {
  const orgId = orgIdOf(seg);
  assertOrgScope(ctx, orgId);
  const body = await readJson<{ settings?: OrganizationSettings }>(req);
  const updated = await updateOrganizationSettings(orgId, body.settings ?? {});
  if (!updated) return jsonError(`Organization "${orgId}" not found`, 404);
  await logAudit({ orgId, actorUserId: ctx.userId ?? "system", action: "org.settings_update", target: orgId, outcome: "success" });
  return NextResponse.json(updated);
}

export const GET = withTenant(getOrg, { permission: "org:view_activity", action: "admin.org.get" });
export const PATCH = withTenant(patchOrg, { permission: "org:manage_settings", action: "admin.org.settings" });
