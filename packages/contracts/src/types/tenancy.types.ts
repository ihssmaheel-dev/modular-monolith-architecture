import type { TENANCY_MODES, TENANT_ROLES } from "../constants/tenancy.constants";

export type TenancyMode = (typeof TENANCY_MODES)[number];
export type TenantRole = (typeof TENANT_ROLES)[number];

export interface TenantContext {
  mode: TenancyMode;
  tenantId?: string;
  membershipId?: string;
  role?: TenantRole;
}
