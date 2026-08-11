import { Injectable } from "@nestjs/common";
import { err, ok, type Result } from "neverthrow";
import { TenantContextService } from "../../../../infrastructure/database";
import type { TenancyError } from "../../domain/errors/tenancy.errors";
import { MembershipsRepository } from "../../infrastructure/memberships.repository";

@Injectable()
export class RemoveMemberCommand {
  constructor(
    private readonly memberships: MembershipsRepository,
    private readonly context: TenantContextService,
  ) {}

  async execute(userId: string): Promise<Result<void, TenancyError>> {
    const tenant = this.context.get();
    if (!tenant.tenantId) return err({ type: "TENANT_REQUIRED" });
    const target = await this.memberships.findMembership(tenant.tenantId, userId);
    if (target.isErr()) return err({ type: "TENANCY_OPERATION_FAILED" });
    if (!target.value) return err({ type: "MEMBERSHIP_NOT_FOUND" });
    if (target.value.data.role === "owner" && tenant.role !== "owner") {
      return err({ type: "TENANT_FORBIDDEN" });
    }
    if (target.value.data.role === "owner") {
      const owners = await this.memberships.countOwners(tenant.tenantId);
      if (owners.isErr()) return err({ type: "TENANCY_OPERATION_FAILED" });
      if (owners.value <= 1) return err({ type: "LAST_OWNER" });
    }
    if (tenant.role !== "owner" && tenant.role !== "admin") {
      return err({ type: "TENANT_FORBIDDEN" });
    }
    const removed = await this.memberships.remove(tenant.tenantId, userId);
    if (removed.isErr()) return err({ type: "TENANCY_OPERATION_FAILED" });
    if (!removed.value) return err({ type: "MEMBERSHIP_NOT_FOUND" });
    return ok(undefined);
  }
}
