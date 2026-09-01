import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module";
import { env } from "./config/env";

describe("API liveness", () => {
  let app: NestFastifyApplication;
  let pool: Pool | undefined;
  const originalTenancyMode = env.TENANCY_MODE;

  beforeAll(async () => {
    if (process.env.E2E_SKIP === "true") return;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix("api");
    await app.init();
    pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    env.TENANCY_MODE = originalTenancyMode;
    await pool?.end();
    await app?.close();
  });

  it("returns a liveness response without database dependencies", async () => {
    if (process.env.E2E_SKIP === "true") return;
    const response = await app.getHttpAdapter().getInstance().inject({
      method: "GET",
      url: "/api/health/live",
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });

  it.each(["single", "multi"] as const)(
    "registers a global user and outbox event in %s-tenant mode",
    async (mode) => {
      if (process.env.E2E_SKIP === "true" || !pool) return;
      env.TENANCY_MODE = mode;
      const email = `registration-${mode}-${crypto.randomUUID()}@example.com`;
      const response = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: "POST",
          url: "/api/auth/register",
          payload: { name: `Registration ${mode}`, email, password: "Password123!" },
        });

      expect(response.statusCode).toBe(201);
      expect(response.json().user.email).toBe(email);
      const events = await pool.query(
        "SELECT tenant_id, payload FROM public.outbox_events WHERE topic = $1 AND payload->>'email' = $2 ORDER BY created_at DESC LIMIT 1",
        ["user.created", email],
      );
      expect(events.rows).toHaveLength(1);
      expect(events.rows[0].tenant_id).toBeNull();
      expect(events.rows[0].payload.email).toBe(email);
    },
  );
});
