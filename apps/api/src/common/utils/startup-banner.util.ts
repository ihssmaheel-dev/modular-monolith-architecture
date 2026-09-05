import { INestApplication } from "@nestjs/common";

import { blue, green, yellow, bold, cyan, dim } from "colorette";
import { API_DOCS_PATH } from "@repo/contracts";
import { env } from "../../config/env";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";

export function printStartupBanner(app: INestApplication, logger: PinoLoggerService): void {
  const redisService = app.get(RedisService);
  const redisConnected = !!redisService.getClient();
  const redisStatus = redisConnected ? green("[OK] Connected") : yellow("[!] Disabled (Optional)");
  const postgresStatus = green("[OK] Connected");

  const bannerContent = `
${bold(blue("API SERVER IS RUNNING"))}
${dim("----------------------------")}
${bold("Environment")} : ${cyan(env.NODE_ENV)}
${bold("Port")}        : ${cyan(env.PORT.toString())}
${bold("Postgres")}    : ${postgresStatus}
${bold("Redis")}       : ${redisStatus}
${bold("Storage")}     : ${cyan(env.STORAGE_DRIVER.toUpperCase())}
${bold("Email")}       : ${cyan(env.EMAIL_DRIVER.toUpperCase())}
${bold("API Docs")}    : ${cyan(`${env.API_URL}${API_DOCS_PATH}`)}
  `.trim();

  logger.info({}, "\n" + bannerContent + "\n");
}
