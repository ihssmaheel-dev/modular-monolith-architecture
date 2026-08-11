import type { EventEmitter2 } from "@nestjs/event-emitter";
import type { Connection } from "mongoose";
import { describe, expect, it, vi } from "vitest";
import { env } from "../../config/env";
import type { MetricsService } from "../metrics/metrics.service";
import { createDatabaseOptions } from "./database-connection.factory";

describe("createDatabaseOptions", () => {
  it("builds connection options and installs global plugins", () => {
    const eventEmitter = {} as unknown as EventEmitter2;
    const metricsService = {} as unknown as MetricsService;
    const plugin = vi.fn();
    const connection = { plugin } as unknown as Connection;
    const options = createDatabaseOptions(eventEmitter, metricsService);
    const configure = options.connectionFactory as (value: Connection) => Connection;

    expect(options.uri).toBe(env.MONGODB_URI);
    expect(configure(connection)).toBe(connection);
    expect(plugin).toHaveBeenCalledTimes(2);
    expect(plugin).toHaveBeenNthCalledWith(1, expect.any(Function), { eventEmitter });
    expect(plugin).toHaveBeenNthCalledWith(2, expect.any(Function), { metricsService });
  });
});
