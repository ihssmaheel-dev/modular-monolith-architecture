import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import {
  Permission,
  RolePermissions,
  TenantRolePermissions,
  UserRole,
  type TenantContext,
} from "@repo/shared";
import { env } from "../../config/env";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No specific permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException();
    }

    const tenant = request.tenant as TenantContext | undefined;
    const userPermissions = this.getPermissions(user.role as UserRole, tenant);

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException();
    }

    return true;
  }

  private getPermissions(role: UserRole, tenant?: TenantContext): Permission[] {
    if (env.TENANCY_MODE === "multi" && tenant?.role) {
      return TenantRolePermissions[tenant.role] ?? [];
    }
    return RolePermissions[role] ?? [];
  }
}
