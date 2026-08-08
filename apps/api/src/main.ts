import "./tracing";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { WsAdapter } from "@nestjs/platform-ws";
import helmet from "@fastify/helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { PinoLoggerService } from "./infrastructure/logger/logger.service";
import { I18nService } from "./infrastructure/i18n/i18n.service";
import { env } from "./config/env";
import { setupSwagger } from "./config/swagger";
import { printStartupBanner } from "./common/utils/startup-banner.util";

const MAX_BODY_SIZE_BYTES = 1048576; // 1MB

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: MAX_BODY_SIZE_BYTES,
      trustProxy: true,
    }),
  );

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
  });

  app.useWebSocketAdapter(new WsAdapter(app));

  const logger = app.get(PinoLoggerService);
  const i18n = app.get(I18nService);
  app.useGlobalFilters(new AllExceptionsFilter(logger, i18n));

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: env.NODE_ENV === "production"
      ? [env.CLIENT_URL]
      : [env.CLIENT_URL, "http://localhost:3000"],
    credentials: true,
  });

  app.enableShutdownHooks();

  if (env.NODE_ENV !== "production") {
    setupSwagger(app);
  }

  await app.listen(env.PORT, "0.0.0.0");
  
  printStartupBanner(app);
  logger.info({ port: env.PORT }, "API bootstrap complete");
}

bootstrap();
