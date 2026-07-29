import { envSchema, type Env } from "@repo/shared";
import pino from "pino";

const logger = pino({ level: "silent" });

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    logger.error({ errors: result.error.flatten().fieldErrors }, "Invalid environment variables");
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
