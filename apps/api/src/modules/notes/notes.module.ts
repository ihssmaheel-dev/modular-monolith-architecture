import { Module } from "@nestjs/common";
import { NotesRepository } from "./infrastructure/notes.repository";
import { CreateNoteCommand } from "./application/commands/create-note.command";
import { UpdateNoteCommand } from "./application/commands/update-note.command";
import { DeleteNoteCommand } from "./application/commands/delete-note.command";
import { GetNotesQuery } from "./application/queries/get-notes.query";
import { GetNoteByIdQuery } from "./application/queries/get-note-by-id.query";
import { NotesRealtimeListener } from "./application/listeners/notes-realtime.listener";
import { NotesController } from "./presentation/notes.controller";

@Module({
  controllers: [NotesController],
  providers: [
    NotesRepository,
    CreateNoteCommand,
    UpdateNoteCommand,
    DeleteNoteCommand,
    GetNotesQuery,
    GetNoteByIdQuery,
    NotesRealtimeListener,
  ],
  exports: [NotesRepository],
})
export class NotesModule {}
