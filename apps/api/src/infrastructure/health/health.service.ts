import { Injectable } from "@nestjs/common";
import { I18nService } from "../i18n/i18n.service";
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
  HealthIndicatorResult,
  HealthIndicator,
} from "@nestjs/terminus";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class MongoHealthIndicator extends HealthIndicator {
  constructor(@InjectConnection() private readonly connection: Connection) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const readyState = this.connection.readyState;
    const isConnected = readyState === 1;
    return isConnected
      ? this.getStatus(key, true)
      : this.getStatus(key, false, { readyState });
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
      return pong === "PONG"
        ? this.getStatus(key, true)
        : this.getStatus(key, false, { pong });
    } catch (error) {
      // Return healthy but degraded so K8s doesn't kill the pod
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
    private readonly mongo: MongoHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.mongo.isHealthy("mongo"), () => this.redis.isHealthy("redis")]);
  }

  @HealthCheck()
  checkReadiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.mongo.isHealthy("mongo"),
      () => this.redis.isHealthy("redis"),
    ]);
  }
}
