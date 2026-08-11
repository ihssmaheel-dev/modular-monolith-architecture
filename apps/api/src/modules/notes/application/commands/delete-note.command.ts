import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ok, err, Result } from "neverthrow";
import { NoteNotFound } from "../../domain/errors/note.errors";
import { NoteDeletedEvent } from "../../domain/events/note.events";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { GetNoteByIdQuery } from "../queries/get-note-by-id.query";
import type { AuthenticatedUser } from "@repo/shared";

@Injectable()
export class DeleteNoteCommand {
  constructor(
    private readonly repository: NotesRepository,
    private readonly getNoteById: GetNoteByIdQuery,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, actor: AuthenticatedUser): Promise<Result<void, NoteNotFound>> {
    const existing = await this.getNoteById.execute(id, actor);
    if (existing.isErr()) return err(existing.error);

    const deleted = await this.repository.deleteById(id);
    if (deleted.isErr()) return err({ type: "NOTE_NOT_FOUND", noteId: id });
    if (!deleted.value) return err({ type: "NOTE_NOT_FOUND", noteId: id });

    this.eventEmitter.emit(
      "note.deleted",
      new NoteDeletedEvent(id, existing.value.createdBy ?? actor.sub, existing.value.tenantId),
    );

    return ok(undefined);
  }
}
