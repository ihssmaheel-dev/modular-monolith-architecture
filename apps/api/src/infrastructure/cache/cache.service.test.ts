import { describe, it, expect, vi, beforeEach } from "vitest";
import { CacheService } from "./cache.service";

const mockGet = vi.fn();
const mockSetex = vi.fn();
const mockDel = vi.fn();
const mockKeys = vi.fn();

vi.mock("../../config/env", () => ({
  env: {
    NODE_ENV: "test",
    REDIS_URL: "redis://localhost:6379",
    S3_ENDPOINT: "localhost",
    S3_REGION: "us-east-1",
    S3_BUCKET: "test",
    S3_ACCESS_KEY_ID: "test",
    S3_SECRET_ACCESS_KEY: "test",
    S3_FORCE_PATH_STYLE: true,
  },
}));

describe("CacheService", () => {
  let service: CacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CacheService(
      {
        getClient: () => ({
          get: mockGet,
          setex: mockSetex,
          del: mockDel,
          keys: mockKeys,
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { child: () => ({ info: vi.fn(), debug: vi.fn(), error: vi.fn() }) } as any,
    );
  });

  it("should return null for cache miss", async () => {
    mockGet.mockResolvedValue(null);
    const result = await service.get("key1");
    expect(result).toBeNull();
  });

  it("should return parsed value for cache hit", async () => {
    mockGet.mockResolvedValue(JSON.stringify({ id: 1, name: "test" }));
    const result = await service.get("key1");
    expect(result).toEqual({ id: 1, name: "test" });
  });

  it("should set value with TTL", async () => {
    await service.set("key1", { id: 1 }, 300);
    expect(mockSetex).toHaveBeenCalledWith("key1", 300, '{"id":1}');
  });

  it("should return cached value from getOrSet", async () => {
    mockGet.mockResolvedValue(JSON.stringify({ id: 1 }));
    const fetcher = vi.fn();
    const result = await service.getOrSet("key1", fetcher, 300);
    expect(result).toEqual({ id: 1 });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("should call fetcher on cache miss and store result", async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue("OK");
    const fetcher = vi.fn().mockResolvedValue({ id: 2 });
    const result = await service.getOrSet("key1", fetcher, 300);
    expect(result).toEqual({ id: 2 });
    expect(fetcher).toHaveBeenCalled();
    expect(mockSetex).toHaveBeenCalledWith("key1", 300, '{"id":2}');
  });

  it("should delete key", async () => {
    mockDel.mockResolvedValue(1);
    await service.del("key1");
    expect(mockDel).toHaveBeenCalledWith("key1");
  });

  it("should delete keys by pattern", async () => {
    mockKeys.mockResolvedValue(["key1", "key2"]);
    mockDel.mockResolvedValue(2);
    await service.delPattern("key*");
    expect(mockKeys).toHaveBeenCalledWith("key*");
    expect(mockDel).toHaveBeenCalledWith("key1", "key2");
  });
});
