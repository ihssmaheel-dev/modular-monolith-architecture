import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PinoLoggerService } from "../logger/logger.service";
import { DatabaseService } from "./database.service";
import { err } from "neverthrow";

vi.mock("pg", () => {
  return {
    Pool: class {
      on = vi.fn();
      end = vi.fn();
      query = vi.fn();
    },
  };
});
vi.mock("drizzle-orm/node-postgres", () => ({
  drizzle: vi.fn(() => ({
    transaction: vi.fn(async (cb) => cb({})),
  })),
}));

describe("DatabaseService", () => {
  let service: DatabaseService;

  beforeEach(() => {
    const mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      child: vi.fn().mockReturnThis(),
    } as unknown as PinoLoggerService;
    const mockCls = {
      isActive: vi.fn().mockReturnValue(false),
      get: vi.fn(),
      runWith: vi.fn(async (_ctx, fn) => await (fn as () => Promise<unknown>)()),
    } as unknown as never;

    service = new DatabaseService(mockLogger as never, mockCls as never);
  });

  it("should report connection status", () => {
    expect(service.isConnected()).toBe(true);
  });

  it("should execute transaction successfully", async () => {
    const result = await service.withTransaction(async () => ({ id: 1 }));
    expect(result.isOk()).toBe(true);
  });

  it("should propagate result transaction", async () => {
    const result = await service.withResultTransaction(async () => err({ type: "EXPECTED" } as never));
    expect(result.isErr()).toBe(true);
  });
});
