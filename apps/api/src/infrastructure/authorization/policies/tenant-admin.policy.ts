import type { Policy } from "@repo/shared";

export const genericTenantAdminPolicy: Policy = {
  id: "generic-tenant-admin-manage",
  description: "Tenant owner or admin has management access to all tenant resources",
  resourceType: "*",
  action: "*",
  effect: "ALLOW",
  condition: ({ principal, resource }) => {
    if (!resource) return false;
    const isTenantAdmin = principal.tenantRole === "admin" || principal.tenantRole === "owner";
    const isSameTenant = !resource.tenantId || resource.tenantId === principal.tenantId;
    return isTenantAdmin && isSameTenant;
  },
};
