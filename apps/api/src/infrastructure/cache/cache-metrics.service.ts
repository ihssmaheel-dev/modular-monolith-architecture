import { Injectable } from "@nestjs/common";
import { MetricsService } from "../metrics/metrics.service";

export type CacheLayer = "memory" | "redis";
export type CacheMetricEvent = "hit" | "miss" | "set" | "evict";

@Injectable()
export class CacheMetricsService {
  constructor(private readonly metricsService: MetricsService) {}

  recordHit(layer: CacheLayer) {
    this.record(layer, "hit");
  }

  recordMiss(layer: CacheLayer) {
    this.record(layer, "miss");
  }

  recordSet(layer: CacheLayer) {
    this.record(layer, "set");
  }

  recordEvict(layer: CacheLayer, count = 1) {
    this.record(layer, "evict", count);
  }

  private record(layer: CacheLayer, event: CacheMetricEvent, count = 1) {
    this.metricsService.incrementCounter(
      "cache_operations_total",
      "Total number of cache operations",
      count,
      { operation: event, layer }
    );
  }
}
