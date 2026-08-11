import type { EventEmitter2 } from "@nestjs/event-emitter";
import type { MongooseModuleOptions } from "@nestjs/mongoose";
import type { Connection } from "mongoose";
import { env } from "../../config/env";
import type { MetricsService } from "../metrics/metrics.service";
import { auditPlugin } from "./plugins/audit.plugin";
import { metricsPlugin } from "./plugins/metrics.plugin";

export function createDatabaseOptions(
  eventEmitter: EventEmitter2,
  metricsService: MetricsService,
): MongooseModuleOptions {
  return {
    uri: env.MONGODB_URI,
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    minPoolSize: env.MONGODB_MIN_POOL_SIZE,
    serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
    heartbeatFrequencyMS: env.MONGODB_HEARTBEAT_FREQUENCY_MS,
    connectionFactory: (connection: Connection) => {
      connection.plugin(auditPlugin, { eventEmitter });
      connection.plugin(metricsPlugin, { metricsService });
      return connection;
    },
  };
}
