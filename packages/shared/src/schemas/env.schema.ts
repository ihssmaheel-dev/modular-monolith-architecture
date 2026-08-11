import { z } from "zod";

const DEFAULT_JWT_SECRET = "your-super-secret-jwt-key-change-in-prod";
const DEFAULT_REFRESH_SECRET = "your-super-secret-refresh-key-change-in-prod";

export const envSchema = z
  .object({
    // Core
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

    // URLs
    CLIENT_URL: z.string().url().default("http://localhost:5173"),
    API_URL: z.string().url().default("http://localhost:3000"),

    // Database & Cache
    MONGODB_URI: z
      .string()
      .url()
      .default("mongodb://admin:password@localhost:27017/app?authSource=admin"),
    MONGODB_MAX_POOL_SIZE: z.coerce.number().default(10),
    MONGODB_MIN_POOL_SIZE: z.coerce.number().default(2),
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().default(5000),
    MONGODB_HEARTBEAT_FREQUENCY_MS: z.coerce.number().default(10000),
    REDIS_URL: z.string().url().optional(),

    // Auth & Security
    JWT_SECRET: z.string().min(32).default(DEFAULT_JWT_SECRET),
    JWT_REFRESH_SECRET: z.string().min(32).default(DEFAULT_REFRESH_SECRET),
    METRICS_TOKEN: z.string().min(32).optional(),
    JWT_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

    // Rate Limiting
    RATE_LIMIT_MAX: z.coerce.number().default(100),
    RATE_LIMIT_TTL: z.coerce.number().default(60),

    // Account Lockout
    LOCKOUT_MAX_ATTEMPTS: z.coerce.number().default(5),
    LOCKOUT_DURATION_MINUTES: z.coerce.number().default(15),

    // Tracing
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().default("http://localhost:4318/v1/traces"),

    // Storage
    STORAGE_DRIVER: z.enum(["s3", "gridfs"]).default("s3"),
    S3_ENDPOINT: z.string().url().default("http://localhost:9000"),
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

    // Optional one-time administrative seed
    SEED_ADMIN_EMAIL: z.string().email().optional(),
    SEED_ADMIN_PASSWORD: z.string().min(12).optional(),
  })
  .superRefine((env, context) => {
    if (env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
      context.addIssue({
        code: "custom",
        path: ["JWT_REFRESH_SECRET"],
        message: "JWT access and refresh secrets must differ",
      });
    }
    if (Boolean(env.SEED_ADMIN_EMAIL) !== Boolean(env.SEED_ADMIN_PASSWORD)) {
      context.addIssue({
        code: "custom",
        path: ["SEED_ADMIN_PASSWORD"],
        message: "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set together",
      });
    }

    if (env.NODE_ENV !== "production") return;
    if (!env.REDIS_URL) {
      context.addIssue({
        code: "custom",
        path: ["REDIS_URL"],
        message: "REDIS_URL must be set in production",
      });
    }
    if (!env.METRICS_TOKEN) {
      context.addIssue({
        code: "custom",
        path: ["METRICS_TOKEN"],
        message: "METRICS_TOKEN must be set in production",
      });
    }
    if (env.JWT_SECRET === DEFAULT_JWT_SECRET) {
      context.addIssue({
        code: "custom",
        path: ["JWT_SECRET"],
        message: "JWT_SECRET must be set in production",
      });
    }
    if (env.JWT_REFRESH_SECRET === DEFAULT_REFRESH_SECRET) {
      context.addIssue({
        code: "custom",
        path: ["JWT_REFRESH_SECRET"],
        message: "JWT_REFRESH_SECRET must be set in production",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;
