import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ok, err, Result } from "neverthrow";
import { z } from "zod";
import { UpdateNoteSchema } from "@repo/shared";
import { Note } from "../../domain/entities/note.entity";
import { NoteNotFound } from "../../domain/errors/note.errors";
import { NoteUpdatedEvent } from "../../domain/events/note.events";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { GetNoteByIdQuery } from "../queries/get-note-by-id.query";
import type { AuthenticatedUser } from "@repo/shared";

@Injectable()
export class UpdateNoteCommand {
  constructor(
    private readonly repository: NotesRepository,
    private readonly getNoteById: GetNoteByIdQuery,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    data: z.infer<typeof UpdateNoteSchema>,
    actor: AuthenticatedUser,
  ): Promise<Result<Note, NoteNotFound>> {
    const existing = await this.getNoteById.execute(id, actor);
    if (existing.isErr()) return err(existing.error);

    existing.value.update(data);
    const saved = await this.repository.updateById(existing.value.id, {
      title: existing.value.title,
      content: existing.value.content,
    });

    if (saved.isErr()) return err({ type: "NOTE_NOT_FOUND", noteId: id });
    if (!saved.value) return err({ type: "NOTE_NOT_FOUND", noteId: id });

    this.eventEmitter.emit(
      "note.updated",
      new NoteUpdatedEvent(
        saved.value.id,
        saved.value.createdBy ?? actor.sub,
        data.title,
        data.content,
        saved.value.tenantId,
      ),
    );

    return ok(saved.value);
  }
}
