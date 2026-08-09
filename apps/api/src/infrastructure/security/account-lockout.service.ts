import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";
import { env } from "../../config/env";

const LOCKOUT_PREFIX = "lockout:";

@Injectable()
export class AccountLockoutService {
  private logger: PinoLoggerService;

  constructor(
    private readonly redis: RedisService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "AccountLockoutService" });
  }

  async isLockedOut(email: string): Promise<boolean> {
    const client = this.redis.getClient();
    if (!client) return false;

    const key = `${LOCKOUT_PREFIX}${email}`;
    const attempts = await client.get(key);
    if (!attempts) return false;

    if (Number(attempts) >= env.LOCKOUT_MAX_ATTEMPTS) {
      const ttl = await client.ttl(key);
      if (ttl > 0) {
        this.logger.warn({ email, attempts: Number(attempts), ttl }, "Account locked out");
        return true;
      }
      await client.del(key);
    }
    return false;
  }

  async recordFailedAttempt(email: string): Promise<void> {
    const client = this.redis.getClient();
    if (!client) return;

    const key = `${LOCKOUT_PREFIX}${email}`;
    const current = await client.incr(key);
    const ttlSeconds = env.LOCKOUT_DURATION_MINUTES * 60;

    if (current === 1) {
      await client.expire(key, ttlSeconds);
    }

    this.logger.warn({ email, attempts: current }, "Failed login attempt recorded");
  }

  async resetAttempts(email: string): Promise<void> {
    const client = this.redis.getClient();
    if (!client) return;

    await client.del(`${LOCKOUT_PREFIX}${email}`);
  }
}
