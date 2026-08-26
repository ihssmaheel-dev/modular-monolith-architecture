import { SetMetadata } from "@nestjs/common";
import type { Permission } from "@repo/authorization";

export const PERMISSIONS_KEY = "permissions";

export interface PermissionRequirement {
  permissions: Permission[];
  mode: "all" | "any";
}

export function RequirePermission(
  permission: Permission | Permission[],
  options: { mode?: "all" | "any" } = {},
) {
  const permissions = Array.isArray(permission) ? permission : [permission];
  return SetMetadata(PERMISSIONS_KEY, {
    permissions,
    mode: options.mode ?? "all",
  } satisfies PermissionRequirement);
}

export function RequirePermissions(...permissions: Permission[]) {
  return SetMetadata(PERMISSIONS_KEY, {
    permissions,
    mode: "all",
  } satisfies PermissionRequirement);
}
