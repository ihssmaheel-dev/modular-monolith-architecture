import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateNoteCommand } from "./create-note.command";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Note } from "../../domain/entities/note.entity";
import { ok } from "neverthrow";

const ACTOR = { sub: "admin-1", email: "admin@example.com", role: "admin" } as const;

describe("CreateNoteCommand", () => {
  let command: CreateNoteCommand;
  let repository: NotesRepository;
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
    } as unknown as NotesRepository;

    eventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2;

    command = new CreateNoteCommand(repository, eventEmitter);
  });

  it("should create a note and return ok", async () => {
    // Arrange
    const note = Note.fromPersistence({
      id: "note-123",
      title: "My Note",
      content: "Content",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(repository.create).mockResolvedValue(ok(note));

    // Act
    const result = await command.execute({ title: "My Note", content: "Content" }, ACTOR);

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(note);
    }
    expect(repository.create).toHaveBeenCalledWith({
      title: "My Note",
      content: "Content",
      createdBy: ACTOR.sub,
    });
  });
});
