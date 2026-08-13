import { Injectable } from "@nestjs/common";

import { RealtimeConnectionRegistry } from "../connections/realtime-connection.registry";

const BROADCAST_TARGET = "broadcast";
const SINGLE_TENANT_USER_PREFIX = "user:";
const MULTI_TENANT_USER_PREFIX = "tenant:";

@Injectable()
export class RealtimeStreamRouter {
  constructor(private readonly registry: RealtimeConnectionRegistry) {}

  route(target: string, event: string, payload: unknown): boolean {
    if (target === BROADCAST_TARGET) {
      this.registry.dispatchToAll(event, payload);
      return true;
    }

    const tenantTarget = parseTenantUserTarget(target);
    if (tenantTarget) {
      this.registry.dispatchToUser(tenantTarget.userId, tenantTarget.tenantId, event, payload);
      return true;
    }

    const userId = parseSingleTenantUserTarget(target);
    if (!userId) return false;
    this.registry.dispatchToUser(userId, undefined, event, payload);
    return true;
  }
}

function parseSingleTenantUserTarget(target: string): string | null {
  if (!target.startsWith(SINGLE_TENANT_USER_PREFIX)) return null;
  const userId = target.slice(SINGLE_TENANT_USER_PREFIX.length);
  if (!userId || userId.includes(":")) return null;
  return userId;
}

function parseTenantUserTarget(target: string): { tenantId: string; userId: string } | null {
  if (!target.startsWith(MULTI_TENANT_USER_PREFIX)) return null;
  const [, tenantId, resource, userId, ...rest] = target.split(":");
  if (!tenantId || resource !== "user" || !userId || rest.length) return null;
  return { tenantId, userId };
}
