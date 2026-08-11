import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequestUploadCommand } from "./request-upload.command";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FilesRepository } from "../../infrastructure/files.repository";
import { FileEntity } from "../../domain/entities/file.entity";
import { ok, err } from "neverthrow";

vi.mock("../../../../config/env", () => ({
  env: { S3_BUCKET: "test-bucket" },
}));

describe("RequestUploadCommand", () => {
  let command: RequestUploadCommand;
  let storage: StorageService;
  let filesRepo: FilesRepository;

  beforeEach(() => {
    storage = {
      getPresignedUploadUrl: vi.fn(),
    } as unknown as StorageService;

    filesRepo = {
      create: vi.fn(),
    } as unknown as FilesRepository;

    command = new RequestUploadCommand(storage, filesRepo);
  });

  it("should return PRESIGN_FAILED when presign fails", async () => {
    vi.mocked(storage.getPresignedUploadUrl).mockResolvedValue(
      err({ code: "PRESIGN_ERROR", message: "S3 unavailable" } as never),
    );

    const result = await command.execute(
      {
        fileName: "test.pdf",
        contentType: "application/pdf",
        fileSize: 1024,
        parentType: "note",
        parentId: "note-1",
      },
      "user-1",
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("PRESIGN_FAILED");
    }
  });

  it("should return UPLOAD_FAILED when repo create fails", async () => {
    vi.mocked(storage.getPresignedUploadUrl).mockResolvedValue(ok("https://s3.example.com/upload"));
    vi.mocked(filesRepo.create).mockResolvedValue(err({ code: "DB_ERROR" } as never));

    const result = await command.execute(
      {
        fileName: "test.pdf",
        contentType: "application/pdf",
        fileSize: 1024,
        parentType: "note",
        parentId: "note-1",
      },
      "user-1",
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("UPLOAD_FAILED");
    }
  });

  it("should return upload URL on success", async () => {
    vi.mocked(storage.getPresignedUploadUrl).mockResolvedValue(ok("https://s3.example.com/upload"));

    const file: FileEntity = {
      id: "file-1",
      key: "note/note-1/user-1/abc-test.pdf",
      fileName: "test.pdf",
      contentType: "application/pdf",
      fileSize: 1024,
      bucket: "test-bucket",
      parentId: "note-1",
      parentType: "note",
      uploadedBy: "user-1",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(filesRepo.create).mockResolvedValue(ok(file));

    const result = await command.execute(
      {
        fileName: "test.pdf",
        contentType: "application/pdf",
        fileSize: 1024,
        parentType: "note",
        parentId: "note-1",
      },
      "user-1",
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.uploadUrl).toBe("https://s3.example.com/upload");
      expect(result.value.fileKey).toContain("note/note-1/user-1/");
      expect(Number.isNaN(Date.parse(result.value.expiresAt))).toBe(false);
    }
  });

  it("should build key with general prefix when parentId is absent", async () => {
    vi.mocked(storage.getPresignedUploadUrl).mockResolvedValue(ok("https://s3.example.com/upload"));

    const file: FileEntity = {
      id: "file-2",
      key: "general/user-1/abc-file.txt",
      fileName: "file.txt",
      contentType: "text/plain",
      fileSize: 100,
      bucket: "test-bucket",
      parentType: "general",
      uploadedBy: "user-1",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(filesRepo.create).mockResolvedValue(ok(file));

    const result = await command.execute(
      {
        fileName: "file.txt",
        contentType: "text/plain",
        fileSize: 100,
        parentType: "general",
      },
      "user-1",
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.fileKey).toMatch(/^general\/user-1\//);
    }
  });

  it("should sanitize file name in key", async () => {
    vi.mocked(storage.getPresignedUploadUrl).mockResolvedValue(ok("https://s3.example.com/upload"));

    const file: FileEntity = {
      id: "file-3",
      key: "general/user-1/abc-my_file.pdf",
      fileName: "my file.pdf",
      contentType: "application/pdf",
      fileSize: 500,
      bucket: "test-bucket",
      parentType: "general",
      uploadedBy: "user-1",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(filesRepo.create).mockResolvedValue(ok(file));

    const result = await command.execute(
      {
        fileName: "my file.pdf",
        contentType: "application/pdf",
        fileSize: 500,
        parentType: "general",
      },
      "user-1",
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.fileKey).not.toContain(" ");
    }
  });
});
