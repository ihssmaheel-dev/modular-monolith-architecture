import { describe, it, expect, vi, beforeEach } from "vitest";
import { StorageService } from "./storage.service";

vi.mock("../../config/env", () => ({
  env: {
    NODE_ENV: "test",
    REDIS_URL: "redis://localhost:6379",
    STORAGE_DRIVER: "gridfs",
    S3_ENDPOINT: "http://localhost:9000",
    S3_REGION: "us-east-1",
    S3_BUCKET: "test-bucket",
    S3_ACCESS_KEY_ID: "minioadmin",
    S3_SECRET_ACCESS_KEY: "minioadmin",
    S3_FORCE_PATH_STYLE: true,
    MONGODB_URI: "mongodb://localhost:27017/test",
  },
}));

vi.mock("./drivers/gridfs.driver", () => {
  return {
    GridFsDriver: class {
      upload = vi.fn().mockResolvedValue({ url: "test", key: "test" });
      delete = vi.fn().mockResolvedValue(undefined);
      getPresignedDownloadUrl = vi.fn().mockResolvedValue("http://dl");
      getPresignedUploadUrl = vi.fn().mockResolvedValue("http://ul");
    },
  };
});

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockLogger = { info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() } as any;
    mockLogger.child = () => mockLogger;

    service = new StorageService(
      mockLogger,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { db: {} } as any,
    );
  });

  it("should upload file successfully", async () => {
    const result = await service.upload("file.txt", Buffer.from("test"), "text/plain");
    expect(result.isOk()).toBe(true);
  });

  it("should delete file successfully", async () => {
    const result = await service.delete("file.txt");
    expect(result.isOk()).toBe(true);
  });

  it("should get presigned download url", async () => {
    const result = await service.getPresignedDownloadUrl("file.txt");
    expect(result.isOk()).toBe(true);
  });

  it("should get presigned upload url", async () => {
    const result = await service.getPresignedUploadUrl("file.txt", "text/plain");
    expect(result.isOk()).toBe(true);
  });
});
