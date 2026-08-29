import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { z } from "zod";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CreateNoteSchema } from "@repo/contracts";
import { Note } from "../../domain/entities/note.entity";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { NoteCreatedEvent } from "../../domain/events/note.events";
import type { AuthenticatedUser } from "@repo/contracts";
import { OutboxService } from "../../../../infrastructure/outbox/outbox.service";

@Injectable()
export class CreateNoteCommand {
  constructor(
    private readonly repository: NotesRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly outbox?: OutboxService,
  ) {}

  async execute(
    data: z.infer<typeof CreateNoteSchema>,
    actor: AuthenticatedUser,
  ): Promise<Result<Note, Error>> {
    const result = await this.repository.create({
      title: data.title,
      content: data.content,
      createdBy: actor.sub,
    });

    if (result.isOk()) {
      const event = new NoteCreatedEvent(
          result.value.id,
          actor.sub,
          result.value.title,
          result.value.content,
          result.value.tenantId,
        );
      if (this.outbox) await this.outbox.dispatch("note.created", event);
      else this.eventEmitter.emit("note.created", event);
      this.eventEmitter.emit("database.mutated", {
        collectionName: "notes",
        documentId: result.value.id,
        action: "CREATE",
        actorId: actor.sub,
        tenantId: result.value.tenantId,
        before: null,
        after: { id: result.value.id, title: result.value.title },
      });
    }

    return result;
  }
}
