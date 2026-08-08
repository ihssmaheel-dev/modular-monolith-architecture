import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmUploadCommand } from "./confirm-upload.command";
import { FilesRepository } from "../../infrastructure/files.repository";
import { FileEntity } from "../../domain/entities/file.entity";
import { ok, err } from "neverthrow";

describe("ConfirmUploadCommand", () => {
  let command: ConfirmUploadCommand;
  let filesRepo: FilesRepository;

  beforeEach(() => {
    filesRepo = {
      findByKey: vi.fn(),
      updateById: vi.fn(),
    } as unknown as FilesRepository;

    command = new ConfirmUploadCommand(filesRepo);
  });

  it("should return FILE_NOT_FOUND when file does not exist", async () => {
    vi.mocked(filesRepo.findByKey).mockResolvedValue(null);

    const result = await command.execute("nonexistent-key");

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("FILE_NOT_FOUND");
    }
  });

  it("should return UPLOAD_FAILED when update fails", async () => {
    const file: FileEntity = {
      id: "file-1",
      key: "note/note-1/user-1/abc-test.pdf",
      fileName: "test.pdf",
      contentType: "application/pdf",
      fileSize: 1024,
      bucket: "uploads",
      parentId: "note-1",
      parentType: "note",
      uploadedBy: "user-1",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(filesRepo.findByKey).mockResolvedValue(file);
    vi.mocked(filesRepo.updateById).mockResolvedValue(err({ type: "CONFLICT" }));

    const result = await command.execute(file.key);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("UPLOAD_FAILED");
    }
  });

  it("should update status to uploaded on success", async () => {
    const file: FileEntity = {
      id: "file-1",
      key: "note/note-1/user-1/abc-test.pdf",
      fileName: "test.pdf",
      contentType: "application/pdf",
      fileSize: 1024,
      bucket: "uploads",
      parentId: "note-1",
      parentType: "note",
      uploadedBy: "user-1",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(filesRepo.findByKey).mockResolvedValue(file);

    const updatedFile: FileEntity = { ...file, status: "uploaded" };
    vi.mocked(filesRepo.updateById).mockResolvedValue(ok(updatedFile));

    const result = await command.execute(file.key);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.status).toBe("uploaded");
    }
    expect(filesRepo.updateById).toHaveBeenCalledWith(file.id, { status: "uploaded" });
  });
});
