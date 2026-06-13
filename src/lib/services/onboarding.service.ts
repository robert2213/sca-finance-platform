/**
 * Onboarding service — orchestrates the design-partner onboarding workflow:
 *
 *   Create Organization → Create Tenant → Invite Users → Assign Roles →
 *   Configure Settings → (Enable Platform — separate go-live gate)
 *
 * It composes the organization + user + audit services. Clerk organization /
 * invitation creation is attempted best-effort when Clerk is configured, but the
 * local control-plane (organization + app_user tables) is always the source of
 * truth, so onboarding works (and is testable) in demo mode too.
 *
 * Every mutation emits a security audit event.
 */

import {
  upsertOrganization,
  getOrganization,
  setOrganizationStatus,
} from "./organization.service";
import { upsertUser, setUserRole, setUserStatus } from "./user.service";
import { logAudit } from "@/lib/audit/audit.service";
import { isClerkEnabled } from "@/lib/tenant/tenant-context";
import type { Role } from "@/lib/auth/rbac";
import type { Organization, OrganizationSettings, OrgUser } from "@/lib/models/organization";

export interface OnboardStep {
  step: string;
  status: "done" | "skipped" | "error";
  detail?: string;
}

export interface OnboardingResult {
  ok: boolean;
  organization: Organization | null;
  invitedUser: OrgUser | null;
  steps: OnboardStep[];
}

function slugId(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "org";
  const rand = Math.random().toString(36).slice(2, 8);
  return `org_${base}_${rand}`;
}

/**
 * Onboard a new organization. Creates the org (status: onboarding), optionally
 * binds a Clerk organization, invites a first OrganizationAdmin, and applies
 * initial settings. The org is left in "onboarding" status — call
 * enableOrganization() as the explicit go-live gate.
 */
export async function onboardOrganization(input: {
  name: string;
  orgId?: string;
  tenantId?: string;
  adminEmail?: string;
  settings?: OrganizationSettings;
  actorUserId: string;
}): Promise<OnboardingResult> {
  const steps: OnboardStep[] = [];
  const orgId = input.orgId?.trim() || slugId(input.name);
  let organization: Organization | null = null;
  let invitedUser: OrgUser | null = null;

  // 1. Create Organization + Tenant (tenantId === orgId)
  try {
    organization = await upsertOrganization({
      id: orgId,
      name: input.name,
      tenantId: input.tenantId ?? orgId,
      status: "onboarding",
      settings: input.settings,
    });
    steps.push({ step: "create_organization", status: "done", detail: `org ${orgId} (tenant ${organization.tenantId})` });
    await logAudit({ orgId, actorUserId: input.actorUserId, action: "org.create", target: orgId, outcome: "success", detail: input.name });
  } catch (err) {
    steps.push({ step: "create_organization", status: "error", detail: (err as Error).message });
    return { ok: false, organization: null, invitedUser: null, steps };
  }

  // 2. Bind a Clerk organization (best-effort, only when Clerk is configured)
  if (isClerkEnabled()) {
    try {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const created = await client.organizations.createOrganization({
        name: input.name,
        createdBy: input.actorUserId,
        publicMetadata: { tenantId: orgId },
      });
      steps.push({ step: "bind_clerk_org", status: "done", detail: `clerk org ${created.id}` });
      await logAudit({ orgId, actorUserId: input.actorUserId, action: "org.clerk_bind", target: created.id, outcome: "success" });
    } catch (err) {
      steps.push({ step: "bind_clerk_org", status: "error", detail: `Clerk org create failed: ${(err as Error).message}` });
    }
  } else {
    steps.push({ step: "bind_clerk_org", status: "skipped", detail: "Clerk not configured (demo mode)" });
  }

  // 3. Invite first OrganizationAdmin (+ assign role)
  if (input.adminEmail?.trim()) {
    const email = input.adminEmail.trim();
    try {
      // Local mirror is the role authority; userId is a deterministic invite handle
      // until the user accepts a Clerk invitation and a real Clerk user id is known.
      const userId = `invite:${email}`;
      invitedUser = await upsertUser({ userId, orgId, email, role: "OrganizationAdmin", status: "invited" });
      steps.push({ step: "invite_admin", status: "done", detail: email });
      await logAudit({ orgId, actorUserId: input.actorUserId, action: "user.invite", target: email, outcome: "success", detail: "OrganizationAdmin" });

      if (isClerkEnabled()) {
        try {
          const { clerkClient } = await import("@clerk/nextjs/server");
          const client = await clerkClient();
          await client.organizations.createOrganizationInvitation({
            organizationId: orgId,
            emailAddress: email,
            role: "org:admin",
          });
          steps.push({ step: "clerk_invitation", status: "done", detail: email });
        } catch (err) {
          steps.push({ step: "clerk_invitation", status: "error", detail: (err as Error).message });
        }
      }
    } catch (err) {
      steps.push({ step: "invite_admin", status: "error", detail: (err as Error).message });
    }
  } else {
    steps.push({ step: "invite_admin", status: "skipped", detail: "no adminEmail provided" });
  }

  // 4. Configure settings already applied via upsertOrganization above.
  steps.push({ step: "configure_settings", status: input.settings ? "done" : "skipped" });

  const ok = !steps.some((s) => s.status === "error" && s.step === "create_organization");
  return { ok, organization, invitedUser, steps };
}

/** Go-live gate: transition an organization from onboarding/suspended to active. */
export async function enableOrganization(orgId: string, actorUserId: string): Promise<Organization | null> {
  const org = await getOrganization(orgId);
  if (!org) return null;
  const updated = await setOrganizationStatus(orgId, "active");
  await logAudit({ orgId, actorUserId, action: "org.enable", target: orgId, outcome: updated ? "success" : "failure" });
  return updated;
}

// Re-export the granular admin operations with audit wrappers for the API layer.
export async function assignUserRole(orgId: string, userId: string, role: Role, actorUserId: string) {
  const updated = await setUserRole(orgId, userId, role);
  await logAudit({ orgId, actorUserId, action: "user.role_assign", target: `${userId}->${role}`, outcome: updated ? "success" : "failure" });
  return updated;
}

export async function changeUserStatus(orgId: string, userId: string, status: OrgUser["status"], actorUserId: string) {
  const updated = await setUserStatus(orgId, userId, status);
  await logAudit({ orgId, actorUserId, action: `user.${status}`, target: userId, outcome: updated ? "success" : "failure" });
  return updated;
}
