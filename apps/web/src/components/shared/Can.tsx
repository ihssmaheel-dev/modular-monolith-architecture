import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthorization } from "@/hooks/use-authorization";
import type { Permission } from "@repo/shared";

export interface CanProps {
  do?: Permission | Permission[] | string | string[];
  not?: Permission | Permission[] | string | string[];
  resource?: unknown;
  resourceType?: string;
  mode?: "all" | "any";
  fallback?: ReactNode;
  children: ReactNode | ((allowed: boolean) => ReactNode);
}

export function Can({
  do: doPermission,
  not: notPermission,
  resource,
  resourceType,
  mode = "all",
  fallback = null,
  children,
}: CanProps) {
  const { can: canAction, cannot: cannotAction } = usePermissions();
  const { can: canResource, cannot: cannotResource } = useAuthorization();

  let allowed = true;

  if (doPermission) {
    if (resource !== undefined) {
      const action = Array.isArray(doPermission) ? doPermission[0] : doPermission;
      allowed = action ? canResource(action, resource, resourceType) : true;
    } else {
      allowed = canAction(doPermission, mode);
    }
  } else if (notPermission) {
    if (resource !== undefined) {
      const action = Array.isArray(notPermission) ? notPermission[0] : notPermission;
      allowed = action ? cannotResource(action, resource, resourceType) : false;
    } else {
      allowed = cannotAction(notPermission, mode);
    }
  }

  if (typeof children === "function") {
    return <>{children(allowed)}</>;
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
