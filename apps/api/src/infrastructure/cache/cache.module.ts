import { Module, Global } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { DistributedCacheService } from "./distributed-cache.service";
import { CacheMetricsService } from "./cache-metrics.service";

@Global()
@Module({
  providers: [CacheService, DistributedCacheService, CacheMetricsService],
  exports: [CacheService, DistributedCacheService, CacheMetricsService],
})
export class CacheModule {}
