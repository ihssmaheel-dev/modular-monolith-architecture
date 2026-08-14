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
  constructor(private readonly redis: RedisService) {}

  async check(key: string, config: RateLimitConfig = {}): Promise<RateLimitResult> {
    const windowSeconds = config.windowSeconds ?? DEFAULT_WINDOW_SECONDS;
    const maxRequests = config.maxRequests ?? DEFAULT_MAX_REQUESTS;
    const now = Date.now();
    const windowStart = now - windowSeconds * MS_PER_SECOND;
    const redisKey = `${SLIDING_WINDOW_LOG_PREFIX}${key}`;

    const client = this.redis.getClient();
    if (!client) {
      // If Redis is down, gracefully bypass rate limiting
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: Math.ceil((now + windowSeconds * MS_PER_SECOND) / MS_PER_SECOND),
      };
    }

    const script = `
      redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[1])
      redis.call('ZADD', KEYS[1], ARGV[2], ARGV[3])
      local count = redis.call('ZCARD', KEYS[1])
      redis.call('EXPIRE', KEYS[1], ARGV[4])
      return count
    `;

    const count = (await client.eval(
      script,
      1,
      redisKey,
      windowStart.toString(),
      now.toString(),
      `${now}:${crypto.randomUUID()}`,
      windowSeconds.toString()
    )) as number;

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
