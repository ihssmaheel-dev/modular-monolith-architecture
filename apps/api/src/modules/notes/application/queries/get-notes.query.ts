import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { Note } from "../../domain/entities/note.entity";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { PaginatedResult } from "../../../../infrastructure/database/base.repository";

@Injectable()
export class GetNotesQuery {
  constructor(private readonly repository: NotesRepository) {}

  async execute(options: { page?: number; limit?: number }): Promise<Result<PaginatedResult<Note>, never>> {
    return this.repository.paginate({}, {
      page: options.page ?? 1,
      limit: options.limit ?? 20,
      sort: { createdAt: -1 },
    });
  }
}
