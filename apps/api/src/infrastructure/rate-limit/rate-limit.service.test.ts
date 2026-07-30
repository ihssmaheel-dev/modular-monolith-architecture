import { describe, it, expect, vi, beforeEach } from "vitest";
import { RateLimitService } from "./rate-limit.service";

const mockPipeline = vi.fn();
const mockZremrangebyscore = vi.fn();
const mockZadd = vi.fn();
const mockZcard = vi.fn();
const mockExpire = vi.fn();

vi.mock("../../config/env", () => ({
  env: {
    NODE_ENV: "test",
    REDIS_URL: "redis://localhost:6379",
  },
}));

describe("RateLimitService", () => {
  let service: RateLimitService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockZremrangebyscore.mockReturnThis();
    mockZadd.mockReturnThis();
    mockZcard.mockReturnThis();
    mockExpire.mockReturnThis();
    mockPipeline.mockReturnValue({
      zremrangebyscore: mockZremrangebyscore,
      zadd: mockZadd,
      zcard: mockZcard,
      expire: mockExpire,
      exec: vi.fn().mockResolvedValue([null, null, [null, 5], null]),
    });

    service = new RateLimitService(
      {
        getClient: () => ({
          pipeline: mockPipeline,
        }),
      } as never,
    );
  });

  it("should allow request within limit", async () => {
    const result = await service.check("test-key", { maxRequests: 100, windowSeconds: 60 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(95);
  });

  it("should check by IP", async () => {
    const result = await service.checkByIp("127.0.0.1");
    expect(result.allowed).toBe(true);
  });

  it("should check by tenant", async () => {
    const result = await service.checkByTenant("tenant1");
    expect(result.allowed).toBe(true);
  });

  it("should check by route", async () => {
    const result = await service.checkByRoute("/api/users");
    expect(result.allowed).toBe(true);
  });
});
