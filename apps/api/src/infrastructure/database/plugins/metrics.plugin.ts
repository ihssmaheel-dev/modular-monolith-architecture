import { Schema } from "mongoose";
import { MetricsService } from "../../metrics/metrics.service";

export interface MetricsPluginOptions {
  metricsService: MetricsService;
}

export function metricsPlugin(schema: Schema, options?: MetricsPluginOptions) {
  if (!options?.metricsService) return;

  const metricsService = options.metricsService;

  const operations = [
    "find",
    "findOne",
    "findOneAndUpdate",
    "findOneAndRemove",
    "findOneAndDelete",
    "update",
    "updateOne",
    "updateMany",
    "save",
    "insertMany",
    "deleteOne",
    "deleteMany",
    "aggregate",
    "count",
    "countDocuments",
    "estimatedDocumentCount",
  ];

  operations.forEach((operation) => {
    schema.pre(operation as any, function (this: any) {
      this._startTime = process.hrtime();
    });

    schema.post(operation as any, function (this: any) {
      if (this._startTime) {
        const diff = process.hrtime(this._startTime);
        const durationInSeconds = diff[0] + diff[1] / 1e9;
        
        // Mongoose query context has model properties
        const collection = this.model?.collection?.name || this.mongooseCollection?.name || "unknown";

        metricsService.recordHistogram(
          "db_query_duration_seconds",
          "Duration of database queries in seconds",
          durationInSeconds,
          {
            operation,
            collection,
          },
          [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
        );
      }
    });
  });
}
