import type { Connection } from "mongoose";
import type { ClsService } from "nestjs-cls";
import { err } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PinoLoggerService } from "../logger/logger.service";
import { DatabaseService } from "./database.service";

const mockStartSession = vi.fn();
const mockStartTransaction = vi.fn();
const mockCommitTransaction = vi.fn();
const mockAbortTransaction = vi.fn();
const mockEndSession = vi.fn();
const mockClose = vi.fn();
const mockRunWith = vi.fn();

vi.mock("@nestjs/mongoose", () => ({
  InjectConnection: () => () => {},
}));

describe("DatabaseService", () => {
  let service: DatabaseService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStartSession.mockResolvedValue({
      startTransaction: mockStartTransaction,
      commitTransaction: mockCommitTransaction,
      abortTransaction: mockAbortTransaction,
      endSession: mockEndSession,
    });
    const mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    } as unknown as PinoLoggerService;
    mockLogger.child = () => mockLogger;

    mockRunWith.mockImplementation(async (_context, callback) => await callback());
    const mockCls = {
      isActive: vi.fn().mockReturnValue(false),
      get: vi.fn().mockReturnValue({}),
      runWith: mockRunWith,
    } as unknown as ClsService;

    service = new DatabaseService(
      {
        startSession: mockStartSession,
        readyState: 1,
        close: mockClose,
      } as unknown as Connection,
      mockLogger,
      mockCls,
    );
  });

  it("should report connection status", () => {
    expect(service.isConnected()).toBe(true);
  });

  it("should execute transaction successfully", async () => {
    const fn = vi.fn().mockResolvedValue({ id: 1 });
    const result = await service.withTransaction(fn);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual({ id: 1 });
    }
    expect(mockCommitTransaction).toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
    expect(mockRunWith).toHaveBeenCalledWith(
      expect.objectContaining({ mongoSession: expect.any(Object) }),
      expect.any(Function),
    );
  });

  it("should abort transaction on failure", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("DB error"));
    const result = await service.withTransaction(fn);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.type).toBe("TRANSACTION_FAILED");
    }
    expect(mockAbortTransaction).toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });

  it("aborts when a Result-returning callback fails", async () => {
    const result = await service.withResultTransaction(async () => err({ type: "EXPECTED" }));

    expect(result.isErr()).toBe(true);
    expect(mockAbortTransaction).toHaveBeenCalled();
    expect(mockCommitTransaction).not.toHaveBeenCalled();
  });

  it("returns a transaction error when session creation fails", async () => {
    mockStartSession.mockRejectedValue(new Error("unavailable"));

    const result = await service.withTransaction(async () => "value");

    expect(result.isErr() && result.error.type).toBe("TRANSACTION_FAILED");
    expect(mockRunWith).not.toHaveBeenCalled();
  });

  it("should close connection on application shutdown", async () => {
    await service.onApplicationShutdown();
    expect(mockClose).toHaveBeenCalled();
  });
});
