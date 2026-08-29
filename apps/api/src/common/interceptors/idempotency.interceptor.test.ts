import {
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ClsService } from "nestjs-cls";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { firstValueFrom, of, throwError } from "rxjs";
import { IdempotencyInterceptor } from "./idempotency.interceptor";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";

interface RedisMock {
  set: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
}

describe("IdempotencyInterceptor", () => {
  let interceptor: IdempotencyInterceptor;
  let reflector: Reflector;
  let redisService: RedisService;
  let cls: ClsService;
  let redisClient: RedisMock;

  beforeEach(() => {
    reflector = new Reflector();
    redisClient = {
      set: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
    };
    redisService = {
      getClient: vi.fn().mockReturnValue(redisClient),
    } as unknown as RedisService;
    cls = {
      get: vi.fn((key: string) => (key === "userId" ? "user-123" : undefined)),
    } as unknown as ClsService;

    const logger = {
      child: vi.fn().mockReturnThis(),
      error: vi.fn(),
    } as unknown as PinoLoggerService;
    interceptor = new IdempotencyInterceptor(reflector, redisService, cls, logger);
  });

  const createMockContext = (headers: Record<string, string> = {}) => {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue({
          headers,
          ip: "127.0.0.1",
        }),
      }),
    } as unknown as ExecutionContext;
  };

  const createMockCallHandler = (returnValue: unknown = "success", shouldThrow = false) => {
    return {
      handle: vi
        .fn()
        .mockReturnValue(
          shouldThrow ? throwError(() => new Error("Handler error")) : of(returnValue),
        ),
    } as CallHandler;
  };

  it("should bypass if endpoint is not decorated with @Idempotent()", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    const context = createMockContext();
    const handler = createMockCallHandler();

    const result = await interceptor.intercept(context, handler);
    await expect(firstValueFrom(result)).resolves.toBe("success");
    expect(handler.handle).toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it("should throw BadRequestException if Idempotency-Key header is missing", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    const context = createMockContext(); // no headers
    const handler = createMockCallHandler();

    await expect(interceptor.intercept(context, handler)).rejects.toThrow(BadRequestException);
  });

  it("should bypass if Redis client is not available", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    vi.spyOn(redisService, "getClient").mockReturnValue(null);
    const context = createMockContext({ "idempotency-key": "req-1" });
    const handler = createMockCallHandler();

    const result = await interceptor.intercept(context, handler);
    await expect(firstValueFrom(result)).resolves.toBe("success");
    expect(handler.handle).toHaveBeenCalled();
  });

  it("should set PROCESSING flag and save response on successful execution", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    const context = createMockContext({ "idempotency-key": "req-1" });
    const handler = createMockCallHandler({ data: "success" });

    redisClient.set.mockResolvedValueOnce("OK"); // NX sets successfully
    redisClient.set.mockResolvedValueOnce("OK"); // Final save successfully

    const result = await interceptor.intercept(context, handler);
    await expect(firstValueFrom(result)).resolves.toEqual({ data: "success" });

    expect(redisClient.set).toHaveBeenNthCalledWith(
      1,
      "idempotency:single:user-123:req-1",
      "PROCESSING",
      "EX",
      86400,
      "NX",
    );
    expect(handler.handle).toHaveBeenCalled();

    expect(redisClient.set).toHaveBeenNthCalledWith(
      2,
      "idempotency:single:user-123:req-1",
      JSON.stringify({ data: "success" }),
      "EX",
      86400,
    );
  });

  it("should throw ConflictException if request is already PROCESSING", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    const context = createMockContext({ "idempotency-key": "req-1" });
    const handler = createMockCallHandler();

    redisClient.set.mockResolvedValueOnce(null); // NX failed, key exists
    redisClient.get.mockResolvedValueOnce("PROCESSING");

    await expect(interceptor.intercept(context, handler)).rejects.toThrow(ConflictException);
    expect(handler.handle).not.toHaveBeenCalled();
  });

  it("should return cached response if request already completed", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    const context = createMockContext({ "idempotency-key": "req-1" });
    const handler = createMockCallHandler();

    redisClient.set.mockResolvedValueOnce(null); // NX failed, key exists
    redisClient.get.mockResolvedValueOnce(JSON.stringify({ data: "cached" }));

    const result = await interceptor.intercept(context, handler);
    await expect(firstValueFrom(result)).resolves.toEqual({ data: "cached" });
    expect(handler.handle).not.toHaveBeenCalled();
  });

  it("should delete PROCESSING lock if route handler throws an error", async () => {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);
    const context = createMockContext({ "idempotency-key": "req-1" });
    const handler = createMockCallHandler(null, true); // throws error

    redisClient.set.mockResolvedValueOnce("OK"); // NX sets successfully
    redisClient.del.mockResolvedValueOnce(1); // Delete resolves

    const result = await interceptor.intercept(context, handler);

    await expect(firstValueFrom(result)).rejects.toThrow("Handler error");
    expect(redisClient.del).toHaveBeenCalledWith("idempotency:single:user-123:req-1");
  });

  it("should always generate consistent redis keys and lock successfully for any valid idempotency key", async () => {
    const fc = await import("fast-check");
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

    await fc.assert(
      fc.asyncProperty(
        fc
          .array(
            fc.constantFrom(
              ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._:-",
            ),
            { minLength: 1, maxLength: 50 },
          )
          .map((arr) => arr.join("")),
        fc.json(),
        async (idempotencyKey, responseData) => {
          const parsedData = JSON.parse(responseData);
          const context = createMockContext({ "idempotency-key": idempotencyKey });
          const handler = createMockCallHandler(parsedData);

          redisClient.set.mockResolvedValueOnce("OK");
          redisClient.set.mockResolvedValueOnce("OK");

          const result = await interceptor.intercept(context, handler);
          await expect(firstValueFrom(result)).resolves.toEqual(parsedData);

          const expectedKey = `idempotency:single:user-123:${idempotencyKey}`;
          expect(redisClient.set).toHaveBeenCalledWith(
            expectedKey,
            "PROCESSING",
            "EX",
            86400,
            "NX",
          );

          redisClient.set.mockClear();
        },
      ),
      { numRuns: 20 },
    );
  });
});
