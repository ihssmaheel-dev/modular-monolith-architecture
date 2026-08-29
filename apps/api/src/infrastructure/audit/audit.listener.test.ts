import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditListener, DatabaseMutatedEvent } from "./audit.listener";
import { PinoLoggerService } from "../logger/logger.service";
import { DatabaseService } from "../database/database.service";
import { TenantContextService } from "../database/context/tenant-context.service";
import { ok } from "neverthrow";

describe("AuditListener", () => {
  let listener: AuditListener;
  let database: DatabaseService;
  let logger: PinoLoggerService;
  let tenantContext: TenantContextService;
  const event = new DatabaseMutatedEvent("notes", "note-1", "UPDATE", "user-1", "tenant-1", {}, {});
  const mockInsert = vi.fn();

  beforeEach(() => {
    mockInsert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    database = {
      getDb: vi.fn().mockReturnValue({ insert: vi.fn().mockReturnValue({ values: mockInsert }) }),
      getTx: vi.fn().mockReturnValue(undefined),
      withTransaction: vi.fn().mockImplementation(async (callback) => {
        await callback();
        return ok(undefined);
      }),
    } as unknown as DatabaseService;
    tenantContext = {
      run: vi.fn((_context, callback) => callback()),
    } as unknown as TenantContextService;
    logger = { child: vi.fn(), error: vi.fn() } as unknown as PinoLoggerService;
    vi.mocked(logger.child).mockReturnValue(logger);
    listener = new AuditListener(database, tenantContext, logger);
  });

  it("persists every database mutation as an audit record", async () => {
    await listener.handleDatabaseMutatedEvent(event);
    expect(mockInsert).toHaveBeenCalled();
  });

  it("logs failed audit writes so the mutation can roll back", async () => {
    mockInsert.mockRejectedValue(new Error("database unavailable"));
    await expect(listener.handleDatabaseMutatedEvent(event)).rejects.toThrow(
      "database unavailable",
    );
    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ collectionName: "notes", documentId: "note-1" }),
      "Failed to save audit log",
    );
  });
});
