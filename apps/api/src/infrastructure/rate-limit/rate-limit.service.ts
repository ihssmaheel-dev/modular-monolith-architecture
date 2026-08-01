import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

const SLIDING_WINDOW_LOG_PREFIX = "ratelimit:";
const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_SECONDS = 60;
const MS_PER_SECOND = 1000;

export interface RateLimitConfig {
  windowSeconds?: number;
  maxRequests?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

@Injectable()
export class RateLimitService {
  constructor(
    private readonly redis: RedisService,
  ) {}

  async check(
    key: string,
    config: RateLimitConfig = {},
  ): Promise<RateLimitResult> {
    const windowSeconds = config.windowSeconds ?? DEFAULT_WINDOW_SECONDS;
    const maxRequests = config.maxRequests ?? DEFAULT_MAX_REQUESTS;
    const now = Date.now();
    const windowStart = now - windowSeconds * MS_PER_SECOND;
    const redisKey = `${SLIDING_WINDOW_LOG_PREFIX}${key}`;

    const client = this.redis.getClient();
    if (!client) {
      // If Redis is down, gracefully bypass rate limiting
      return { allowed: true, remaining: maxRequests, resetAt: Math.ceil((now + windowSeconds * MS_PER_SECOND) / MS_PER_SECOND) };
    }

    const pipeline = client.pipeline();
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    pipeline.zadd(redisKey, now.toString(), `${now}:${crypto.randomUUID()}`);
    pipeline.zcard(redisKey);
    pipeline.expire(redisKey, windowSeconds);
    const results = await pipeline.exec();

    const count = (results?.[2]?.[1] as number) ?? 0;
    const remaining = Math.max(0, maxRequests - count);
    const resetAt = Math.ceil((now + windowSeconds * MS_PER_SECOND) / MS_PER_SECOND);

    return { allowed: count <= maxRequests, remaining, resetAt };
  }

  async checkByIp(ip: string, config?: RateLimitConfig): Promise<RateLimitResult> {
    return this.check(`ip:${ip}`, config);
  }

  async checkByTenant(tenantId: string, config?: RateLimitConfig): Promise<RateLimitResult> {
    return this.check(`tenant:${tenantId}`, config);
  }

  async checkByRoute(route: string, config?: RateLimitConfig): Promise<RateLimitResult> {
    return this.check(`route:${route}`, config);
  }
}
