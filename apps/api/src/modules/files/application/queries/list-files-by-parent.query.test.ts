import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListFilesByParentQuery } from "./list-files-by-parent.query";
import { FilesRepository } from "../../infrastructure/files.repository";
import { FileEntity } from "../../domain/entities/file.entity";
import { ok } from "neverthrow";

describe("ListFilesByParentQuery", () => {
  let query: ListFilesByParentQuery;
  let filesRepo: FilesRepository;

  const mockFiles: FileEntity[] = [
    {
      id: "file-1",
      key: "note/note-1/user-1/abc-test.pdf",
      fileName: "test.pdf",
      contentType: "application/pdf",
      fileSize: 1024,
      bucket: "uploads",
      parentId: "note-1",
      parentType: "note",
      uploadedBy: "user-1",
      status: "uploaded",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "file-2",
      key: "note/note-1/user-1/def-doc.pdf",
      fileName: "doc.pdf",
      contentType: "application/pdf",
      fileSize: 2048,
      bucket: "uploads",
      parentId: "note-1",
      parentType: "note",
      uploadedBy: "user-1",
      status: "uploaded",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    filesRepo = {
      find: vi.fn(),
      findByParent: vi.fn(),
    } as unknown as FilesRepository;

    query = new ListFilesByParentQuery(filesRepo);
  });

  it("should return files by parentId", async () => {
    vi.mocked(filesRepo.findByParent).mockResolvedValue(mockFiles);

    const result = await query.execute("note", "note-1");

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toEqual(mockFiles);
      expect(result.value.total).toBe(2);
    }
    expect(filesRepo.findByParent).toHaveBeenCalledWith("note", "note-1");
    expect(filesRepo.find).not.toHaveBeenCalled();
  });

  it("should return all files by parentType when parentId is absent", async () => {
    vi.mocked(filesRepo.find).mockResolvedValue(ok(mockFiles));

    const result = await query.execute("note");

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toEqual(mockFiles);
      expect(result.value.total).toBe(2);
    }
    expect(filesRepo.find).toHaveBeenCalledWith({ parentType: "note" });
    expect(filesRepo.findByParent).not.toHaveBeenCalled();
  });

  it("should return empty list when no files exist", async () => {
    vi.mocked(filesRepo.findByParent).mockResolvedValue([]);

    const result = await query.execute("note", "note-999");

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.items).toEqual([]);
      expect(result.value.total).toBe(0);
    }
  });
});
