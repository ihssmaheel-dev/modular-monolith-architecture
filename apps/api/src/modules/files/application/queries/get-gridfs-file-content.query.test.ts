import { beforeEach, describe, expect, it, vi } from "vitest";
import { ok } from "neverthrow";
import { Readable } from "node:stream";
import { GetGridFsFileContentQuery } from "./get-gridfs-file-content.query";
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
  status: "uploaded",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GetGridFsFileContentQuery", () => {
  let query: GetGridFsFileContentQuery;
  let storage: StorageService;
  let filesRepo: FilesRepository;

  beforeEach(() => {
    storage = {
      usesDirectTransfer: vi.fn().mockReturnValue(false),
      getDownloadStream: vi.fn(),
    } as unknown as StorageService;
    filesRepo = { findById: vi.fn() } as unknown as FilesRepository;
    query = new GetGridFsFileContentQuery(storage, filesRepo);
  });

  it("returns a stream only for an uploaded file owned by the actor", async () => {
    const stream = Readable.from("pdf");
    vi.mocked(filesRepo.findById).mockResolvedValue(ok(FILE));
    vi.mocked(storage.getDownloadStream).mockResolvedValue(ok(stream));

    const result = await query.execute(FILE.id, ACTOR);

    expect(result.isOk()).toBe(true);
    expect(storage.getDownloadStream).toHaveBeenCalledWith(FILE.key);
  });

  it("does not expose a pending file", async () => {
    vi.mocked(filesRepo.findById).mockResolvedValue(ok({ ...FILE, status: "pending" }));

    const result = await query.execute(FILE.id, ACTOR);

    expect(result.isErr() && result.error.type).toBe("FILE_NOT_FOUND");
    expect(storage.getDownloadStream).not.toHaveBeenCalled();
  });

  it("does not expose GridFS content when direct storage is configured", async () => {
    vi.mocked(storage.usesDirectTransfer).mockReturnValue(true);

    const result = await query.execute(FILE.id, ACTOR);

    expect(result.isErr() && result.error.type).toBe("PROXY_TRANSFER_UNAVAILABLE");
  });
});
