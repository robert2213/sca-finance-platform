/**
 * Organization service — CRUD for the tenant control-plane `organization` table.
 *
 * The organization is the security boundary. tenantId equals the org id and is
 * the value written to every client_id column, so this service governs which
 * tenants exist and their lifecycle status/settings.
 *
 * Adapter-aware: local SQLite via insertRows, Databricks via parameterized MERGE.
 */

import { getAdapter, getConnectionMode, dbQuery } from "@/lib/databricks";
import type { LocalAdapter } from "@/lib/adapters/local-adapter";
import {
  type Organization,
  type OrganizationStatus,
  type OrganizationSettings,
  parseSettings,
  isOrganizationStatus,
} from "@/lib/models/organization";

interface OrgRow {
  id: string;
  name: string;
  tenant_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  settings: string | null;
}

function rowToOrg(r: OrgRow): Organization {
  return {
    id: r.id,
    name: r.name,
    tenantId: r.tenant_id,
    status: isOrganizationStatus(r.status) ? r.status : "onboarding",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    settings: parseSettings(r.settings),
  };
}

const SELECT_COLS = "id, name, tenant_id, status, created_at, updated_at, settings";

export async function getOrganization(id: string): Promise<Organization | null> {
  const res = await dbQuery<OrgRow>(
    `SELECT ${SELECT_COLS} FROM organization WHERE id = ?`,
    [id]
  );
  return res.rows[0] ? rowToOrg(res.rows[0]) : null;
}

export async function listOrganizations(): Promise<Organization[]> {
  const res = await dbQuery<OrgRow>(
    `SELECT ${SELECT_COLS} FROM organization ORDER BY created_at DESC`
  );
  return res.rows.map(rowToOrg);
}

export async function upsertOrganization(input: {
  id: string;
  name: string;
  tenantId?: string;
  status?: OrganizationStatus;
  settings?: OrganizationSettings;
  createdAt?: string;
}): Promise<Organization> {
  const now = new Date().toISOString();
  const existing = await getOrganization(input.id).catch(() => null);

  const record: OrgRow = {
    id: input.id,
    name: input.name,
    tenant_id: input.tenantId ?? existing?.tenantId ?? input.id,
    status: input.status ?? existing?.status ?? "onboarding",
    created_at: existing?.createdAt ?? input.createdAt ?? now,
    updated_at: now,
    settings: JSON.stringify(input.settings ?? existing?.settings ?? {}),
  };

  if (getConnectionMode() === "local") {
    const adapter = getAdapter() as unknown as LocalAdapter;
    await adapter.insertRows("organization", [record as unknown as Record<string, unknown>]);
  } else {
    await getAdapter().query(
      `MERGE INTO organization AS t
       USING (SELECT ? AS id, ? AS name, ? AS tenant_id, ? AS status,
                     ? AS created_at, ? AS updated_at, ? AS settings) AS s
       ON t.id = s.id
       WHEN MATCHED THEN UPDATE SET *
       WHEN NOT MATCHED THEN INSERT *`,
      [record.id, record.name, record.tenant_id, record.status,
       record.created_at, record.updated_at, record.settings]
    );
  }
  return rowToOrg(record);
}

const ALLOWED_TRANSITIONS: Record<OrganizationStatus, OrganizationStatus[]> = {
  onboarding: ["active", "suspended", "offboarded"],
  active: ["suspended", "offboarded"],
  suspended: ["active", "offboarded"],
  offboarded: [],
};

export async function setOrganizationStatus(
  id: string,
  status: OrganizationStatus
): Promise<Organization | null> {
  const existing = await getOrganization(id);
  if (!existing) return null;
  if (existing.status === status) return existing; // idempotent
  if (!ALLOWED_TRANSITIONS[existing.status].includes(status)) {
    throw new Error(`Illegal organization status transition: ${existing.status} -> ${status}`);
  }
  return upsertOrganization({ id, name: existing.name, tenantId: existing.tenantId, status, settings: existing.settings });
}

export async function updateOrganizationSettings(
  id: string,
  settings: OrganizationSettings
): Promise<Organization | null> {
  const existing = await getOrganization(id);
  if (!existing) return null;
  return upsertOrganization({
    id,
    name: existing.name,
    tenantId: existing.tenantId,
    status: existing.status,
    settings: { ...existing.settings, ...settings },
  });
}
