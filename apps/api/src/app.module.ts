import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { UsersModule } from "./modules/users/users.module";
import { RedisModule } from "./infrastructure/redis/redis.module";
import { QueueModule } from "./infrastructure/queue/queue.module";
import { LoggerModule } from "./infrastructure/logger/logger.module";
import { env } from "./config/env";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(env.MONGODB_URI),
    RedisModule,
    QueueModule,
    LoggerModule,
    UsersModule,
  ],
})
export class AppModule {}
