import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { UsersModule } from "./modules/users/users.module";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { QueueModule } from "./infrastructure/queue/queue.module";
import { LoggerModule } from "./infrastructure/logger/logger.module";
import { WorkersModule } from "./infrastructure/workers/workers.module";
import { DatabaseModule } from "./infrastructure/database/database.module";
import { CacheModule } from "./infrastructure/cache/cache.module";
import { StorageModule } from "./infrastructure/storage/storage.module";
import { EmailModule } from "./infrastructure/email/email.module";
import { RealtimeModule } from "./infrastructure/realtime/realtime.module";
import { env } from "./config/env";

@Module({
  imports: [
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
    UsersModule,
  ],
})
export class AppModule {}
