/**
 * User service — CRUD for the `app_user` mirror table.
 *
 * Clerk owns credentials, sessions, and organization membership. This table
 * mirrors membership and holds the authoritative APPLICATION role + lifecycle
 * status (invited/active/disabled) for fast role resolution and audit.
 *
 * getOrgUserRole is the function tenant-context calls each request to resolve
 * the precise assigned role; it must be cheap and must never throw upstream.
 */

import { getAdapter, getConnectionMode, dbQuery } from "@/lib/databricks";
import type { LocalAdapter } from "@/lib/adapters/local-adapter";
import type { OrgUser, UserStatus } from "@/lib/models/organization";
import { isRole, type Role } from "@/lib/auth/rbac";

interface UserRow {
  user_id: string;
  org_id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function rowToUser(r: UserRow): OrgUser {
  return {
    userId: r.user_id,
    orgId: r.org_id,
    email: r.email,
    role: r.role,
    status: (["invited", "active", "disabled"].includes(r.status) ? r.status : "active") as UserStatus,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const SELECT_COLS = "user_id, org_id, email, role, status, created_at, updated_at";

export async function getUser(orgId: string, userId: string): Promise<OrgUser | null> {
  const res = await dbQuery<UserRow>(
    `SELECT ${SELECT_COLS} FROM app_user WHERE org_id = ? AND user_id = ?`,
    [orgId, userId]
  );
  return res.rows[0] ? rowToUser(res.rows[0]) : null;
}

export async function listUsers(orgId: string): Promise<OrgUser[]> {
  const res = await dbQuery<UserRow>(
    `SELECT ${SELECT_COLS} FROM app_user WHERE org_id = ? ORDER BY created_at ASC`,
    [orgId]
  );
  return res.rows.map(rowToUser);
}

/**
 * Resolve the assigned application role for a user in an organization.
 * Returns null when no row exists or the user is disabled (so the caller falls
 * back to the coarse Clerk role / denies access).
 */
export async function getOrgUserRole(orgId: string, userId: string): Promise<Role | null> {
  const res = await dbQuery<{ role: string; status: string }>(
    `SELECT role, status FROM app_user WHERE org_id = ? AND user_id = ?`,
    [orgId, userId]
  );
  const row = res.rows[0];
  if (!row || row.status === "disabled") return null;
  return isRole(row.role) ? row.role : null;
}

export async function upsertUser(input: {
  userId: string;
  orgId: string;
  email: string;
  role: Role;
  status?: UserStatus;
  createdAt?: string;
}): Promise<OrgUser> {
  const now = new Date().toISOString();
  const existing = await getUser(input.orgId, input.userId).catch(() => null);

  const record: UserRow = {
    user_id: input.userId,
    org_id: input.orgId,
    email: input.email,
    role: input.role,
    status: input.status ?? (existing?.status as UserStatus) ?? "invited",
    created_at: existing?.createdAt ?? input.createdAt ?? now,
    updated_at: now,
  };

  if (getConnectionMode() === "local") {
    const adapter = getAdapter() as unknown as LocalAdapter;
    await adapter.insertRows("app_user", [record as unknown as Record<string, unknown>]);
  } else {
    await getAdapter().query(
      `MERGE INTO app_user AS t
       USING (SELECT ? AS user_id, ? AS org_id, ? AS email, ? AS role,
                     ? AS status, ? AS created_at, ? AS updated_at) AS s
       ON t.user_id = s.user_id AND t.org_id = s.org_id
       WHEN MATCHED THEN UPDATE SET *
       WHEN NOT MATCHED THEN INSERT *`,
      [record.user_id, record.org_id, record.email, record.role,
       record.status, record.created_at, record.updated_at]
    );
  }
  return rowToUser(record);
}

export async function setUserRole(orgId: string, userId: string, role: Role): Promise<OrgUser | null> {
  const existing = await getUser(orgId, userId);
  if (!existing) return null;
  return upsertUser({ orgId, userId, email: existing.email, role, status: existing.status });
}

export async function setUserStatus(orgId: string, userId: string, status: UserStatus): Promise<OrgUser | null> {
  const existing = await getUser(orgId, userId);
  if (!existing) return null;
  return upsertUser({ orgId, userId, email: existing.email, role: existing.role as Role, status });
}
