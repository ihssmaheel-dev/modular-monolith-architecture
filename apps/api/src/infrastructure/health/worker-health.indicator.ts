import { Injectable } from "@nestjs/common";
import { HealthIndicatorResult, HealthIndicatorService } from "@nestjs/terminus";
import { env } from "../../config/env";
import { I18nService } from "../i18n/i18n.service";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class WorkerHealthIndicator {
  constructor(
    private readonly redis: RedisService,
    private readonly i18n: I18nService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const session = this.healthIndicatorService.check(key);
    if (env.NODE_ENV !== "production" || env.PROCESS_ROLE === "worker") return session.up();
    const client = this.redis.getClient();
    if (!client) return this.down(session);
    try {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await client.scan(
          cursor,
          "MATCH",
          "worker:heartbeat:*",
          "COUNT",
          "100",
        );
        if (keys.length > 0) return session.up();
        cursor = nextCursor;
      } while (cursor !== "0");
      return this.down(session);
    } catch {
      return this.down(session);
    }
  }

  private down(session: ReturnType<HealthIndicatorService["check"]>): HealthIndicatorResult {
    return session.down({ message: this.i18n.t("api.health.workerUnavailable") });
  }
}
