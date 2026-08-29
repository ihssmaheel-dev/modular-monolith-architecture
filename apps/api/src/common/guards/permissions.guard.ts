import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY, type PermissionRequirement } from "../decorators/permissions.decorator";
import { type TenantContext } from "@repo/contracts";
import { hasPermission, resolveUserPermissions, type Permission } from "@repo/authorization";
import { AuthorizationService } from "../../infrastructure/authorization";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authorization?: AuthorizationService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const raw = this.reflector.getAllAndOverride<PermissionRequirement | Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!raw) return true;

    const requirement: PermissionRequirement = Array.isArray(raw)
      ? { permissions: raw, mode: "all" }
      : raw;

    if (!requirement.permissions || requirement.permissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.role) {
      throw new ForbiddenException();
    }

    const tenant = request.tenant as TenantContext | undefined;
    if (!this.authorization) {
      const permissions = resolveUserPermissions(user.role, tenant?.role);
      if (!hasPermission(permissions, requirement.permissions, requirement.mode)) {
        throw new ForbiddenException();
      }
      return true;
    }
    const authorization = this.authorization;
    const principal = {
      id: user.sub,
      email: user.email,
      role: user.role,
      tenantId: tenant?.tenantId,
      tenantRole: tenant?.role,
    };
    const allowed = requirement.permissions
      ? requirement.mode === "any"
        ? requirement.permissions.some((action) =>
            authorization.can(principal, action, undefined, "request"),
          )
        : requirement.permissions.every((action) =>
            authorization.can(principal, action, undefined, "request"),
          )
      : false;

    if (!allowed) {
      throw new ForbiddenException();
    }

    return true;
  }
}
