import { Module, Global, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { WafMiddleware } from "./waf.middleware";

@Global()
@Module({})
export class WafModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WafMiddleware).forRoutes("{*path}");
  }
}
