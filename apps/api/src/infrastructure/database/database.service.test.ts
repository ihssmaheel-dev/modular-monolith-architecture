import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabaseService } from "./database.service";

const mockStartSession = vi.fn();
const mockStartTransaction = vi.fn();
const mockCommitTransaction = vi.fn();
const mockAbortTransaction = vi.fn();
const mockEndSession = vi.fn();
const mockClose = vi.fn();

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
    service = new DatabaseService(
      {
        startSession: mockStartSession,
        readyState: 1,
        close: mockClose,
      } as any,
      { child: () => ({ info: vi.fn(), debug: vi.fn(), error: vi.fn() }) } as any,
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
  });

  it("should abort transaction on failure", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("DB error"));
    const result = await service.withTransaction(fn);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe("TRANSACTION_FAILED");
    }
    expect(mockAbortTransaction).toHaveBeenCalled();
    expect(mockEndSession).toHaveBeenCalled();
  });

  it("should close connection on destroy", async () => {
    await service.onModuleDestroy();
    expect(mockClose).toHaveBeenCalled();
  });
});
