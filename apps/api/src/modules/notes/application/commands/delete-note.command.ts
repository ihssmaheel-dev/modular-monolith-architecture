import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { NoteNotFound } from "../../domain/errors/note.errors";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { GetNoteByIdQuery } from "../queries/get-note-by-id.query";

@Injectable()
export class DeleteNoteCommand {
  constructor(
    private readonly repository: NotesRepository,
    private readonly getNoteById: GetNoteByIdQuery,
  ) {}

  async execute(id: string): Promise<Result<void, NoteNotFound>> {
    const existing = await this.getNoteById.execute(id);
    if (existing.isErr()) return err(existing.error);

    const deleted = await this.repository.deleteById(id);
    if (deleted.isErr()) return err({ type: "NOTE_NOT_FOUND", noteId: id });
    if (!deleted.value) return err({ type: "NOTE_NOT_FOUND", noteId: id });

    return ok(undefined);
  }
}
