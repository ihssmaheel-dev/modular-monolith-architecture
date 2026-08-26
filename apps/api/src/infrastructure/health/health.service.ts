import { Injectable } from "@nestjs/common";
import { I18nService } from "../i18n/i18n.service";
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
  HealthIndicatorResult,
  HealthIndicatorService,
  MemoryHealthIndicator,
} from "@nestjs/terminus";
import { DatabaseService } from "../database";
import { RedisService } from "../redis/redis.service";
import { sql } from "drizzle-orm";

@Injectable()
export class PostgresHealthIndicator {
  constructor(
    private readonly database: DatabaseService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const session = this.healthIndicatorService.check(key);
    try {
      const db = this.database.getDb();
      await (db as unknown as { execute: (q: unknown) => Promise<void> }).execute(sql`SELECT 1`);
      return session.up();
    } catch (error) {
      return session.down({ error: String(error) });
    }
  }
}

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly redis: RedisService,
    private readonly i18n: I18nService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const session = this.healthIndicatorService.check(key);
    try {
      const client = this.redis.getClient();
      if (!client) {
        return session.up({ message: this.i18n.t("api.health.redisUnconfigured") });
      }
      const pong = await client.ping();
      return pong === "PONG" ? session.up() : session.down({ pong });
    } catch {
      return session.up({
        message: this.i18n.t("api.health.redisDown"),
      });
    }
  }
}

@Injectable()
export class OutboxHealthIndicator {
  constructor(
    private readonly database: DatabaseService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const session = this.healthIndicatorService.check(key);
    try {
      const db = this.database.getDb();
      const result = await (
        db as unknown as { execute: (q: unknown) => Promise<Array<{ count: string | number }>> }
      ).execute(sql`SELECT count(*)::int AS count FROM outbox_events WHERE status = 'PENDING'`);
      const pendingCount = Number(result[0]?.count ?? 0);
      const isHealthy = pendingCount < 5000;
      return isHealthy ? session.up({ pendingCount }) : session.down({ pendingCount });
    } catch (error) {
      return session.down({ error: String(error) });
    }
  }
}

@Injectable()
export class AppHealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly postgres: PostgresHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly outbox: OutboxHealthIndicator,
  ) {}

  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memory.checkHeap("memory_heap", 500 * 1024 * 1024),
      () => this.postgres.isHealthy("postgres"),
      () => this.redis.isHealthy("redis"),
    ]);
  }

  @HealthCheck()
  checkReadiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.postgres.isHealthy("postgres"),
      () => this.redis.isHealthy("redis"),
      () => this.outbox.isHealthy("outbox_queue"),
    ]);
  }
}
