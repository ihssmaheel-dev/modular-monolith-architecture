import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),

  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),

  // Storage
  STORAGE_DRIVER: z.enum(["s3", "gridfs"]).default("gridfs"),
  S3_ENDPOINT: z.string().default("localhost"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("uploads"),
  S3_ACCESS_KEY_ID: z.string().default("minioadmin"),
  S3_SECRET_ACCESS_KEY: z.string().default("minioadmin"),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),

  // Email
  EMAIL_DRIVER: z.enum(["resend", "smtp"]).default("smtp"),
  RESEND_API_KEY: z.string().default(""),
  EMAIL_FROM: z.string().email().default("noreply@example.com"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),

  // WebSocket
  WS_CORS_ORIGINS: z.string().default("http://localhost:5173"),
});

export type Env = z.infer<typeof envSchema>;
