import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import {
  AppHealthService,
  PostgresHealthIndicator,
  RedisHealthIndicator,
  OutboxHealthIndicator,
} from "./health.service";
import { ShutdownService } from "./shutdown.service";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    AppHealthService,
    PostgresHealthIndicator,
    RedisHealthIndicator,
    OutboxHealthIndicator,
    ShutdownService,
  ],
})
export class HealthModule {}
