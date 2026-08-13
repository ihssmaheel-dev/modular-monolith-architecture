import { beforeEach, describe, expect, it, vi } from "vitest";
import { RealtimeService } from "../../../../infrastructure/realtime/realtime.service";
import {
  NoteCreatedEvent,
  NoteDeletedEvent,
  NoteUpdatedEvent,
} from "../../domain/events/note.events";
import { NotesRealtimeListener } from "./notes-realtime.listener";

describe("NotesRealtimeListener", () => {
  let listener: NotesRealtimeListener;
  let realtime: RealtimeService;

  beforeEach(() => {
    realtime = { sendToUser: vi.fn() } as unknown as RealtimeService;
    listener = new NotesRealtimeListener(realtime);
  });

  it("publishes created notes to the owning tenant user", () => {
    const event = new NoteCreatedEvent("note-1", "user-1", "Title", "Content", "tenant-1");

    listener.handleNoteCreated(event);

    expect(realtime.sendToUser).toHaveBeenCalledWith("user-1", "note.created", event, "tenant-1");
  });

  it("publishes updated notes to the owning tenant user", () => {
    const event = new NoteUpdatedEvent("note-1", "user-1", "Title", undefined, "tenant-1");

    listener.handleNoteUpdated(event);

    expect(realtime.sendToUser).toHaveBeenCalledWith("user-1", "note.updated", event, "tenant-1");
  });

  it("publishes deleted notes to the owning tenant user", () => {
    const event = new NoteDeletedEvent("note-1", "user-1", "tenant-1");

    listener.handleNoteDeleted(event);

    expect(realtime.sendToUser).toHaveBeenCalledWith("user-1", "note.deleted", event, "tenant-1");
  });
});
