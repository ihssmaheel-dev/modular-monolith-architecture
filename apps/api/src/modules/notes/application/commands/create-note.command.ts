import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { z } from "zod";
import { CreateNoteSchema } from "@repo/shared";
import { Note } from "../../domain/entities/note.entity";
import { NotesRepository } from "../../infrastructure/notes.repository";

@Injectable()
export class CreateNoteCommand {
  constructor(private readonly repository: NotesRepository) {}

  async execute(data: z.infer<typeof CreateNoteSchema>): Promise<Result<Note, Error>> {
    const result = await this.repository.create({
      title: data.title,
      content: data.content,
    });
    
    return result;
  }
}
