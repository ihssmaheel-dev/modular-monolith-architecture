import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileCleanupWorker } from "./file-cleanup.worker";
import type { FilesRepository } from "../../infrastructure/files.repository";
import type { StorageService } from "../../../../infrastructure/storage/storage.service";
import type { MetricsService } from "../../../../infrastructure/metrics/metrics.service";
import type { PinoLoggerService } from "../../../../infrastructure/logger/logger.service";
import type { FileEntity } from "../../domain/entities/file.entity";

describe("FileCleanupWorker", () => {
  let worker: FileCleanupWorker;
  let mockFilesRepo: FilesRepository;
  let mockStorage: StorageService;
  let mockMetrics: MetricsService;
  let mockLogger: PinoLoggerService;

  const STALE_FILE: FileEntity = {
    id: "file-stale-1",
    key: "uploads/stale.png",
    fileName: "stale.png",
    contentType: "image/png",
    fileSize: 1024,
    bucket: "test-bucket",
    parentType: "general",
    uploadedBy: "user-1",
    status: "pending",
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
  };

  beforeEach(() => {
    mockFilesRepo = {
      findPendingFilesBefore: vi.fn().mockResolvedValue([STALE_FILE]),
      deleteById: vi.fn().mockResolvedValue({ isOk: () => true }),
    } as unknown as FilesRepository;

    mockStorage = {
      delete: vi.fn().mockResolvedValue({ isOk: () => true }),
    } as unknown as StorageService;

    mockMetrics = {
      incrementCounter: vi.fn(),
    } as unknown as MetricsService;

    mockLogger = {
      child: vi.fn().mockReturnThis(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as PinoLoggerService;

    const mockTenantContext = {
      run: vi.fn(async (_ctx, fn) => await fn()),
    } as unknown as import("../../../../infrastructure/database").TenantContextService;

    worker = new FileCleanupWorker(
      mockFilesRepo,
      mockStorage,
      mockMetrics,
      mockTenantContext,
      mockLogger,
    );
  });

  it("identifies and purges stale pending files older than cutoff", async () => {
    const result = await worker.cleanupOrphanPendingFiles();

    expect(result.purgedCount).toBe(1);
    expect(result.reclaimedBytes).toBe(1024);
    expect(mockStorage.delete).toHaveBeenCalledWith(STALE_FILE.key);
    expect(mockFilesRepo.deleteById).toHaveBeenCalledWith(STALE_FILE.id);
    expect(mockMetrics.incrementCounter).toHaveBeenCalledWith(
      "file_cleanup_purged_total",
      expect.any(String),
      1,
    );
  });

  it("handles storage deletion errors gracefully without throwing", async () => {
    vi.mocked(mockStorage.delete).mockRejectedValueOnce(new Error("S3 timeout"));

    const result = await worker.cleanupOrphanPendingFiles();

    expect(result.purgedCount).toBe(0);
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
