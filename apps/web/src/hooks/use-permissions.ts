import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { hasPermission, resolveUserPermissions, type Permission } from "@repo/authorization";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const permissions = useMemo(() => {
    if (!user) return [];
    return resolveUserPermissions(user.role);
  }, [user]);

  const can = useMemo(
    () =>
      (
        required: Permission | Permission[] | string | string[],
        mode: "all" | "any" = "all",
      ): boolean => {
        return hasPermission(permissions, required, mode);
      },
    [permissions],
  );

  const cannot = useMemo(
    () =>
      (
        required: Permission | Permission[] | string | string[],
        mode: "all" | "any" = "all",
      ): boolean => {
        return !can(required, mode);
      },
    [can],
  );

  return {
    permissions,
    hasPermission: can,
    can,
    cannot,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
  };
}
