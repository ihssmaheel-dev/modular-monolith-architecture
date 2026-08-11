import { Injectable } from "@nestjs/common";
import { err, ok, type Result } from "neverthrow";
import type { TenantContext } from "@repo/shared";
import { env } from "../../../../config/env";
import type { TenancyError } from "../../domain/errors/tenancy.errors";
import { MembershipsRepository } from "../../infrastructure/memberships.repository";

@Injectable()
export class ResolveTenantAccessQuery {
  constructor(private readonly memberships: MembershipsRepository) {}

  async execute(userId: string, tenantId?: string): Promise<Result<TenantContext, TenancyError>> {
    if (env.TENANCY_MODE === "single") return ok({ mode: "single" });
    if (!tenantId) return err({ type: "TENANT_REQUIRED" });

    const result = await this.memberships.findMembership(tenantId, userId);
    if (result.isErr() || !result.value) return err({ type: "MEMBERSHIP_NOT_FOUND" });
    return ok({
      mode: "multi",
      tenantId,
      membershipId: result.value.data.id,
      role: result.value.data.role,
    });
  }
}
