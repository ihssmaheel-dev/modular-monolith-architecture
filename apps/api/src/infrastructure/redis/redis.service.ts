import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { env } from "../../config/env";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;

  async connect(): Promise<Redis> {
    if (this.client) return this.client;

    this.client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
    });

    await this.client.waitForReady();
    return this.client;
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
