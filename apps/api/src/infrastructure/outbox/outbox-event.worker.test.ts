import { describe, expect, it, vi } from "vitest";
import { OutboxEventWorker } from "./outbox-event.worker";
import type { QueueService } from "../queue/queue.service";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import type { PinoLoggerService } from "../logger/logger.service";

describe("OutboxEventWorker", () => {
  it("validates and emits durable queue envelopes", async () => {
    let handler: ((job: { data: unknown }) => Promise<void>) | undefined;
    const queues = {
      addWorker: vi.fn((_name, next) => {
        handler = next;
        return {};
      }),
    } as unknown as QueueService;
    const events = { emitAsync: vi.fn().mockResolvedValue([]) } as unknown as EventEmitter2;
    const logger = {
      child: vi.fn().mockReturnThis(),
      debug: vi.fn(),
    } as unknown as PinoLoggerService;
    const worker = new OutboxEventWorker(queues, events, logger);

    worker.onModuleInit();
    await handler?.({
      data: { id: "event-1", topic: "note.created", version: 1, payload: { id: "note-1" } },
    });

    expect(events.emitAsync).toHaveBeenCalledWith("note.created", { id: "note-1" });
  });
});
