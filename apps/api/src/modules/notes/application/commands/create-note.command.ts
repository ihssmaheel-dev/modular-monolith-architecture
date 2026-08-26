import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { z } from "zod";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CreateNoteSchema } from "@repo/contracts";
import { Note } from "../../domain/entities/note.entity";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { NoteCreatedEvent } from "../../domain/events/note.events";
import type { AuthenticatedUser } from "@repo/contracts";

@Injectable()
export class CreateNoteCommand {
  constructor(
    private readonly repository: NotesRepository,
    private readonly eventEmitter: EventEmitter2,
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
      this.eventEmitter.emit(
        "note.created",
        new NoteCreatedEvent(
          result.value.id,
          actor.sub,
          result.value.title,
          result.value.content,
          result.value.tenantId,
        ),
      );
    }

    return result;
  }
}
