import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { PinoLoggerService } from "./infrastructure/logger/logger.service";
import { env } from "./config/env";

const MAX_BODY_SIZE_BYTES = 1048576; // 1MB
const DEV_CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000"];

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: MAX_BODY_SIZE_BYTES,
      trustProxy: true,
    }),
  );

  const logger = app.get(PinoLoggerService);
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: env.NODE_ENV === "production"
      ? ["https://app.example.com"]
      : DEV_CORS_ORIGINS,
    credentials: true,
  });

  await app.listen(env.PORT);
  logger.info({ port: env.PORT }, "API started");
}

bootstrap();
