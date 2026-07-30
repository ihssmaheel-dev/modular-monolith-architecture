import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { Note } from "../../domain/entities/note.entity";
import { NoteNotFound } from "../../domain/errors/note.errors";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { GetNoteByIdQuery } from "../queries/get-note-by-id.query";

@Injectable()
export class UpdateNoteCommand {
  constructor(
    private readonly repository: NotesRepository,
    private readonly getNoteById: GetNoteByIdQuery,
  ) {}

  async execute(id: string, data: { title?: string; content?: string }): Promise<Result<Note, NoteNotFound>> {
    const existing = await this.getNoteById.execute(id);
    if (existing.isErr()) return err(existing.error);

    existing.value.update(data);
    const saved = await this.repository.updateById(existing.value.id, {
      title: existing.value.title,
      content: existing.value.content,
    });
    
    if (saved.isErr()) return err({ type: "NOTE_NOT_FOUND", noteId: id });
    if (!saved.value) return err({ type: "NOTE_NOT_FOUND", noteId: id });

    return ok(saved.value);
  }
}
