import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ClsModule } from "nestjs-cls";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
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
import { env } from "./config/env";

@Module({
  imports: [
    ClsModule.forRoot({ global: true, middleware: { mount: true } }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(env.MONGODB_URI),
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
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
