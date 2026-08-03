import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateNoteCommand } from "./create-note.command";
import { NotesRepository } from "../../infrastructure/notes.repository";
import { Note } from "../../domain/entities/note.entity";
import { ok } from "neverthrow";

describe("CreateNoteCommand", () => {
  let command: CreateNoteCommand;
  let repository: NotesRepository;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
    } as unknown as NotesRepository;
    
    command = new CreateNoteCommand(repository);
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
    const result = await command.execute({ title: "My Note", content: "Content" });

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(note);
    }
    expect(repository.create).toHaveBeenCalledWith({ title: "My Note", content: "Content" });
  });

});
