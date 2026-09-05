import { Injectable, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import Redis from "ioredis";
import { env } from "../../config/env";
import { PinoLoggerService } from "../logger/logger.service";

const MAX_RETRIES_PER_REQUEST = 3;
const RETRY_DELAY_MULTIPLIER = 200;
const MAX_RETRY_DELAY = 2000;

@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  private client: Redis | null = null;
  private logger: PinoLoggerService;

  constructor(logger: PinoLoggerService) {
    this.logger = logger.child({ module: "RedisService" });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async connect(): Promise<Redis | null> {
    if (this.client) return this.client;
    if (!env.REDIS_URL) {
      this.logger.warn({}, "REDIS_URL not provided. Redis dependents will be disabled.");
      return null;
    }

    try {
      const client = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: MAX_RETRIES_PER_REQUEST,
        retryStrategy(times) {
          if (times > MAX_RETRIES_PER_REQUEST) return null; // Stop retrying on boot failure
          return Math.min(times * RETRY_DELAY_MULTIPLIER, MAX_RETRY_DELAY);
        },
      });
      client.on("error", (error) => {
        this.logger.error({ error }, "Redis client error");
      });
      this.client = client;

      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          client.off("error", onInitialError);
          resolve();
        };
        const onInitialError = (error: Error) => {
          client.off("ready", onReady);
          reject(error);
        };
        client.once("ready", onReady);
        client.once("error", onInitialError);
      });
      return client;
    } catch (error) {
      this.logger.error(
        { error },
        "Failed to connect to Redis on startup. Redis dependents will be disabled.",
      );
      if (this.client) {
        this.client.disconnect();
        this.client = null;
      }
      return null;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  async onApplicationShutdown(): Promise<void> {
    const client = this.client;
    this.client = null;
    if (!client) return;
    try {
      await client.quit();
    } catch (error) {
      this.logger.warn({ error }, "Redis client did not quit cleanly");
      client.disconnect();
    }
  }
}
