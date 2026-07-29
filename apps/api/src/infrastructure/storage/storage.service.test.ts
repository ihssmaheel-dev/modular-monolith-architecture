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

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StorageService(
      { child: () => ({ info: vi.fn(), debug: vi.fn(), error: vi.fn() }) } as any,
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
