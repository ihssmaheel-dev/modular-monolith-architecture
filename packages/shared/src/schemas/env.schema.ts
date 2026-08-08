import { z } from "zod";

export const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  // URLs
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  API_URL: z.string().url().default("http://localhost:3000"),

  // Database & Cache
  MONGODB_URI: z.string().url().default("mongodb://localhost:27017/monorepo"),
  REDIS_URL: z.string().url().optional(),

  // Auth & Security
  JWT_SECRET: z.string().min(32).default("your-super-secret-jwt-key-change-in-prod"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_TTL: z.coerce.number().default(60),

  // Storage
  STORAGE_DRIVER: z.enum(["s3", "gridfs"]).default("gridfs"),
  S3_ENDPOINT: z.string().default("localhost"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().default("uploads"),
  S3_ACCESS_KEY_ID: z.string().default("minioadmin"),
  S3_SECRET_ACCESS_KEY: z.string().default("minioadmin"),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),

  // CDN
  CDN_ENABLED: z.coerce.boolean().default(false),
  CDN_DOMAIN: z.string().optional(),
  CDN_BUCKET_PATH: z.string().default("uploads"),

  // Email
  EMAIL_DRIVER: z.enum(["resend", "smtp"]).default("smtp"),
  RESEND_API_KEY: z.string().default(""),
  EMAIL_FROM: z.string().email().default("noreply@example.com"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
});

export type Env = z.infer<typeof envSchema>;
