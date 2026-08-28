import * as React from "react";
import { useAuthorization } from "@/hooks/use-authorization";
import type { Permission } from "@repo/authorization";

interface CanProps {
  do: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ do: action, children, fallback = null }: CanProps) {
  const { can } = useAuthorization();
  if (!can(action)) return <>{fallback}</>;
  return <>{children}</>;
}
