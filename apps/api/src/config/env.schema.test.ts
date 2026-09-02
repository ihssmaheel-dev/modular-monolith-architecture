import { describe, expect, it } from "vitest";
import { envSchema } from "@repo/contracts";

describe("production environment validation", () => {
  it("rejects local service defaults in production", () => {
    const result = envSchema.safeParse({ NODE_ENV: "production" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["DATABASE_URL", "CLIENT_URL", "API_URL", "S3_ENDPOINT"]),
      );
    }
  });

  it("requires provider-specific email configuration", () => {
    const result = envSchema.safeParse({ ...validProductionEnv(), EMAIL_DRIVER: "resend" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "RESEND_API_KEY")).toBe(true);
    }
  });

  it("accepts a complete production configuration", () => {
    const result = envSchema.safeParse(validProductionEnv());

    expect(result.success).toBe(true);
  });

  it("rejects insecure public endpoints in production", () => {
    const result = envSchema.safeParse({
      ...validProductionEnv(),
      CLIENT_URL: "http://app.example.test",
      API_URL: "http://api.example.test",
      S3_ENDPOINT: "http://storage.example.test",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["CLIENT_URL", "API_URL", "S3_ENDPOINT"]),
      );
    }
  });

  it("requires encrypted database and Redis connections in production", () => {
    const result = envSchema.safeParse({
      ...validProductionEnv(),
      DATABASE_URL: "postgres://db.internal:5432/app",
      REDIS_URL: "redis://redis.internal:6379",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["DATABASE_URL", "REDIS_URL"]),
      );
    }
  });

  it("rejects untouched production placeholders and example domains", () => {
    const result = envSchema.safeParse({
      ...validProductionEnv(),
      JWT_SECRET: "replace-with-at-least-32-random-characters",
      CLIENT_URL: "https://app.example.com",
      EMAIL_FROM: "noreply@example.com",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["JWT_SECRET", "CLIENT_URL", "EMAIL_FROM"]),
      );
    }
  });

  it("rejects the local development SMTP port in production", () => {
    const result = envSchema.safeParse({ ...validProductionEnv(), SMTP_PORT: "1025" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("SMTP_PORT");
    }
  });
});

function validProductionEnv(): Record<string, string> {
  return {
    NODE_ENV: "production",
    DATABASE_URL: "postgres://db.internal:5432/app?sslmode=require",
    CLIENT_URL: "https://app.example.test",
    API_URL: "https://api.example.test",
    REDIS_URL: "rediss://redis.internal:6379",
    METRICS_TOKEN: "m".repeat(32),
    JWT_SECRET: "j".repeat(32),
    JWT_REFRESH_SECRET: "r".repeat(32),
    S3_ENDPOINT: "https://storage.example.test",
    S3_REGION: "us-east-1",
    S3_BUCKET: "production-uploads",
    S3_ACCESS_KEY_ID: "production-access",
    S3_SECRET_ACCESS_KEY: "production-secret",
    EMAIL_DRIVER: "smtp",
    EMAIL_FROM: "noreply@company.test",
    SMTP_HOST: "smtp.company.test",
    SMTP_PORT: "587",
  };
}
