import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { FilesRepository } from "../../infrastructure/files.repository";
import { FileEntity } from "../../domain/entities/file.entity";
import type { AuthenticatedUser } from "@repo/shared";
import type { PaginatedResult } from "../../../../infrastructure/database/base.repository";

@Injectable()
export class ListFilesByParentQuery {
  constructor(private readonly filesRepo: FilesRepository) {}

  async execute(
    parentType: string,
    actor: AuthenticatedUser,
    parentId?: string,
    page = 1,
    limit = 20,
  ): Promise<Result<PaginatedResult<FileEntity>, never>> {
    const filter: Record<string, string> = { parentType };
    if (parentId) filter.parentId = parentId;
    if (actor.role !== "admin") filter.uploadedBy = actor.sub;
    return this.filesRepo.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
  }
}
