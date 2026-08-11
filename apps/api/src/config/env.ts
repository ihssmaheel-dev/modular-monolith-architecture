import "dotenv/config";
import { envSchema, type Env } from "@repo/shared";

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const details = JSON.stringify(result.error.flatten().fieldErrors);
    throw new Error(`Invalid environment variables: ${details}`);
  }

  return result.data;
}

export const env = loadEnv();
