import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EventEmitter2 } from "@nestjs/event-emitter";
import type { MetricsService } from "../metrics/metrics.service";
import type { PinoLoggerService } from "../logger/logger.service";
import type { ClsService } from "nestjs-cls";
import { OutboxRelayWorker } from "./outbox-relay.worker";
import type { OutboxEvent, OutboxRepository } from "./outbox.repository";

const EVENT: OutboxEvent = {
  id: "event-1",
  topic: "user.created",
  payload: { userId: "user-1" },
  status: "PROCESSING",
  attempts: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("OutboxRelayWorker", () => {
  let repository: OutboxRepository;
  let emitter: EventEmitter2;
  let metrics: MetricsService;
  let worker: OutboxRelayWorker;

  beforeEach(() => {
    repository = {
      recoverStaleLocks: vi.fn().mockResolvedValue(0),
      countPendingEvents: vi.fn().mockResolvedValue(1),
      lockPendingEvents: vi.fn().mockResolvedValue([EVENT]),
      updateById: vi.fn(),
    } as unknown as OutboxRepository;
    emitter = { emitAsync: vi.fn().mockResolvedValue([]) } as unknown as EventEmitter2;
    metrics = { setGauge: vi.fn(), recordHistogram: vi.fn() } as unknown as MetricsService;
    const logger = {
      child: vi.fn().mockReturnThis(),
      error: vi.fn(),
      warn: vi.fn(),
    } as unknown as PinoLoggerService;
    const cls = {
      runWith: vi.fn((_context, callback: () => Promise<void>) => callback()),
    } as unknown as ClsService;
    worker = new OutboxRelayWorker(repository, emitter, metrics, cls, logger);
  });

  it("publishes and marks a locked event complete", async () => {
    await worker.relayEvents();

    expect(emitter.emitAsync).toHaveBeenCalledWith(EVENT.topic, EVENT.payload);
    expect(repository.updateById).toHaveBeenCalledWith(
      EVENT.id,
      expect.objectContaining({ $set: { status: "PUBLISHED" } }),
    );
    expect(metrics.recordHistogram).toHaveBeenCalled();
  });

  it("returns a failed delivery to the retry queue", async () => {
    vi.mocked(emitter.emitAsync).mockRejectedValue(new Error("listener failed"));

    await worker.relayEvents();

    expect(repository.updateById).toHaveBeenCalledWith(
      EVENT.id,
      expect.objectContaining({
        $set: expect.objectContaining({ status: "PENDING", attempts: 1 }),
      }),
    );
  });
});
