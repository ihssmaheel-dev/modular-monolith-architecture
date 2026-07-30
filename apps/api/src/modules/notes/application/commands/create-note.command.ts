import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { Note } from "../../domain/entities/note.entity";
import { NotesRepository } from "../../infrastructure/notes.repository";

@Injectable()
export class CreateNoteCommand {
  constructor(private readonly repository: NotesRepository) {}

  async execute(data: { title: string; content: string }): Promise<Result<Note, never>> {
    const result = await this.repository.create({
      title: data.title,
      content: data.content,
    });
    
    return result;
  }
}
