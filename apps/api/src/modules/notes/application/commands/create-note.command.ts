import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { z } from "zod";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CreateNoteSchema } from "@repo/shared";
import { Note } from "../../domain/entities/note.entity";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { NoteCreatedEvent } from "../../domain/events/note.events";

@Injectable()
export class CreateNoteCommand {
  constructor(
    private readonly repository: NotesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: z.infer<typeof CreateNoteSchema>): Promise<Result<Note, Error>> {
    const result = await this.repository.create({
      title: data.title,
      content: data.content,
    });
    
    if (result.isOk()) {
      this.eventEmitter.emit("note.created", new NoteCreatedEvent(
        result.value.id,
        result.value.title,
        result.value.content,
      ));
    }

    return result;
  }
}
