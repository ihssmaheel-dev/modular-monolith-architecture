import { Injectable } from "@nestjs/common";
import { err, ok, type Result } from "neverthrow";
import type { TenantRole } from "@repo/shared";
import { TenantContextService } from "../../../../infrastructure/database";
import type { Membership } from "../../domain/entities/tenancy.entity";
import type { TenancyError } from "../../domain/errors/tenancy.errors";
import { MembershipsRepository } from "../../infrastructure/memberships.repository";

@Injectable()
export class UpdateMemberCommand {
  constructor(
    private readonly memberships: MembershipsRepository,
    private readonly context: TenantContextService,
  ) {}

  async execute(userId: string, role: TenantRole): Promise<Result<Membership, TenancyError>> {
    const tenant = this.context.get();
    if (!tenant.tenantId) return err({ type: "TENANT_REQUIRED" });
    const target = await this.memberships.findMembership(tenant.tenantId, userId);
    if (target.isErr()) return err({ type: "TENANCY_OPERATION_FAILED" });
    if (!target.value) return err({ type: "MEMBERSHIP_NOT_FOUND" });
    if (!canChangeRole(tenant.role, target.value.data.role, role)) {
      return err({ type: "TENANT_FORBIDDEN" });
    }
    if (target.value.data.role === "owner" && role !== "owner") {
      const owners = await this.memberships.countOwners(tenant.tenantId);
      if (owners.isErr()) return err({ type: "TENANCY_OPERATION_FAILED" });
      if (owners.value <= 1) return err({ type: "LAST_OWNER" });
    }
    const updated = await this.memberships.updateRole(tenant.tenantId, userId, role);
    if (updated.isErr() || !updated.value) return err({ type: "MEMBERSHIP_NOT_FOUND" });
    return ok(updated.value);
  }
}

function canChangeRole(
  actorRole: TenantRole | undefined,
  currentRole: TenantRole,
  nextRole: TenantRole,
): boolean {
  if (actorRole === "owner") return true;
  if (actorRole !== "admin") return false;
  return currentRole !== "owner" && nextRole !== "owner";
}
