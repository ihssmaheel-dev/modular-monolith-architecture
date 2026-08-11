import { Global, Module } from "@nestjs/common";
import { EventEmitter2, EventEmitterModule } from "@nestjs/event-emitter";
import { MongooseModule } from "@nestjs/mongoose";
import { MetricsModule } from "../metrics/metrics.module";
import { MetricsService } from "../metrics/metrics.service";
import { TenantContextService } from "./context/tenant-context.service";
import { createDatabaseOptions } from "./database-connection.factory";
import { DatabaseService } from "./database.service";

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [EventEmitterModule, MetricsModule],
      inject: [EventEmitter2, MetricsService],
      useFactory: createDatabaseOptions,
    }),
  ],
  providers: [DatabaseService, TenantContextService],
  exports: [DatabaseService, TenantContextService],
})
export class DatabaseModule {}
