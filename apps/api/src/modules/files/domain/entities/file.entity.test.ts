import { describe, it, expect } from "vitest";
import { FileEntity } from "./file.entity";

describe("FileEntity", () => {
  it("should have correct shape", () => {
    const file: FileEntity = {
      id: "file-123",
      key: "note/parent-1/user-1/abc-file.pdf",
      fileName: "file.pdf",
      contentType: "application/pdf",
      fileSize: 1024,
      bucket: "uploads",
      parentId: "parent-1",
      parentType: "note",
      uploadedBy: "user-1",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(file.id).toBe("file-123");
    expect(file.key).toBe("note/parent-1/user-1/abc-file.pdf");
    expect(file.fileName).toBe("file.pdf");
    expect(file.contentType).toBe("application/pdf");
    expect(file.fileSize).toBe(1024);
    expect(file.bucket).toBe("uploads");
    expect(file.parentType).toBe("note");
    expect(file.status).toBe("pending");
  });

  it("should allow optional parentId", () => {
    const file: FileEntity = {
      id: "file-456",
      key: "general/user-2/def-image.png",
      fileName: "image.png",
      contentType: "image/png",
      fileSize: 2048,
      bucket: "uploads",
      parentType: "general",
      uploadedBy: "user-2",
      status: "uploaded",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(file.parentId).toBeUndefined();
    expect(file.parentType).toBe("general");
  });

  it("should support all parentType values", () => {
    const parentTypes: FileEntity["parentType"][] = ["note", "user", "general"];

    for (const parentType of parentTypes) {
      const file: FileEntity = {
        id: "file-789",
        key: "test",
        fileName: "test.txt",
        contentType: "text/plain",
        fileSize: 0,
        bucket: "uploads",
        parentType,
        uploadedBy: "user-1",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(file.parentType).toBe(parentType);
    }
  });

  it("should support all status values", () => {
    const statuses: FileEntity["status"][] = ["pending", "uploaded", "failed"];

    for (const status of statuses) {
      const file: FileEntity = {
        id: "file-abc",
        key: "test",
        fileName: "test.txt",
        contentType: "text/plain",
        fileSize: 0,
        bucket: "uploads",
        parentType: "general",
        uploadedBy: "user-1",
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(file.status).toBe(status);
    }
  });
});
