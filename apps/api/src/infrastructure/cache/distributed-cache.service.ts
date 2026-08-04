import { Injectable, OnModuleInit, OnApplicationShutdown } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";
import { CacheRegistry } from "./cache.registry";
import Redis from "ioredis";
import { env } from "../../config/env";

const CACHE_CHANNEL = "cache:invalidation";

@Injectable()
export class DistributedCacheService implements OnModuleInit, OnApplicationShutdown {
  private subscriber: Redis | null = null;
  private logger: PinoLoggerService;

  constructor(
    private readonly redisService: RedisService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "DistributedCacheService" });
  }

  async onModuleInit() {
    if (!env.REDIS_URL) {
      this.logger.warn({}, "REDIS_URL not set. Distributed cache invalidation will only work locally.");
      return;
    }

    try {
      this.subscriber = new Redis(env.REDIS_URL);
      
      this.subscriber.on("error", (error) => {
        this.logger.error({ error }, "Cache subscriber error");
      });

      await this.subscriber.subscribe(CACHE_CHANNEL);
      this.logger.info({}, "Subscribed to cache invalidation channel");

      this.subscriber.on("message", (channel, message) => {
        if (channel === CACHE_CHANNEL) {
          this.logger.debug({ key: message }, "Received cache invalidation event");
          CacheRegistry.deleteLocal(message);
        }
      });

      // Hook the publisher into our CacheRegistry
      const publisher = this.redisService.getClient();
      CacheRegistry.setPublishFn(async (key: string) => {
        if (publisher) {
          await publisher.publish(CACHE_CHANNEL, key);
        }
      });
    } catch (error) {
      this.logger.error({ error }, "Failed to initialize distributed cache subscriber");
    }
  }

  async onApplicationShutdown() {
    if (this.subscriber) {
      await this.subscriber.quit();
    }
  }
}
