import { NextRequest, NextResponse } from "next/server";
import { uploadHistory } from "@/lib/ingestion/upload-history.resolver";
import { withTenant } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";

// Reads the live store at request time — must not be statically cached.
export const dynamic = "force-dynamic";

/**
 * GET /api/ingest/uploads
 * Returns the upload history FOR THE CALLER'S TENANT only (most recent first).
 * Guarded by data:view_validation; tenant-scoped via ctx.clientId.
 */
async function handleListUploads(_request: NextRequest, ctx: TenantContext) {
  const uploads = await uploadHistory.listUploads(ctx.clientId);
  return NextResponse.json({ count: uploads.length, uploads });
}

export const GET = withTenant(handleListUploads, {
  permission: "data:view_validation",
  action: "ingest.uploads.list",
});
