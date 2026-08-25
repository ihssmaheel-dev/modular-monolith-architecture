import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { evaluateAuthorization, type AuthorizationDecision, type AuthorizationRequest, type Permission, type Policy, type Principal } from "@repo/authorization";

export function useAuthorization(customPolicies: Policy[] = []) {
  const user = useAuthStore((state) => state.user);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);

  const principal: Principal | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: activeTenantId ?? undefined,
    };
  }, [user, activeTenantId]);

  const check = useCallback(
    <TResource = unknown, TContext extends Record<string, unknown> = Record<string, unknown>>(
      request: Omit<AuthorizationRequest<TResource, TContext>, "principal">,
    ): AuthorizationDecision => {
      if (!principal) {
        return { allowed: false, reason: "DEFAULT_DENY", details: "Unauthenticated" };
      }

      return evaluateAuthorization<TResource, TContext>(
        {
          ...request,
          principal,
        },
        customPolicies as unknown as Policy<TResource, TContext>[],
      );
    },
    [principal, customPolicies],
  );

  const can = useCallback(
    (action: Permission | string, resource?: unknown, resourceType?: string): boolean => {
      return check({ action, resource, resourceType }).allowed;
    },
    [check],
  );

  const cannot = useCallback(
    (action: Permission | string, resource?: unknown, resourceType?: string): boolean => {
      return !can(action, resource, resourceType);
    },
    [can],
  );

  return {
    principal,
    check,
    can,
    cannot,
    isAdmin: user?.role === "admin",
  };
}
