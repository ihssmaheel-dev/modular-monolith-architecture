import { Injectable } from "@nestjs/common";
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
  constructor(private readonly redis: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.redis.getClient();
      const pong = await client.ping();
      return pong === "PONG"
        ? this.getStatus(key, true)
        : this.getStatus(key, false, { pong });
    } catch (error) {
      return this.getStatus(key, false, {
        message: "api.error.internal",
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
