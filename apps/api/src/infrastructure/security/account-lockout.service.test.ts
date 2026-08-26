import { describe, it, expect, beforeEach, vi } from "vitest";
import { AccountLockoutService } from "./account-lockout.service";
import type { PinoLoggerService } from "../logger/logger.service";
import type { RedisService } from "../redis/redis.service";

describe("AccountLockoutService", () => {
  let service: AccountLockoutService;
  let mockLogger: PinoLoggerService;
  let mockRedisService: RedisService;
  let mockRedisClient: {
    get: ReturnType<typeof vi.fn>;
    incr: ReturnType<typeof vi.fn>;
    expire: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    ttl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockLogger = {
      child: vi.fn().mockReturnThis(),
      warn: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    } as unknown as PinoLoggerService;

    mockRedisClient = {
      get: vi.fn().mockResolvedValue(null),
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
      del: vi.fn().mockResolvedValue(1),
      ttl: vi.fn().mockResolvedValue(600),
    };

    mockRedisService = {
      getClient: vi.fn().mockReturnValue(mockRedisClient),
    } as unknown as RedisService;

    service = new AccountLockoutService(mockRedisService, mockLogger);
  });

  describe("with Redis available", () => {
    it("locks out user when max attempts are exceeded", async () => {
      mockRedisClient.get.mockResolvedValue("5");
      mockRedisClient.ttl.mockResolvedValue(300);

      const isLocked = await service.isLockedOut("victim@example.com");
      expect(isLocked).toBe(true);
    });

    it("allows user when below max attempts", async () => {
      mockRedisClient.get.mockResolvedValue("2");

      const isLocked = await service.isLockedOut("user@example.com");
      expect(isLocked).toBe(false);
    });

    it("records failed attempt and sets TTL on first failure", async () => {
      mockRedisClient.incr.mockResolvedValue(1);

      await service.recordFailedAttempt("user@example.com");
      expect(mockRedisClient.incr).toHaveBeenCalledWith("lockout:user@example.com");
      expect(mockRedisClient.expire).toHaveBeenCalled();
    });

    it("resets failed attempts on success", async () => {
      await service.resetAttempts("user@example.com");
      expect(mockRedisClient.del).toHaveBeenCalledWith("lockout:user@example.com");
    });
  });

  describe("with in-memory fallback (no Redis)", () => {
    beforeEach(() => {
      vi.mocked(mockRedisService.getClient).mockReturnValue(null);
      service = new AccountLockoutService(mockRedisService, mockLogger);
    });

    it("tracks attempts in-memory and locks out after threshold", async () => {
      const email = "attacker@example.com";
      expect(await service.isLockedOut(email)).toBe(false);

      for (let i = 0; i < 5; i++) {
        await service.recordFailedAttempt(email);
      }

      expect(await service.isLockedOut(email)).toBe(true);

      await service.resetAttempts(email);
      expect(await service.isLockedOut(email)).toBe(false);
    });
  });
});
