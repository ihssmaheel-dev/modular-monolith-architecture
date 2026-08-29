import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module";

describe("API liveness", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    if (process.env.E2E_SKIP === "true") return;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
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
});
