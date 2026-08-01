import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";
import { env } from "../../config/env";
import { PinoLoggerService } from "../logger/logger.service";

const MAX_RETRIES_PER_REQUEST = 3;
const RETRY_DELAY_MULTIPLIER = 200;
const MAX_RETRY_DELAY = 2000;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private logger: PinoLoggerService;

  constructor(logger: PinoLoggerService) {
    this.logger = logger.child({ module: "RedisService" });
  }

  async onModuleInit() {
    await this.connect();
  }

  async connect(): Promise<Redis | null> {
    if (this.client) return this.client;
    if (!env.REDIS_URL) {
      this.logger.warn({}, "REDIS_URL not provided. Redis dependents will be disabled.");
      return null;
    }

    try {
      this.client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: MAX_RETRIES_PER_REQUEST,
        retryStrategy(times) {
          if (times > MAX_RETRIES_PER_REQUEST) return null; // Stop retrying on boot failure
          return Math.min(times * RETRY_DELAY_MULTIPLIER, MAX_RETRY_DELAY);
        },
      });

      await new Promise<void>((resolve, reject) => {
        this.client!.once("ready", resolve);
        this.client!.once("error", reject);
      });
      return this.client;
    } catch (error) {
      this.logger.error({ error }, "Failed to connect to Redis on startup. Redis dependents will be disabled.");
      this.client = null;
      return null;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
