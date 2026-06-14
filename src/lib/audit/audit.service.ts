/**
 * Security audit service — append-only log of access-control and admin events.
 *
 * Distinct from data_quality_log (which records ingestion actions). This table
 * captures WHO did WHAT to WHICH tenant and whether it was allowed/denied, so
 * organization admins (and Sin City Analytics) have an activity trail.
 *
 * Adapter-aware: uses the local SQLite insertRows path or a parameterized
 * Databricks INSERT. Never throws — audit logging must not break a request.
 */

import { getAdapter, getConnectionMode, dbQuery } from "@/lib/databricks";
import type { LocalAdapter } from "@/lib/adapters/local-adapter";
import type { AuditEvent } from "@/lib/models/organization";

function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `evt_${Date.now()}_${Math.floor(Math.random() * 1e9).toString(36)}`;
}

type AuditInput = {
  orgId: string | null;
  actorUserId: string;
  action: string;
  target?: string | null;
  outcome: AuditEvent["outcome"];
  detail?: string | null;
};

/**
 * Write a security/audit event. Best-effort: swallows all errors so callers
 * never need to guard it.
 */
export async function logAudit(event: AuditInput): Promise<void> {
  const row = {
    event_id: newId(),
    ts: new Date().toISOString(),
    org_id: event.orgId ?? null,
    actor_user_id: event.actorUserId,
    action: event.action,
    target: event.target ?? null,
    outcome: event.outcome,
    detail: event.detail ?? null,
  };

  try {
    if (getConnectionMode() === "local") {
      const adapter = getAdapter() as unknown as LocalAdapter;
      await adapter.insertRows("audit_log", [row]);
      return;
    }
    await getAdapter().query(
      `INSERT INTO audit_log (event_id, ts, org_id, actor_user_id, action, target, outcome, detail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.event_id, row.ts, row.org_id, row.actor_user_id, row.action, row.target, row.outcome, row.detail]
    );
  } catch (err) {
    // Last-resort: surface to server logs but never propagate.
    console.warn("[audit] failed to persist event:", (err as Error)?.message);
  }
}

export interface AuditRow {
  ts: string;
  actor_user_id: string;
  action: string;
  target: string | null;
  outcome: string;
  detail: string | null;
}

/** Read the most recent audit events for a tenant (org activity feed). */
export async function getAuditEvents(orgId: string, limit = 100): Promise<AuditRow[]> {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 500);
  try {
    const result = await dbQuery<AuditRow>(
      `SELECT ts, actor_user_id, action, target, outcome, detail
       FROM audit_log
       WHERE org_id = ?
       ORDER BY ts DESC
       LIMIT ${safeLimit}`,
      [orgId]
    );
    return result.rows;
  } catch (err) {
    console.warn("[audit] failed to read events:", (err as Error)?.message);
    return [];
  }
}
