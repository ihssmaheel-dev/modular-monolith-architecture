import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { PinoLoggerService } from "./infrastructure/logger/logger.service";
import { env } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const logger = app.get(PinoLoggerService);
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.setGlobalPrefix("api");
  app.enableCors();

  await app.listen(env.PORT);
  logger.info({ port: env.PORT }, "API started");
}

bootstrap();
