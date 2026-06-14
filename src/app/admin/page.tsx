export const dynamic = "force-dynamic";

import PageWrapper from "@/components/layout/PageWrapper";
import AdminConsole from "@/components/admin/AdminConsole";
import { getTenantContext } from "@/lib/tenant/tenant-context";
import { hasPermission } from "@/lib/auth/rbac";

/**
 * Administration console. Server-gated: only org admins (org:view_activity),
 * SystemAdmins, or the demo operator may view it. Permission is ALSO enforced
 * server-side on every admin API the console calls — this page guard is the
 * first line, not the only line.
 */
export default async function AdminPage() {
  const ctx = await getTenantContext();
  const canAdmin =
    ctx.isDemo || ctx.role === "SystemAdmin" || hasPermission(ctx.role, "org:view_activity");

  if (!canAdmin) {
    return (
      <PageWrapper title="Administration" subtitle="Access restricted" badge="Admin">
        <div className="p-8 text-slate-500 text-sm">
          You do not have permission to access administration. Contact your
          organization administrator.
        </div>
      </PageWrapper>
    );
  }

  const isSystemAdmin = ctx.role === "SystemAdmin" || ctx.isDemo;

  return (
    <PageWrapper
      title="Administration"
      subtitle="Organizations · users · roles · onboarding"
      badge="Admin"
    >
      <AdminConsole
        orgId={ctx.orgId ?? ctx.clientId}
        role={ctx.role}
        isSystemAdmin={isSystemAdmin}
        isDemo={ctx.isDemo}
      />
    </PageWrapper>
  );
}
