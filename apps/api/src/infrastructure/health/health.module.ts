import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { AppHealthService, MongoHealthIndicator, RedisHealthIndicator } from "./health.service";
import { ShutdownService } from "./shutdown.service";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [AppHealthService, MongoHealthIndicator, RedisHealthIndicator, ShutdownService],
})
export class HealthModule {}
