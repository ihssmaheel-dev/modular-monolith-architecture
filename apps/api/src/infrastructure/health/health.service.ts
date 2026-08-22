import { Injectable } from "@nestjs/common";
import { I18nService } from "../i18n/i18n.service";
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
  HealthIndicatorResult,
  HealthIndicator,
} from "@nestjs/terminus";
import { DatabaseService } from "../database";
import { RedisService } from "../redis/redis.service";
import { sql } from "drizzle-orm";

@Injectable()
export class PostgresHealthIndicator extends HealthIndicator {
  constructor(private readonly database: DatabaseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const db = this.database.getDb();
      await (db as unknown as { execute: (q: unknown) => Promise<void> }).execute(sql`SELECT 1`);
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { error: String(error) });
    }
  }
}

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    private readonly redis: RedisService,
    private readonly i18n: I18nService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.redis.getClient();
      if (!client) {
        return this.getStatus(key, true, { message: this.i18n.t("api.health.redisUnconfigured") });
      }
      const pong = await client.ping();
      return pong === "PONG" ? this.getStatus(key, true) : this.getStatus(key, false, { pong });
    } catch {
      return this.getStatus(key, true, {
        message: this.i18n.t("api.health.redisDown"),
      });
    }
  }
}

@Injectable()
export class AppHealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly postgres: PostgresHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.postgres.isHealthy("postgres"),
      () => this.redis.isHealthy("redis"),
    ]);
  }

  @HealthCheck()
  checkReadiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.postgres.isHealthy("postgres"),
      () => this.redis.isHealthy("redis"),
    ]);
  }
}
