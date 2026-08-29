import { Module, type OnModuleInit } from "@nestjs/common";
import { AuthorizationService } from "../../infrastructure/authorization";
import { notePolicies } from "./application/notes.policies";
import { NotesRepository } from "./infrastructure/notes.repository";
import { CreateNoteCommand } from "./application/commands/create-note.command";
import { UpdateNoteCommand } from "./application/commands/update-note.command";
import { DeleteNoteCommand } from "./application/commands/delete-note.command";
import { GetNotesQuery } from "./application/queries/get-notes.query";
import { GetNoteByIdQuery } from "./application/queries/get-note-by-id.query";
import { NotesRealtimeListener } from "./application/listeners/notes-realtime.listener";
import { NotesController } from "./presentation/notes.controller";
import { OutboxModule } from "../../infrastructure/outbox/outbox.module";

@Module({
  imports: [OutboxModule],
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
export class NotesModule implements OnModuleInit {
  constructor(private readonly authService: AuthorizationService) {}

  onModuleInit(): void {
    this.authService.registerPolicies(notePolicies);
  }
}
