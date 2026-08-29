import { setGlobalDispatcher, Agent } from "undici";
import { randomUUID } from "node:crypto";
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
import { setupApiDocs } from "./infrastructure/api-docs";
import { printStartupBanner } from "./common/utils/startup-banner.util";
import { MAX_FILE_SIZE_BYTES } from "@repo/contracts";
import { ClsService } from "nestjs-cls";

// Configure high-performance global HTTP agent
setGlobalDispatcher(
  new Agent({
    connections: 100,
    keepAliveTimeout: 15 * 60 * 1000,
  }),
);

const MAX_BODY_SIZE_BYTES = 1048576; // 1MB

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: MAX_BODY_SIZE_BYTES,
      trustProxy: env.TRUST_PROXY,
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

  await app.register(helmet as unknown as never, {
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(compress as unknown as never, {
    threshold: 1024,
    encodings: ["gzip", "deflate", "br"],
  });

  await app.register(cookie as unknown as never, {
    secret: env.JWT_SECRET,
    hook: "onRequest",
  });

  app
    .getHttpAdapter()
    .getInstance()
    .addHook("onRequest", (request, reply, done) => {
      const requestCookies = request as typeof request & {
        cookies?: Record<string, string | undefined>;
      };
      const replyWithCookies = reply as typeof reply & {
        setCookie: (name: string, value: string, options: Record<string, unknown>) => void;
      };
      if (!requestCookies.cookies?.["XSRF-TOKEN"]) {
        replyWithCookies.setCookie("XSRF-TOKEN", randomUUID(), {
          httpOnly: false,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 24 * 60 * 60,
        });
      }
      done();
    });

  // Register API docs BEFORE global prefix/versioning so /api/docs is not versioned
  if (env.NODE_ENV !== "production") {
    await setupApiDocs(app);
  }

  app.useWebSocketAdapter(new WsAdapter(app));

  const logger = app.get(PinoLoggerService);
  const i18n = app.get(I18nService);
  app.useGlobalFilters(new AllExceptionsFilter(logger, i18n, app.get(ClsService)));

  app.setGlobalPrefix("api", { exclude: ["metrics", "docs", "api/docs"] });
  app.enableCors({
    origin:
      env.NODE_ENV === "production"
        ? [env.CLIENT_URL]
        : (origin, callback) => {
            if (
              !origin ||
              /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
              origin === env.CLIENT_URL
            ) {
              callback(null, true);
            } else {
              callback(null, false);
            }
          },
    credentials: true,
    allowedHeaders:
      "authorization,content-type,accept,origin,x-requested-with,x-tenant-id,idempotency-key,accept-language,x-xsrf-token,x-csrf-token,scalar-origin",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    maxAge: 86400,
  });

  app.enableShutdownHooks();

  await app.listen(env.PORT, "0.0.0.0");

  printStartupBanner(app, logger);
  logger.info({ port: env.PORT }, "API bootstrap complete");
}

bootstrap();
