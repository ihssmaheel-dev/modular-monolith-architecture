import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { RealtimeService } from "../../../../infrastructure/realtime/realtime.service";
import {
  NoteCreatedEvent,
  NoteUpdatedEvent,
  NoteDeletedEvent,
} from "../../domain/events/note.events";

@Injectable()
export class NotesRealtimeListener {
  constructor(private readonly realtimeService: RealtimeService) {}

  @OnEvent("note.created")
  handleNoteCreated(event: NoteCreatedEvent) {
    this.realtimeService.sendToUser(event.userId, "note.created", event);
  }

  @OnEvent("note.updated")
  handleNoteUpdated(event: NoteUpdatedEvent) {
    this.realtimeService.sendToUser(event.userId, "note.updated", event);
  }

  @OnEvent("note.deleted")
  handleNoteDeleted(event: NoteDeletedEvent) {
    this.realtimeService.sendToUser(event.userId, "note.deleted", event);
  }
}
