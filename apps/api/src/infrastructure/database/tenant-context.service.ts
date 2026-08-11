import { Injectable } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import type { TenantContext } from "@repo/shared";
import { env } from "../../config/env";

@Injectable()
export class TenantContextService {
  constructor(private readonly cls: ClsService) {}

  get(): TenantContext {
    if (env.TENANCY_MODE === "single") return { mode: "single" };
    return {
      mode: "multi",
      tenantId: this.cls.get("tenantId"),
      membershipId: this.cls.get("tenantMembershipId"),
      role: this.cls.get("tenantRole"),
    };
  }

  getRequiredTenantId(): string | null {
    return this.get().tenantId ?? null;
  }

  run<T>(context: TenantContext, callback: () => T): T {
    const store = {
      ...this.cls.get(),
      tenantMode: context.mode,
      tenantId: context.tenantId,
      tenantMembershipId: context.membershipId,
      tenantRole: context.role,
    };
    return this.cls.runWith(store, callback);
  }
}
