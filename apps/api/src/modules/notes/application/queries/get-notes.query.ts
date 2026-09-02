import { Injectable, Optional } from "@nestjs/common";
import { Result } from "neverthrow";
import { Note } from "../../domain/entities/note.entity";
import { NotesRepository } from "../../infrastructure/notes.repository";
import type { PaginatedResult } from "../../../../infrastructure/database";
import type { AuthenticatedUser } from "@repo/contracts";
import { AuthorizationService } from "../../../../infrastructure/authorization";
import { TenantContextService } from "../../../../infrastructure/database";
import { canListTenantResources } from "../../../../common/utils/resource-authorization";

@Injectable()
export class GetNotesQuery {
  constructor(
    private readonly repository: NotesRepository,
    @Optional() private readonly authorization?: AuthorizationService,
    @Optional() private readonly tenantContext?: TenantContextService,
  ) {}

  async execute(
    options: { page?: number; limit?: number },
    actor: AuthenticatedUser,
  ): Promise<Result<PaginatedResult<Note>, never>> {
    const filter = canListTenantResources(
      this.authorization,
      this.tenantContext,
      actor,
      "notes:read",
    )
      ? {}
      : { createdBy: actor.sub };
    return this.repository.paginate(filter, {
      page: options.page ?? 1,
      limit: options.limit ?? 20,
      sort: { createdAt: -1 },
    });
  }
}
