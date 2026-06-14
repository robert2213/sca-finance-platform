import { NextRequest, NextResponse } from "next/server";
import { withTenant, readJson, requireFields } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";
import { listOrganizations } from "@/lib/services/organization.service";
import { onboardOrganization } from "@/lib/services/onboarding.service";
import type { OrganizationSettings } from "@/lib/models/organization";

export const dynamic = "force-dynamic";

/** GET /api/admin/organizations — platform view of all tenants (SystemAdmin). */
async function listOrgs(_req: NextRequest, _ctx: TenantContext) {
  const organizations = await listOrganizations();
  return NextResponse.json({ count: organizations.length, organizations });
}

/** POST /api/admin/organizations — onboard a new organization (SystemAdmin). */
async function createOrg(req: NextRequest, ctx: TenantContext) {
  const body = await readJson<{
    name?: string;
    orgId?: string;
    tenantId?: string;
    adminEmail?: string;
    settings?: OrganizationSettings;
  }>(req);
  requireFields(body as Record<string, unknown>, ["name"]);

  const result = await onboardOrganization({
    name: body.name!,
    orgId: body.orgId,
    tenantId: body.tenantId,
    adminEmail: body.adminEmail,
    settings: body.settings,
    actorUserId: ctx.userId ?? "system",
  });
  return NextResponse.json(result, { status: result.ok ? 201 : 500 });
}

export const GET = withTenant(listOrgs, {
  permission: "platform:manage_organizations",
  requireActiveTenant: false,
  action: "admin.org.list",
});
export const POST = withTenant(createOrg, {
  permission: "platform:onboard_organization",
  requireActiveTenant: false,
  action: "admin.org.create",
});
