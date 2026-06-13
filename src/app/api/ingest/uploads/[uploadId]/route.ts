import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { uploadHistory } from "@/lib/ingestion/upload-history.resolver";
import { withTenant, jsonError } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";

export const dynamic = "force-dynamic";

/**
 * GET /api/ingest/uploads/[uploadId]
 * Returns one upload record — only if it belongs to the caller's tenant.
 * Guarded by data:view_validation; tenant-scoped via ctx.clientId.
 */
async function handleGetUpload(
  _request: NextRequest,
  ctx: TenantContext,
  segment: { params?: Record<string, string | string[]> }
) {
  const raw = segment.params?.uploadId;
  const uploadId = Array.isArray(raw) ? raw[0] : raw ?? "";
  const record = await uploadHistory.getUpload(uploadId, ctx.clientId);
  if (!record) {
    return jsonError(`Upload "${uploadId}" not found`, 404);
  }
  return NextResponse.json(record);
}

export const GET = withTenant(handleGetUpload, {
  permission: "data:view_validation",
  action: "ingest.uploads.get",
});
