import { describe, expect, it, vi } from "vitest";
import { ok } from "neverthrow";
import { FileScanWorker } from "./file-scan.worker";
import type { FilesRepository } from "../../infrastructure/files.repository";
import type { FileScannerService } from "../../../../infrastructure/storage/file-scanner.service";
import type { DatabaseService, TenantContextService } from "../../../../infrastructure/database";
import type { PinoLoggerService } from "../../../../infrastructure/logger/logger.service";

describe("FileScanWorker", () => {
  it("promotes an integrity-checked quarantine record", async () => {
    const files = {
      findUploadingFiles: vi
        .fn()
        .mockResolvedValue([{ id: "file-1", key: "key", fileSize: 10, contentType: "text/plain" }]),
      updateById: vi.fn().mockResolvedValue(ok({})),
    } as unknown as FilesRepository;
    const scanner = {
      scan: vi.fn().mockResolvedValue({ result: "clean" }),
    } as unknown as FileScannerService;
    const database = {
      runTransaction: vi.fn(async (callback: () => Promise<unknown>) => callback()),
    } as unknown as DatabaseService;
    const tenant = {
      runSystem: vi.fn(async (_context, callback: () => Promise<void>) => callback()),
    } as unknown as TenantContextService;
    const logger = {
      child: vi.fn().mockReturnThis(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as PinoLoggerService;
    const worker = new FileScanWorker(files, scanner, database, tenant, logger);

    await worker.scanQuarantinedFiles();

    expect(files.updateById).toHaveBeenCalledWith("file-1", { status: "uploaded" });
  });
});
