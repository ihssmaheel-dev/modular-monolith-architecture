import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  PERMISSIONS_KEY,
  type PermissionRequirement,
} from "../decorators/permissions.decorator";
import { type TenantContext } from "@repo/contracts";
import { hasPermission, resolveUserPermissions, type Permission } from "@repo/authorization";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const raw = this.reflector.getAllAndOverride<
      PermissionRequirement | Permission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

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
    const userPermissions = resolveUserPermissions(user.role, tenant?.role);

    const allowed = hasPermission(
      userPermissions,
      requirement.permissions,
      requirement.mode,
    );

    if (!allowed) {
      throw new ForbiddenException();
    }

    return true;
  }
}
