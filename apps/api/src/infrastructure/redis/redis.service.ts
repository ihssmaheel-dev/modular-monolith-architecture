import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";
import { env } from "../../config/env";

const MAX_RETRIES_PER_REQUEST = 3;
const RETRY_DELAY_MULTIPLIER = 200;
const MAX_RETRY_DELAY = 2000;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;

  async onModuleInit() {
    await this.connect();
  }

  async connect(): Promise<Redis> {
    if (this.client) return this.client;

    this.client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: MAX_RETRIES_PER_REQUEST,
      retryStrategy(times) {
        return Math.min(times * RETRY_DELAY_MULTIPLIER, MAX_RETRY_DELAY);
      },
    });

    await new Promise<void>((resolve) => {
      this.client!.once("ready", resolve);
    });
    return this.client!;
  }

  getClient(): Redis {
    if (!this.client) {
      throw new Error("Redis client not connected. Call connect() first.");
    }
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
