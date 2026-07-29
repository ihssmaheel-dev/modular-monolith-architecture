import { describe, it, expect, vi, beforeEach } from "vitest";
import { StorageService } from "./storage.service";

const mockSend = vi.fn();
const mockGetSignedUrl = vi.fn();

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(() => ({ send: mockSend })),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  HeadObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

vi.mock("../../config/env", () => ({
  env: {
    NODE_ENV: "test",
    REDIS_URL: "redis://localhost:6379",
    S3_ENDPOINT: "http://localhost:9000",
    S3_REGION: "us-east-1",
    S3_BUCKET: "test-bucket",
    S3_ACCESS_KEY_ID: "minioadmin",
    S3_SECRET_ACCESS_KEY: "minioadmin",
    S3_FORCE_PATH_STYLE: true,
  },
}));

describe("StorageService", () => {
  let service: StorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StorageService({
      child: () => ({ info: vi.fn(), debug: vi.fn(), error: vi.fn() }),
    } as any);
  });

  it("should upload file successfully", async () => {
    mockSend.mockResolvedValue({});
    const result = await service.upload("file.txt", Buffer.from("test"), "text/plain");
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.key).toBe("file.txt");
    }
  });

  it("should return error on upload failure", async () => {
    mockSend.mockRejectedValue(new Error("Upload failed"));
    const result = await service.upload("file.txt", Buffer.from("test"), "text/plain");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.value.code).toBe("UPLOAD_FAILED");
    }
  });

  it("should generate presigned upload URL", async () => {
    mockGetSignedUrl.mockResolvedValue("https://s3.example.com/upload?signed=1");
    const result = await service.getPresignedUploadUrl("file.txt", "text/plain");
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toContain("https://");
    }
  });

  it("should delete file successfully", async () => {
    mockSend.mockResolvedValue({});
    const result = await service.delete("file.txt");
    expect(result.isOk()).toBe(true);
  });

  it("should return error on delete failure", async () => {
    mockSend.mockRejectedValue(new Error("Delete failed"));
    const result = await service.delete("file.txt");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.value.code).toBe("DELETE_FAILED");
    }
  });
});
