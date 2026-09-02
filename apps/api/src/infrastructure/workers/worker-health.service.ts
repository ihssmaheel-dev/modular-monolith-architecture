import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import os from "node:os";
import { env } from "../../config/env";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";

const HEARTBEAT_INTERVAL_MS = 10_000;
const HEARTBEAT_TTL_SECONDS = 30;

@Injectable()
export class WorkerHealthService implements OnModuleInit, OnModuleDestroy {
  private readonly key = `worker:heartbeat:${os.hostname()}:${process.pid}`;
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly redis: RedisService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "WorkerHealthService" });
  }

  onModuleInit(): void {
    if (env.PROCESS_ROLE !== "api") void this.beat();
  }

  @Interval(HEARTBEAT_INTERVAL_MS)
  async beat(): Promise<void> {
    if (env.PROCESS_ROLE === "api") return;
    const client = this.redis.getClient();
    if (!client) return;
    try {
      await client.set(this.key, new Date().toISOString(), "EX", HEARTBEAT_TTL_SECONDS);
    } catch (error) {
      this.logger.warn({ error }, "Worker heartbeat failed");
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis
      .getClient()
      ?.del(this.key)
      .catch(() => undefined);
  }
}
