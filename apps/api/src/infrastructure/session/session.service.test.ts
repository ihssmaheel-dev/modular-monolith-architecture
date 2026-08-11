import { describe, it, expect, vi, beforeEach } from "vitest";
import { SessionService } from "./session.service";
import type { RedisService } from "../redis/redis.service";
import type { PinoLoggerService } from "../logger/logger.service";

const mockSetex = vi.fn();
const mockGet = vi.fn();
const mockDel = vi.fn();
const mockSadd = vi.fn();
const mockSrem = vi.fn();
const mockSmembers = vi.fn();

vi.mock("../../config/env", () => ({
  env: {
    NODE_ENV: "test",
    REDIS_URL: "redis://localhost:6379",
  },
}));

describe("SessionService", () => {
  let service: SessionService;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    } as unknown as PinoLoggerService;
    mockLogger.child = () => mockLogger;

    service = new SessionService(
      {
        getClient: () => ({
          setex: mockSetex,
          get: mockGet,
          sadd: mockSadd,
          del: mockDel,
          srem: mockSrem,
          smembers: mockSmembers,
          pipeline: () => ({
            del: mockDel,
            setex: mockSetex,
            exec: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as RedisService,
      mockLogger,
    );
  });

  it("should create a session", async () => {
    mockSetex.mockResolvedValue("OK");
    mockSadd.mockResolvedValue(1);

    const session = await service.create({
      userId: "user1",
      ip: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      deviceName: "Chrome",
    });

    expect(session.userId).toBe("user1");
    expect(session.ip).toBe("127.0.0.1");
    expect(session.deviceName).toBe("Chrome");
    expect(mockSetex).toHaveBeenCalled();
    expect(mockSadd).toHaveBeenCalled();
  });

  it("should get session by id", async () => {
    const sessionData = {
      id: "abc123",
      userId: "user1",
      ip: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      deviceName: "Chrome",
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };
    mockGet.mockResolvedValue(JSON.stringify(sessionData));

    const result = await service.getById("abc123");
    expect(result).toEqual(sessionData);
  });

  it("should return null for non-existent session", async () => {
    mockGet.mockResolvedValue(null);
    const result = await service.getById("nonexistent");
    expect(result).toBeNull();
  });

  it("should revoke a session", async () => {
    const sessionData = {
      id: "abc123",
      userId: "user1",
      ip: "127.0.0.1",
      userAgent: "Mozilla/5.0",
      deviceName: "Chrome",
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
    };
    mockGet.mockResolvedValue(JSON.stringify(sessionData));
    mockDel.mockResolvedValue(1);
    mockSrem.mockResolvedValue(1);
    mockSetex.mockResolvedValue("OK");

    await service.revoke("abc123");
    expect(mockDel).toHaveBeenCalled();
    expect(mockSrem).toHaveBeenCalled();
  });

  it("should revoke all sessions for a user", async () => {
    mockSmembers.mockResolvedValue(["sess1", "sess2"]);
    mockGet
      .mockResolvedValueOnce(JSON.stringify({ id: "sess1", userId: "user1" }))
      .mockResolvedValueOnce(JSON.stringify({ id: "sess2", userId: "user1" }));
    mockDel.mockResolvedValue(1);
    mockSetex.mockResolvedValue("OK");

    await service.revokeAllForUser("user1");
    expect(mockSmembers).toHaveBeenCalledWith("user:user1:sessions");
  });
});
