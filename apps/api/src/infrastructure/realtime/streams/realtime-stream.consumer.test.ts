import { describe, expect, it, vi } from "vitest";
import type { Redis } from "ioredis";

import type { PinoLoggerService } from "../../logger/logger.service";
import type { MetricsService } from "../../metrics/metrics.service";
import type { RedisService } from "../../redis/redis.service";
import { RealtimeStreamConsumer } from "./realtime-stream.consumer";
import type { RealtimeStreamRouter } from "./realtime-stream.router";

describe("RealtimeStreamConsumer", () => {
  it("disables stream consumption gracefully when Redis is unavailable", async () => {
    const logWarn = vi.fn();
    const logger = {
      child: vi.fn().mockReturnValue({ warn: logWarn }),
    } as unknown as PinoLoggerService;
    const redis = { getClient: vi.fn().mockReturnValue(null) } as unknown as RedisService;
    const router = {} as RealtimeStreamRouter;
    const metrics = {} as MetricsService;
    const consumer = new RealtimeStreamConsumer(redis, router, metrics, logger);

    await consumer.onModuleInit();

    expect(logWarn).toHaveBeenCalledWith(
      {},
      "Redis client not available, stream realtime features disabled",
    );
  });

  it("routes stream events locally and records their consumer lag", async () => {
    const xread = vi
      .fn()
      .mockResolvedValueOnce([
        [
          "realtime:events",
          [
            [
              "1000-0",
              [
                "target",
                "tenant:tenant-1:user:user-1",
                "event",
                "note.created",
                "payload",
                '{"id":"note-1"}',
              ],
            ],
          ],
        ],
      ])
      .mockImplementation(() => new Promise<never>(() => undefined));
    const subscriber = { xread, quit: vi.fn().mockResolvedValue("OK") } as unknown as Redis;
    const client = { duplicate: vi.fn().mockReturnValue(subscriber) } as unknown as Redis;
    const redis = { getClient: vi.fn().mockReturnValue(client) } as unknown as RedisService;
    const router = { route: vi.fn().mockReturnValue(true) } as unknown as RealtimeStreamRouter;
    const metrics = { recordHistogram: vi.fn() } as unknown as MetricsService;
    const logger = {
      child: vi.fn().mockReturnValue({ error: vi.fn(), warn: vi.fn() }),
    } as unknown as PinoLoggerService;
    const consumer = new RealtimeStreamConsumer(redis, router, metrics, logger);

    await consumer.onModuleInit();
    await vi.waitFor(() => {
      expect(router.route).toHaveBeenCalledWith("tenant:tenant-1:user:user-1", "note.created", {
        id: "note-1",
      });
    });
    await consumer.onModuleDestroy();

    expect(metrics.recordHistogram).toHaveBeenCalledWith(
      "realtime_consumer_lag_ms",
      "Lag between event generation and stream consumption",
      expect.any(Number),
    );
    expect(subscriber.quit).toHaveBeenCalledOnce();
  });
});
