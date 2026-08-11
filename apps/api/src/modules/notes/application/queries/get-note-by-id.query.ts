import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { Note } from "../../domain/entities/note.entity";
import { NoteNotFound } from "../../domain/errors/note.errors";
import { NotesRepository } from "../../infrastructure/notes.repository";
import type { AuthenticatedUser } from "@repo/shared";

@Injectable()
export class GetNoteByIdQuery {
  constructor(private readonly repository: NotesRepository) {}

  async execute(id: string, actor: AuthenticatedUser): Promise<Result<Note, NoteNotFound>> {
    const result = await this.repository.findById(id);
    if (result.isErr()) return err(result.error);
    if (!result.value) return err({ type: "NOTE_NOT_FOUND", noteId: id });
    if (actor.role !== "admin" && result.value.createdBy !== actor.sub) {
      return err({ type: "NOTE_NOT_FOUND", noteId: id });
    }
    return ok(result.value);
  }
}
