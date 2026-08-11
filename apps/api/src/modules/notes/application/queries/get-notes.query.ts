import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { Note } from "../../domain/entities/note.entity";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { PaginatedResult } from "../../../../infrastructure/database/base.repository";
import type { AuthenticatedUser } from "@repo/shared";

@Injectable()
export class GetNotesQuery {
  constructor(private readonly repository: NotesRepository) {}

  async execute(
    options: { page?: number; limit?: number },
    actor: AuthenticatedUser,
  ): Promise<Result<PaginatedResult<Note>, never>> {
    const filter = actor.role === "admin" ? {} : { createdBy: actor.sub };
    return this.repository.paginate(filter, {
      page: options.page ?? 1,
      limit: options.limit ?? 20,
      sort: { createdAt: -1 },
    });
  }
}
