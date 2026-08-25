import { NoteResponseDto } from "@repo/contracts";
import { Note } from "../domain/entities/note.entity";

export function toNoteResponse(note: Note): NoteResponseDto {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}
