import { beforeEach, describe, expect, it, vi } from "vitest";
import { err, ok } from "neverthrow";
import { Readable } from "node:stream";
import { UploadGridFsFileCommand } from "./upload-gridfs-file.command";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FilesRepository } from "../../infrastructure/files.repository";
import { FileEntity } from "../../domain/entities/file.entity";

const ACTOR = { sub: "user-1", email: "user@example.com", role: "user" } as const;
const FILE: FileEntity = {
  id: "file-1",
  key: "general/user-1/file.pdf",
  fileName: "file.pdf",
  contentType: "application/pdf",
  fileSize: 3,
  bucket: "uploads",
  parentType: "general",
  uploadedBy: "user-1",
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UploadGridFsFileCommand", () => {
  let command: UploadGridFsFileCommand;
  let storage: StorageService;
  let filesRepo: FilesRepository;

  beforeEach(() => {
    storage = {
      usesDirectTransfer: vi.fn().mockReturnValue(false),
      upload: vi.fn(),
      getMetadata: vi.fn(),
    } as unknown as StorageService;
    filesRepo = {
      findByKey: vi.fn(),
      claimPendingUpload: vi.fn(),
      updateById: vi.fn(),
    } as unknown as FilesRepository;
    command = new UploadGridFsFileCommand(storage, filesRepo);
  });

  it("uploads an owned pending file and marks it uploaded", async () => {
    vi.mocked(filesRepo.findByKey).mockResolvedValue(FILE);
    vi.mocked(filesRepo.claimPendingUpload).mockResolvedValue(ok({ ...FILE, status: "uploading" }));
    vi.mocked(storage.upload).mockResolvedValue(
      ok({ key: FILE.key, url: "gridfs://uploads/file.pdf" }),
    );
    vi.mocked(storage.getMetadata).mockResolvedValue(
      ok({ size: 3, contentType: FILE.contentType }),
    );
    vi.mocked(filesRepo.updateById).mockResolvedValue(ok({ ...FILE, status: "uploaded" }));

    const result = await command.execute(FILE.key, Readable.from("pdf"), ACTOR);

    expect(result.isOk()).toBe(true);
    expect(filesRepo.claimPendingUpload).toHaveBeenCalledWith(FILE.key);
    expect(filesRepo.updateById).toHaveBeenCalledWith(FILE.id, { status: "uploaded" });
  });

  it("rejects a concurrent upload without writing another GridFS object", async () => {
    vi.mocked(filesRepo.findByKey).mockResolvedValue({ ...FILE, status: "uploading" });

    const result = await command.execute(FILE.key, Readable.from("pdf"), ACTOR);

    expect(result.isErr() && result.error.type).toBe("UPLOAD_IN_PROGRESS");
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it("releases the claim when GridFS upload fails", async () => {
    vi.mocked(filesRepo.findByKey).mockResolvedValue(FILE);
    vi.mocked(filesRepo.claimPendingUpload).mockResolvedValue(ok({ ...FILE, status: "uploading" }));
    vi.mocked(storage.upload).mockResolvedValue(err({ code: "UPLOAD_FAILED", message: "" }));
    vi.mocked(filesRepo.updateById).mockResolvedValue(ok(FILE));

    const result = await command.execute(FILE.key, Readable.from("pdf"), ACTOR);

    expect(result.isErr() && result.error.type).toBe("UPLOAD_FAILED");
    expect(filesRepo.updateById).toHaveBeenCalledWith(FILE.id, { status: "pending" });
  });
});
