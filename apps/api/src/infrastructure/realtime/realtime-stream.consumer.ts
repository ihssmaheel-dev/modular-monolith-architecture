import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";
import { MetricsService } from "../metrics/metrics.service";
import { RealtimeConnectionRegistry } from "./realtime-connection.registry";

const STREAM_KEY = "realtime:events";

@Injectable()
export class RealtimeStreamConsumer implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis | null = null;
  private logger: PinoLoggerService;
  private isShuttingDown = false;
  private lastId = "$";

  constructor(
    private readonly redis: RedisService,
    private readonly registry: RealtimeConnectionRegistry,
    private readonly metrics: MetricsService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "RealtimeStreamConsumer" });
  }

  async onModuleInit(): Promise<void> {
    const client = this.redis.getClient();
    if (!client) {
      this.logger.warn({}, "Redis client not available, stream realtime features disabled");
      return;
    }

    this.subscriber = client.duplicate();
    this.readStreamLoop();
  }

  private async readStreamLoop() {
    if (!this.subscriber || this.isShuttingDown) return;

    try {
      const result = await this.subscriber.xread("BLOCK", 5000, "STREAMS", STREAM_KEY, this.lastId);

      if (result && result.length > 0 && result[0]) {
        const stream = result[0];
        const messages = stream[1];

        for (const message of messages) {
          this.lastId = message[0];

          // Calculate consumer lag
          try {
            const timestampStr = this.lastId.split("-")[0];
            if (timestampStr) {
              const timestamp = parseInt(timestampStr, 10);
              const lag = Date.now() - timestamp;
              if (!isNaN(lag) && lag >= 0) {
                this.metrics.recordHistogram(
                  "realtime_consumer_lag_ms",
                  "Lag between event generation and stream consumption",
                  lag,
                );
              }
            }
          } catch (e) {
            // Ignore parse errors for lag
          }

          const fields = message[1];

          let target = "broadcast";
          let event = "";
          let payloadStr = "null";

          for (let i = 0; i < fields.length; i += 2) {
            const key = fields[i];
            const val = fields[i + 1] || "";
            if (key === "target") target = val || "broadcast";
            if (key === "event") event = val || "";
            if (key === "payload") payloadStr = val || "null";
          }

          try {
            const payload = JSON.parse(payloadStr);
            if (target === "broadcast") {
              this.registry.dispatchToAll(event, payload);
            } else if (target.startsWith("user:")) {
              const userId = target.split(":")[1];
              if (userId) this.registry.dispatchToUser(userId, event, payload);
            } else if (target.startsWith("room:")) {
              this.registry.dispatchToAll(event, payload);
            }
          } catch (err) {
            this.logger.error({ err, msgId: this.lastId }, "Failed to parse stream message");
          }
        }
      }
    } catch (err) {
      this.logger.error({ err }, "Redis XREAD error");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (!this.isShuttingDown) {
      setImmediate(() => this.readStreamLoop());
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    if (this.subscriber) {
      await this.subscriber.quit();
    }
  }
}
