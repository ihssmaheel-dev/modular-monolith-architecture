import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Redis } from "ioredis";
import { RedisService } from "../../redis/redis.service";
import { PinoLoggerService } from "../../logger/logger.service";
import { MetricsService } from "../../metrics/metrics.service";
import { RealtimeStreamRouter } from "./realtime-stream.router";
import { hostname } from "node:os";
import { randomUUID } from "node:crypto";
import { env } from "../../../config/env";

const STREAM_KEY = "realtime:events";
const XREAD_BLOCK_MS = 5000;
const RETRY_DELAY_MS = 2000;
const CLAIM_IDLE_MS = 60_000;
const MAX_DELIVERY_ATTEMPTS = 5;
const DEAD_LETTER_STREAM_KEY = "realtime:events:dead-letter";

type RedisStreamEntry = [id: string, fields: string[]];
type RedisStreamResult = [stream: string, messages: RedisStreamEntry[]][] | null;

interface ParsedStreamMessage {
  target: string;
  event: string;
  payload: string;
}

type GroupedRedis = {
  xreadgroup?: (...args: Array<string | number>) => Promise<RedisStreamResult>;
  xack: (stream: string, group: string, id: string) => Promise<number>;
  xautoclaim?: (...args: Array<string | number>) => Promise<unknown>;
  incr?: (key: string) => Promise<number>;
  expire?: (key: string, seconds: number) => Promise<number>;
  xadd?: (...args: Array<string | number>) => Promise<string>;
  del?: (key: string) => Promise<number>;
};

@Injectable()
export class RealtimeStreamConsumer implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis | null = null;
  private logger: PinoLoggerService;
  private isShuttingDown = false;
  private lastId = "$";
  private readonly groupName = "realtime-dispatchers";
  private readonly consumerName = `api-${hostname()}-${process.pid}-${randomUUID()}`;

  constructor(
    private readonly redis: RedisService,
    private readonly router: RealtimeStreamRouter,
    private readonly metrics: MetricsService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "RealtimeStreamConsumer" });
  }

  async onModuleInit(): Promise<void> {
    if (env.PROCESS_ROLE === "worker") return;
    const client = this.redis.getClient();
    if (!client) {
      this.logger.warn({}, "Redis client not available, stream realtime features disabled");
      return;
    }

    this.subscriber = client.duplicate();
    await this.ensureConsumerGroup();
    this.readStreamLoop();
  }

  private async ensureConsumerGroup(): Promise<void> {
    if (!this.subscriber) return;
    const xgroup = (
      this.subscriber as unknown as {
        xgroup?: (...args: Array<string | number>) => Promise<unknown>;
      }
    ).xgroup;
    if (typeof xgroup !== "function") return;
    try {
      await xgroup.call(this.subscriber, "CREATE", STREAM_KEY, this.groupName, "$", "MKSTREAM");
    } catch (error) {
      if (!String(error).includes("BUSYGROUP")) {
        this.logger.error({ error }, "Unable to create realtime consumer group");
      }
    }
  }

  private async readStreamLoop(): Promise<void> {
    if (!this.subscriber || this.isShuttingDown) return;

    try {
      const grouped = this.subscriber as unknown as GroupedRedis;
      if (grouped.xreadgroup) {
        await this.claimStale(grouped);
      }
      const result = grouped.xreadgroup
        ? await grouped.xreadgroup(
            "GROUP",
            this.groupName,
            this.consumerName,
            "COUNT",
            50,
            "BLOCK",
            XREAD_BLOCK_MS,
            "STREAMS",
            STREAM_KEY,
            ">",
          )
        : await this.subscriber.xread("BLOCK", XREAD_BLOCK_MS, "STREAMS", STREAM_KEY, this.lastId);
      await this.processStreamResult(
        result as RedisStreamResult,
        grouped.xreadgroup ? grouped : null,
      );
    } catch (err) {
      this.logger.error({ err }, "Redis XREAD error");
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }

    if (!this.isShuttingDown) {
      setImmediate(() => this.readStreamLoop());
    }
  }

  private async processStreamResult(
    result: RedisStreamResult,
    grouped: GroupedRedis | null,
  ): Promise<void> {
    const stream = result?.[0];
    if (!stream) return;
    for (const message of stream[1]) {
      const processed = await this.processStreamMessage(message, grouped);
      if (processed && grouped) await grouped.xack(STREAM_KEY, this.groupName, message[0]);
    }
  }

  private async processStreamMessage(
    [id, fields]: RedisStreamEntry,
    grouped: GroupedRedis | null,
  ): Promise<boolean> {
    this.lastId = id;
    this.recordConsumerLag(id);
    const message = parseStreamMessage(fields);
    const routed = this.routeMessage(message, id);
    if (routed) return true;
    if (!grouped) return false;
    return this.handleFailedDelivery(grouped, id, fields);
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

  private routeMessage(message: ParsedStreamMessage, id: string): boolean {
    if (!message.event) {
      this.logger.error({ msgId: id }, "Rejected malformed realtime event");
      return false;
    }
    try {
      const payload = JSON.parse(message.payload);
      if (!this.router.route(message.target, message.event, payload)) {
        this.logger.warn({ target: message.target, msgId: id }, "Ignoring unknown realtime target");
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error({ err, msgId: id }, "Failed to parse stream message");
      return false;
    }
  }

  private async claimStale(grouped: GroupedRedis): Promise<void> {
    if (!grouped.xautoclaim) return;
    const result = await grouped.xautoclaim(
      STREAM_KEY,
      this.groupName,
      this.consumerName,
      CLAIM_IDLE_MS,
      "0-0",
      "COUNT",
      50,
    );
    const entries =
      Array.isArray(result) && Array.isArray(result[1]) ? (result[1] as RedisStreamEntry[]) : [];
    await this.processStreamResult([[STREAM_KEY, entries]], grouped);
  }

  private async handleFailedDelivery(
    redis: GroupedRedis,
    id: string,
    fields: string[],
  ): Promise<boolean> {
    const client = redis;
    if (!client.incr) return false;
    const attemptKey = `realtime:events:attempts:${id}`;
    const attempts = await client.incr(attemptKey);
    if (client.expire) await client.expire(attemptKey, 3600);
    if (attempts < MAX_DELIVERY_ATTEMPTS) return false;
    if (client.xadd) {
      await client.xadd(
        DEAD_LETTER_STREAM_KEY,
        "*",
        "sourceId",
        id,
        "fields",
        JSON.stringify(fields),
      );
    }
    if (client.del) await client.del(attemptKey);
    this.metrics.incrementCounter(
      "realtime_dead_letter_total",
      "Realtime events moved to dead letter",
      1,
    );
    return true;
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
