import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { RealtimeService } from "../../../../infrastructure/realtime/realtime.service";
import { NoteCreatedEvent, NoteUpdatedEvent, NoteDeletedEvent } from "../../domain/events/note.events";

@Injectable()
export class NotesRealtimeListener {
  constructor(private readonly realtimeService: RealtimeService) {}

  @OnEvent("note.created")
  handleNoteCreated(event: NoteCreatedEvent) {
    this.realtimeService.broadcast("note.created", event);
  }

  @OnEvent("note.updated")
  handleNoteUpdated(event: NoteUpdatedEvent) {
    this.realtimeService.broadcast("note.updated", event);
  }

  @OnEvent("note.deleted")
  handleNoteDeleted(event: NoteDeletedEvent) {
    this.realtimeService.broadcast("note.deleted", event);
  }
}
