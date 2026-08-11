import { Injectable } from "@nestjs/common";
import { err, type Result } from "neverthrow";
import type { PaginatedResult } from "../../../../infrastructure/database/base.repository";
import { TenantContextService } from "../../../../infrastructure/database/tenant-context.service";
import type { Membership } from "../../domain/entities/tenancy.entity";
import type { TenancyError } from "../../domain/errors/tenancy.errors";
import { MembershipsRepository } from "../../infrastructure/memberships.repository";

@Injectable()
export class ListMembersQuery {
  constructor(
    private readonly memberships: MembershipsRepository,
    private readonly context: TenantContextService,
  ) {}

  execute(page: number, limit: number): Promise<Result<PaginatedResult<Membership>, TenancyError>> {
    const tenantId = this.context.getRequiredTenantId();
    if (!tenantId) return Promise.resolve(err({ type: "TENANT_REQUIRED" }));
    return this.memberships.paginateForTenant(tenantId, { page, limit });
  }
}
