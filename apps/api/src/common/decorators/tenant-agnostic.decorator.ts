import { SetMetadata } from "@nestjs/common";

export const TENANT_AGNOSTIC_KEY = "tenantAgnostic";
export const TenantAgnostic = () => SetMetadata(TENANT_AGNOSTIC_KEY, true);
