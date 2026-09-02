import type { AuthenticatedUser } from "@repo/contracts";
import { resolveResourceOwnerId } from "@repo/authorization";
import { AuthorizationService } from "../../infrastructure/authorization";
import { TenantContextService } from "../../infrastructure/database";

export function canAccessResource(
  authorization: AuthorizationService | undefined,
  tenantContext: TenantContextService | undefined,
  actor: AuthenticatedUser,
  action: string,
  resourceType: string,
  resource: unknown,
): boolean {
  if (actor.role === "admin") return true;
  if (!authorization) {
    return resolveResourceOwnerId(resourceType, resource as Record<string, unknown>) === actor.sub;
  }
  return authorization.check({
    principal: principalFor(actor, tenantContext),
    action,
    resourceType,
    resource,
  }).allowed;
}

export function canListTenantResources(
  authorization: AuthorizationService | undefined,
  tenantContext: TenantContextService | undefined,
  actor: AuthenticatedUser,
  action: string,
): boolean {
  if (actor.role === "admin") return true;
  return authorization?.can(principalFor(actor, tenantContext), action) ?? false;
}

function principalFor(
  actor: AuthenticatedUser,
  tenantContext: TenantContextService | undefined,
): {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
  tenantRole?: string;
} {
  const tenant = tenantContext?.get();
  return {
    id: actor.sub,
    email: actor.email,
    role: actor.role,
    tenantId: tenant?.tenantId,
    tenantRole: tenant?.role,
  };
}
