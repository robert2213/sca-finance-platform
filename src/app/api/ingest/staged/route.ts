import { NextRequest, NextResponse } from "next/server";
import { financialStage } from "@/lib/ingestion/financial-stage.resolver";
import { withTenant } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";

// Reads the live stage at request time — must not be statically cached.
export const dynamic = "force-dynamic";

/**
 * GET /api/ingest/staged
 * Inspect the financial staging buffer FOR THE CALLER'S TENANT only.
 * Guarded by data:view_validation; every read scoped via ctx.clientId.
 */
async function handleStaged(request: NextRequest, ctx: TenantContext) {
  const uploadId = request.nextUrl.searchParams.get("uploadId");

  if (uploadId) {
    const records = await financialStage.getByUpload(uploadId, ctx.clientId);
    return NextResponse.json({ uploadId, count: records.length, records });
  }

  const [totalRecords, uploads] = await Promise.all([
    financialStage.count(ctx.clientId),
    financialStage.listUploadSummaries(ctx.clientId),
  ]);
  return NextResponse.json({ totalRecords, uploads });
}

export const GET = withTenant(handleStaged, {
  permission: "data:view_validation",
  action: "ingest.staged",
});
