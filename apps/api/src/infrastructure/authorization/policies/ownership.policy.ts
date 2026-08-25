import type { Policy } from "@repo/shared";

export const genericOwnershipPolicy: Policy = {
  id: "generic-resource-owner-manage",
  description: "Resource creator/owner has full access to their resource within their tenant",
  resourceType: "*",
  action: "*",
  effect: "ALLOW",
  condition: ({ principal, resource }) => {
    if (!resource) return false;
    const isOwner = resource.ownerId === principal.id;
    const isSameTenant = !resource.tenantId || resource.tenantId === principal.tenantId;
    return isOwner && isSameTenant;
  },
};
