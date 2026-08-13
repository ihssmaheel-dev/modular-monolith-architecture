import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";
import { RedisService } from "../../redis/redis.service";
import { PinoLoggerService } from "../../logger/logger.service";
import { MetricsService } from "../../metrics/metrics.service";
import { RealtimeStreamRouter } from "./realtime-stream.router";

const STREAM_KEY = "realtime:events";
const XREAD_BLOCK_MS = 5000;
const RETRY_DELAY_MS = 2000;

type RedisStreamEntry = [id: string, fields: string[]];
type RedisStreamResult = [stream: string, messages: RedisStreamEntry[]][] | null;

interface ParsedStreamMessage {
  target: string;
  event: string;
  payload: string;
}

@Injectable()
export class RealtimeStreamConsumer implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis | null = null;
  private logger: PinoLoggerService;
  private isShuttingDown = false;
  private lastId = "$";

  constructor(
    private readonly redis: RedisService,
    private readonly router: RealtimeStreamRouter,
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

  private async readStreamLoop(): Promise<void> {
    if (!this.subscriber || this.isShuttingDown) return;

    try {
      const result = await this.subscriber.xread(
        "BLOCK",
        XREAD_BLOCK_MS,
        "STREAMS",
        STREAM_KEY,
        this.lastId,
      );
      this.processStreamResult(result);
    } catch (err) {
      this.logger.error({ err }, "Redis XREAD error");
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }

    if (!this.isShuttingDown) {
      setImmediate(() => this.readStreamLoop());
    }
  }

  private processStreamResult(result: RedisStreamResult): void {
    const stream = result?.[0];
    if (!stream) return;
    for (const message of stream[1]) {
      this.processStreamMessage(message);
    }
  }

  private processStreamMessage([id, fields]: RedisStreamEntry): void {
    this.lastId = id;
    this.recordConsumerLag(id);
    const message = parseStreamMessage(fields);
    this.routeMessage(message, id);
  }

  private recordConsumerLag(id: string): void {
    const timestamp = Number.parseInt(id.split("-")[0] ?? "", 10);
    const lag = Date.now() - timestamp;
    if (Number.isNaN(timestamp) || lag < 0) return;
    this.metrics.recordHistogram(
      "realtime_consumer_lag_ms",
      "Lag between event generation and stream consumption",
      lag,
    );
  }

  private routeMessage(message: ParsedStreamMessage, id: string): void {
    try {
      const payload = JSON.parse(message.payload);
      if (!this.router.route(message.target, message.event, payload)) {
        this.logger.warn({ target: message.target, msgId: id }, "Ignoring unknown realtime target");
      }
    } catch (err) {
      this.logger.error({ err, msgId: id }, "Failed to parse stream message");
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    if (this.subscriber) {
      await this.subscriber.quit();
    }
  }
}

function parseStreamMessage(fields: string[]): ParsedStreamMessage {
  let target = "broadcast";
  let event = "";
  let payload = "null";
  for (let index = 0; index < fields.length; index += 2) {
    const key = fields[index];
    const value = fields[index + 1] ?? "";
    if (key === "target") target = value || target;
    if (key === "event") event = value;
    if (key === "payload") payload = value || payload;
  }
  return { target, event, payload };
}
