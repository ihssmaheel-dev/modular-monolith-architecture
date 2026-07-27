import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { createClient, type RedisClientType } from "redis";
import { env } from "../../config/env";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType | null = null;

  async connect(): Promise<RedisClientType> {
    if (this.client) return this.client;

    this.client = createClient({ url: env.REDIS_URL });
    await this.client.connect();
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
