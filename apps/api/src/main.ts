import { setGlobalDispatcher, Agent } from "undici";
import "./tracing";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { WsAdapter } from "@nestjs/platform-ws";
import helmet from "@fastify/helmet";
import compress from "@fastify/compress";
import cookie from "@fastify/cookie";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { PinoLoggerService } from "./infrastructure/logger/logger.service";
import { I18nService } from "./infrastructure/i18n/i18n.service";
import { env } from "./config/env";
import { setupSwagger } from "./infrastructure/swagger/swagger";
import { printStartupBanner } from "./common/utils/startup-banner.util";
import { MAX_FILE_SIZE_BYTES } from "@repo/shared";

// Configure high-performance global HTTP agent
setGlobalDispatcher(
  new Agent({
    connections: 100,
    keepAliveTimeout: 15 * 60 * 1000,
  })
);

const MAX_BODY_SIZE_BYTES = 1048576; // 1MB

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: MAX_BODY_SIZE_BYTES,
      trustProxy: true,
    }),
  );

  app
    .getHttpAdapter()
    .getInstance()
    .addContentTypeParser(
      "application/octet-stream",
      { bodyLimit: MAX_FILE_SIZE_BYTES },
      (_request, payload, done) => done(null, payload),
    );

  await app.register(helmet as any, {
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(compress as any, {
    threshold: 1024,
    encodings: ["gzip", "deflate", "br"],
  });

  await app.register(cookie as any, {
    secret: env.JWT_SECRET,
    hook: "onRequest",
  });

  app.useWebSocketAdapter(new WsAdapter(app));

  const logger = app.get(PinoLoggerService);
  const i18n = app.get(I18nService);
  app.useGlobalFilters(new AllExceptionsFilter(logger, i18n));

  app.setGlobalPrefix("api", { exclude: ["metrics"] });
  app.enableCors({
    origin:
      env.NODE_ENV === "production" ? [env.CLIENT_URL] : [env.CLIENT_URL, "http://localhost:3000"],
    credentials: true,
  });

  app.enableShutdownHooks();

  if (env.NODE_ENV !== "production") {
    setupSwagger(app);
  }

  await app.listen(env.PORT, "0.0.0.0");

  printStartupBanner(app, logger);
  logger.info({ port: env.PORT }, "API bootstrap complete");
}

bootstrap();
