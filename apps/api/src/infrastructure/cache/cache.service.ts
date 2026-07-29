import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class CacheService {
  private logger: PinoLoggerService;

  constructor(
    private readonly redis: RedisService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "CacheService" });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.getClient().get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.error({ key, error }, "Cache get failed");
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    try {
      await this.redis.getClient().setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      this.logger.error({ key, error }, "Cache set failed");
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.getClient().del(key);
    } catch (error) {
      this.logger.error({ key, error }, "Cache delete failed");
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const client = this.redis.getClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
        this.logger.debug({ pattern, count: keys.length }, "Cache pattern deleted");
      }
    } catch (error) {
      this.logger.error({ pattern, error }, "Cache pattern delete failed");
    }
  }
}
