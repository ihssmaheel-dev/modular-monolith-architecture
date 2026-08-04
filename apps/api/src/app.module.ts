import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventEmitterModule, EventEmitter2 } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { ClsModule } from "nestjs-cls";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { NotesModule } from "./modules/notes/notes.module";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { QueueModule } from "./infrastructure/queue/queue.module";
import { LoggerModule } from "./infrastructure/logger/logger.module";
import { WorkersModule } from "./infrastructure/workers/workers.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { CacheModule } from "./infrastructure/cache/cache.module";
import { StorageModule } from "./infrastructure/storage/storage.module";
import { EmailModule } from "./infrastructure/email/email.module";
import { RealtimeModule } from "./infrastructure/realtime/realtime.module";
import { SessionModule } from "./infrastructure/session/session.module";
import { HealthModule } from "./infrastructure/health/health.module";
import { RateLimitModule } from "./infrastructure/rate-limit/rate-limit.module";
import { WafModule } from "./infrastructure/waf/waf.module";
import { I18nModule } from "./infrastructure/i18n/i18n.module";
import { AuditModule } from "./infrastructure/audit/audit.module";
import { OutboxModule } from "./infrastructure/outbox/outbox.module";
import { auditPlugin } from "./infrastructure/database/plugins/audit.plugin";
import { env } from "./config/env";

import { APP_INTERCEPTOR, APP_GUARD } from "@nestjs/core";
import { MetricsModule } from "./infrastructure/metrics/metrics.module";
import { MetricsInterceptor } from "./infrastructure/metrics/metrics.interceptor";
import { TracingInterceptor } from "./infrastructure/tracing/tracing.interceptor";
import { AuthGuard, PermissionsGuard, IdempotencyInterceptor } from "./common";

@Module({
  imports: [
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [EventEmitterModule],
      inject: [EventEmitter2],
      useFactory: (eventEmitter: EventEmitter2) => ({
        uri: env.MONGODB_URI,
        connectionFactory: (connection) => {
          connection.plugin(auditPlugin, { eventEmitter });
          return connection;
        },
      }),
    }),
    RedisModule,
    QueueModule,
    LoggerModule,
    WorkersModule,
    DatabaseModule,
    CacheModule,
    StorageModule,
    EmailModule,
    RealtimeModule,
    SessionModule,
    HealthModule,
    RateLimitModule,
    WafModule,
    I18nModule,
    MetricsModule,
    AuditModule,
    OutboxModule,
    UsersModule,
    AuthModule,
    NotesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule {}
