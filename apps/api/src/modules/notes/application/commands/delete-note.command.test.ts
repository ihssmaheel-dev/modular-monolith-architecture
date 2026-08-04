import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteNoteCommand } from "./delete-note.command";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { GetNoteByIdQuery } from "../queries/get-note-by-id.query";
import { Note } from "../../domain/entities/note.entity";
import { ok, err } from "neverthrow";

describe("DeleteNoteCommand", () => {
  let command: DeleteNoteCommand;
  let repository: NotesRepository;
  let getNoteById: GetNoteByIdQuery;
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    repository = {
      deleteById: vi.fn(),
    } as unknown as NotesRepository;

    getNoteById = {
      execute: vi.fn(),
    } as unknown as GetNoteByIdQuery;

    eventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2;
    
    command = new DeleteNoteCommand(repository, getNoteById, eventEmitter);
  });

  it("should return err NOTE_NOT_FOUND if query returns err", async () => {
    // Arrange
    vi.mocked(getNoteById.execute).mockResolvedValue(err({ type: "NOTE_NOT_FOUND", noteId: "123" }));

    // Act
    const result = await command.execute("123");

    // Assert
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: "NOTE_NOT_FOUND", noteId: "123" });
    }
  });

  it("should delete note and return ok", async () => {
    // Arrange
    const note = Note.fromPersistence({
      id: "123",
      title: "Old Title",
      content: "Old Content",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getNoteById.execute).mockResolvedValue(ok(note));
    vi.mocked(repository.deleteById).mockResolvedValue(ok(true));

    // Act
    const result = await command.execute("123");

    // Assert
    expect(result.isOk()).toBe(true);
    expect(repository.deleteById).toHaveBeenCalledWith("123");
  });

  it("should return err if repository delete fails", async () => {
    // Arrange
    const note = Note.fromPersistence({
      id: "123",
      title: "Old Title",
      content: "Old Content",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getNoteById.execute).mockResolvedValue(ok(note));
    vi.mocked(repository.deleteById).mockResolvedValue(ok(false));

    // Act
    const result = await command.execute("123");

    // Assert
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: "NOTE_NOT_FOUND", noteId: "123" });
    }
  });
});
