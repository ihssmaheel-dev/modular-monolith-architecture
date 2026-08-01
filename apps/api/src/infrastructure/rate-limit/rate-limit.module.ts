import { Module, Global, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { RateLimitService } from "./rate-limit.service";
import { RateLimitMiddleware } from "./rate-limit.middleware";

@Global()
@Module({
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class RateLimitModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes("{*path}");
  }
}
