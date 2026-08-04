import { Module, Global } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { DistributedCacheService } from "./distributed-cache.service";

@Global()
@Module({
  providers: [CacheService, DistributedCacheService],
  exports: [CacheService, DistributedCacheService],
})
export class CacheModule {}
