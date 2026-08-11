import type { ClsService } from "nestjs-cls";
import { env } from "../../../config/env";

export type RepositoryScope = "global" | "tenant";
type DataRecord = Record<string, unknown>;

export function applyRepositoryScope(
  filter: DataRecord,
  scope: RepositoryScope,
  cls?: ClsService,
): DataRecord {
  if (scope === "global" || env.TENANCY_MODE === "single") return filter;
  return { ...filter, tenantId: getRequiredTenantId(cls) };
}

export function applyCreateScope(
  data: DataRecord,
  scope: RepositoryScope,
  cls?: ClsService,
): DataRecord {
  if (scope === "global" || env.TENANCY_MODE === "single") return data;
  return { ...data, tenantId: getRequiredTenantId(cls) };
}

function getRequiredTenantId(cls?: ClsService): string {
  const tenantId = cls?.get("tenantId");
  if (typeof tenantId === "string" && tenantId.length > 0) return tenantId;
  throw new Error("Tenant-scoped repository used without an active tenant context");
}
