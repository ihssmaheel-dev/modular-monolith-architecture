import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";
import { CacheMetricsService } from "./cache-metrics.service";

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class CacheService {
  private logger: PinoLoggerService;

  constructor(
    private readonly redis: RedisService,
    private readonly cacheMetrics: CacheMetricsService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "CacheService" });
  }

  async get<T>(key: string): Promise<T | null> {
    const client = this.redis.getClient();
    if (!client) return null;

    try {
      const raw = await client.get(key);
      if (!raw) {
        this.cacheMetrics.recordMiss("redis");
        return null;
      }
      this.cacheMetrics.recordHit("redis");
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.error({ key, error }, "Cache get failed");
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
    const client = this.redis.getClient();
    if (!client) return;

    try {
      await client.setex(key, ttlSeconds, JSON.stringify(value));
      this.cacheMetrics.recordSet("redis");
    } catch (error) {
      this.logger.error({ key, error }, "Cache set failed");
    }
  }

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug({ key }, "Cache hit");
      return cached;
    }

    this.logger.debug({ key }, "Cache miss");
    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  async del(key: string): Promise<void> {
    const client = this.redis.getClient();
    if (!client) return;

    try {
      await client.del(key);
      this.cacheMetrics.recordEvict("redis");
    } catch (error) {
      this.logger.error({ key, error }, "Cache delete failed");
    }
  }

  async delPattern(pattern: string): Promise<void> {
    const client = this.redis.getClient();
    if (!client) return;

    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
        this.cacheMetrics.recordEvict("redis", keys.length);
        this.logger.debug({ pattern, count: keys.length }, "Cache pattern deleted");
      }
    } catch (error) {
      this.logger.error({ pattern, error }, "Cache deletePattern failed");
    }
  }
}
