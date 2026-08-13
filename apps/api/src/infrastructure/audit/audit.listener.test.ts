import { beforeEach, describe, expect, it, vi } from "vitest";
import { Model } from "mongoose";
import { AuditListener, DatabaseMutatedEvent } from "./audit.listener";
import { AuditLogMongooseSchema } from "./schemas/audit-log.mongoose.schema";
import { PinoLoggerService } from "../logger/logger.service";

describe("AuditListener", () => {
  let listener: AuditListener;
  let model: Model<AuditLogMongooseSchema>;
  let logger: PinoLoggerService;
  const event = new DatabaseMutatedEvent("notes", "note-1", "UPDATE", "user-1", "tenant-1", {}, {});

  beforeEach(() => {
    model = { create: vi.fn() } as unknown as Model<AuditLogMongooseSchema>;
    logger = { child: vi.fn(), error: vi.fn() } as unknown as PinoLoggerService;
    vi.mocked(logger.child).mockReturnValue(logger);
    listener = new AuditListener(model, logger);
  });

  it("persists every database mutation as an audit record", async () => {
    vi.mocked(model.create).mockResolvedValue({} as never);

    await listener.handleDatabaseMutatedEvent(event);

    expect(model.create).toHaveBeenCalledWith({
      collectionName: "notes",
      documentId: "note-1",
      action: "UPDATE",
      actorId: "user-1",
      tenantId: "tenant-1",
      before: {},
      after: {},
    });
  });

  it("logs failed audit writes without interrupting the caller", async () => {
    vi.mocked(model.create).mockRejectedValue(new Error("database unavailable"));

    await expect(listener.handleDatabaseMutatedEvent(event)).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ collectionName: "notes", documentId: "note-1" }),
      "Failed to save audit log",
    );
  });
});
