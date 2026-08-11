import { Schema } from "mongoose";
import { MetricsService } from "../../metrics/metrics.service";

export interface MetricsPluginOptions {
  metricsService: MetricsService;
}

interface MetricsContext {
  _startTime?: [number, number];
  model?: { collection?: { name?: string } };
  mongooseCollection?: { name?: string };
}

interface MiddlewareSchema {
  pre(operation: string, handler: (this: MetricsContext) => void): void;
  post(operation: string, handler: (this: MetricsContext) => void): void;
}

const OPERATIONS = [
  "find",
  "findOne",
  "findOneAndUpdate",
  "findOneAndDelete",
  "updateOne",
  "updateMany",
  "save",
  "insertMany",
  "deleteOne",
  "deleteMany",
  "aggregate",
  "countDocuments",
] as const;

const METRIC_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

export function metricsPlugin(schema: Schema, options?: MetricsPluginOptions): void {
  if (!options?.metricsService) return;
  const middleware = schema as unknown as MiddlewareSchema;

  for (const operation of OPERATIONS) {
    middleware.pre(operation, function () {
      this._startTime = process.hrtime();
    });
    middleware.post(operation, function () {
      recordMetric(this, operation, options.metricsService);
    });
  }
}

function recordMetric(context: MetricsContext, operation: string, metrics: MetricsService): void {
  if (!context._startTime) return;
  const diff = process.hrtime(context._startTime);
  const duration = diff[0] + diff[1] / 1e9;
  const collection =
    context.model?.collection?.name ?? context.mongooseCollection?.name ?? "unknown";
  metrics.recordHistogram(
    "db_query_duration_seconds",
    "Duration of database queries in seconds",
    duration,
    { operation, collection },
    METRIC_BUCKETS,
  );
}
