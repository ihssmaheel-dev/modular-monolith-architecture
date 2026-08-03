import { describe, it, expect } from "vitest";
import { Note } from "./note.entity";

describe("Note Entity", () => {
  it("should create a Note instance from persistence data", () => {
    // Arrange
    const data = {
      id: "note-123",
      title: "My Title",
      content: "My Content",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    // Act
    const note = Note.fromPersistence(data);

    // Assert
    expect(note).toBeInstanceOf(Note);
    expect(note.id).toBe("note-123");
    expect(note.title).toBe("My Title");
    expect(note.content).toBe("My Content");
    expect(note.createdAt).toEqual(new Date("2024-01-01"));
    expect(note.updatedAt).toEqual(new Date("2024-01-01"));
  });

  it("should update title and content when update is called", () => {
    // Arrange
    const note = Note.fromPersistence({
      id: "note-123",
      title: "Old Title",
      content: "Old Content",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act
    note.update({ title: "New Title", content: "New Content" });

    // Assert
    expect(note.title).toBe("New Title");
    expect(note.content).toBe("New Content");
  });

  it("should ignore undefined values on update", () => {
    // Arrange
    const note = Note.fromPersistence({
      id: "note-123",
      title: "Old Title",
      content: "Old Content",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act
    note.update({ title: undefined, content: undefined });

    // Assert
    expect(note.title).toBe("Old Title");
    expect(note.content).toBe("Old Content");
  });
});
