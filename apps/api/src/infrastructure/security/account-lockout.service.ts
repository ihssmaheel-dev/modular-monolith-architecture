import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";
import { env } from "../../config/env";

const LOCKOUT_PREFIX = "lockout:";

interface InMemoryAttempt {
  count: number;
  expiresAt: number;
}

@Injectable()
export class AccountLockoutService {
  private readonly memoryStore = new Map<string, InMemoryAttempt>();
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly redis: RedisService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "AccountLockoutService" });
  }

  async isLockedOut(email: string): Promise<boolean> {
    const client = this.redis.getClient();
    if (!client) {
      const entry = this.memoryStore.get(email);
      if (!entry) return false;
      if (Date.now() > entry.expiresAt) {
        this.memoryStore.delete(email);
        return false;
      }
      if (entry.count >= env.LOCKOUT_MAX_ATTEMPTS) {
        this.logger.warn({ email, attempts: entry.count }, "Account locked out (memory fallback)");
        return true;
      }
      return false;
    }

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
    const ttlSeconds = env.LOCKOUT_DURATION_MINUTES * 60;

    if (!client) {
      const now = Date.now();
      const existing = this.memoryStore.get(email);
      if (!existing || now > existing.expiresAt) {
        this.memoryStore.set(email, { count: 1, expiresAt: now + ttlSeconds * 1000 });
      } else {
        existing.count += 1;
      }
      this.logger.warn(
        { email, attempts: this.memoryStore.get(email)?.count },
        "Failed login recorded (memory)",
      );
      return;
    }

    const key = `${LOCKOUT_PREFIX}${email}`;
    const current = await client.incr(key);

    if (current === 1) {
      await client.expire(key, ttlSeconds);
    }

    this.logger.warn({ email, attempts: current }, "Failed login attempt recorded");
  }

  async resetAttempts(email: string): Promise<void> {
    const client = this.redis.getClient();
    if (!client) {
      this.memoryStore.delete(email);
      return;
    }

    await client.del(`${LOCKOUT_PREFIX}${email}`);
  }
}
