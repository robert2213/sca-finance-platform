import { NextRequest, NextResponse } from "next/server";
import { withTenant, jsonError } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";
import { enableOrganization } from "@/lib/services/onboarding.service";

export const dynamic = "force-dynamic";

/** POST /api/admin/organizations/[orgId]/enable — go-live gate (SystemAdmin). */
async function enable(_req: NextRequest, ctx: TenantContext, seg: { params?: Record<string, string | string[]> }) {
  const raw = seg.params?.orgId;
  const orgId = Array.isArray(raw) ? raw[0] : raw ?? "";
  try {
    const org = await enableOrganization(orgId, ctx.userId ?? "system");
    if (!org) return jsonError(`Organization "${orgId}" not found`, 404);
    return NextResponse.json({ ok: true, organization: org });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Enable failed", 400);
  }
}

export const POST = withTenant(enable, {
  permission: "platform:onboard_organization",
  requireActiveTenant: false,
  action: "admin.org.enable",
});
