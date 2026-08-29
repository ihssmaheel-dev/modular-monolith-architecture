import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ok, err, Result } from "neverthrow";
import { NoteNotFound } from "../../domain/errors/note.errors";
import { NoteDeletedEvent } from "../../domain/events/note.events";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { GetNoteByIdQuery } from "../queries/get-note-by-id.query";
import type { AuthenticatedUser } from "@repo/contracts";
import { OutboxService } from "../../../../infrastructure/outbox/outbox.service";

@Injectable()
export class DeleteNoteCommand {
  constructor(
    private readonly repository: NotesRepository,
    private readonly getNoteById: GetNoteByIdQuery,
    private readonly eventEmitter: EventEmitter2,
    private readonly outbox?: OutboxService,
  ) {}

  async execute(id: string, actor: AuthenticatedUser): Promise<Result<void, NoteNotFound>> {
    const existing = await this.getNoteById.execute(id, actor);
    if (existing.isErr()) return err(existing.error);

    const deleted = await this.repository.deleteById(id);
    if (deleted.isErr()) return err({ type: "NOTE_NOT_FOUND", noteId: id });
    if (!deleted.value) return err({ type: "NOTE_NOT_FOUND", noteId: id });

    const event = new NoteDeletedEvent(
      id,
      existing.value.createdBy ?? actor.sub,
      existing.value.tenantId,
    );
    if (this.outbox) await this.outbox.dispatch("note.deleted", event);
    else this.eventEmitter.emit("note.deleted", event);
    this.eventEmitter.emit("database.mutated", {
      collectionName: "notes",
      documentId: id,
      action: "DELETE",
      actorId: actor.sub,
      tenantId: existing.value.tenantId,
      before: { id, title: existing.value.title },
      after: null,
    });

    return ok(undefined);
  }
}
