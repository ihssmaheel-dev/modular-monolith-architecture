import { Test } from "@nestjs/testing";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import cookie from "@fastify/cookie";
import { randomUUID } from "node:crypto";
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
    env.TENANCY_MODE = "multi";
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.register(cookie as unknown as never, {
      secret: env.JWT_SECRET,
      hook: "onRequest",
    });
    app
      .getHttpAdapter()
      .getInstance()
      .addHook("onRequest", (request, reply, done) => {
        const requestWithCookies = request as typeof request & {
          cookies?: Record<string, string | undefined>;
        };
        const replyWithCookies = reply as typeof reply & {
          setCookie: (name: string, value: string, options: Record<string, unknown>) => void;
        };
        const cookies = requestWithCookies.cookies;
        if (!cookies?.["XSRF-TOKEN"]) {
          replyWithCookies.setCookie("XSRF-TOKEN", randomUUID(), {
            httpOnly: false,
            secure: false,
            sameSite: "strict",
            path: "/",
          });
        }
        done();
      });
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

  it("serves the tenancy status through REST and oRPC transports", async () => {
    if (process.env.E2E_SKIP === "true") return;
    const instance = app.getHttpAdapter().getInstance();
    const [rest, orpc] = await Promise.all([
      instance.inject({ method: "GET", url: "/api/tenancy/status" }),
      instance.inject({ method: "GET", url: "/api/rpc/tenancy/status" }),
    ]);

    expect(rest.statusCode).toBe(200);
    expect(orpc.statusCode).toBe(200);
    expect(orpc.json()).toEqual(rest.json());
  });

  it("enforces authentication on REST and oRPC resource routes", async () => {
    if (process.env.E2E_SKIP === "true") return;
    const instance = app.getHttpAdapter().getInstance();
    const [rest, orpc] = await Promise.all([
      instance.inject({ method: "GET", url: "/api/notes" }),
      instance.inject({ method: "GET", url: "/api/rpc/notes" }),
    ]);

    expect(rest.statusCode).toBe(401);
    expect(orpc.statusCode).toBe(401);
    expect(orpc.json()).toMatchObject({ defined: false, status: 401 });
  });

  it.each(protectedParityRoutes())(
    "keeps unauthenticated %s %s aligned across REST and oRPC",
    async (method, restPath, rpcPath, payload) => {
      if (process.env.E2E_SKIP === "true") return;
      const instance = app.getHttpAdapter().getInstance();
      const [rest, orpc] = await Promise.all([
        instance.inject({ method, url: restPath, payload }),
        instance.inject({ method, url: rpcPath, payload }),
      ]);
      expect(rest.statusCode).toBe(401);
      expect(orpc.statusCode).toBe(401);
      expect(orpc.json()).toMatchObject({ status: 401 });
    },
  );

  it("bootstraps a session from the refresh cookie after access expiry", async () => {
    if (process.env.E2E_SKIP === "true") return;
    const instance = app.getHttpAdapter().getInstance();
    const registration = await instance.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        name: "Cookie Owner",
        email: `cookie-${crypto.randomUUID()}@example.com`,
        password: "Password123!",
      },
    });
    expect(registration.statusCode).toBe(201);
    const setCookies = registration.headers["set-cookie"];
    const cookies: string[] = Array.isArray(setCookies)
      ? setCookies
      : setCookies
        ? [setCookies]
        : [];
    const refreshCookie = cookies.find((value) => value.startsWith("refresh_token="));
    const xsrfCookie = cookies.find((value) => value.startsWith("XSRF-TOKEN="));
    if (!refreshCookie || !xsrfCookie) throw new Error("Authentication cookies were not set");
    expect(refreshCookie).toContain("Path=/api");
    const xsrf = xsrfCookie.split(";", 1)[0] ?? "";
    const refreshed = await instance.inject({
      method: "POST",
      url: "/api/rpc/auth/refresh",
      headers: {
        cookie: `${refreshCookie.split(";", 1)[0]}; ${xsrf}`,
        "x-xsrf-token": xsrf.split("=", 1)[1] ?? "",
      },
      payload: {},
    });
    expect(refreshed.statusCode).toBe(200);
    expect(refreshed.json()).toHaveProperty("accessToken");
  });

  it("creates a multi-tenant organization through both transports", async () => {
    if (process.env.E2E_SKIP === "true" || !pool) return;
    const instance = app.getHttpAdapter().getInstance();
    const email = `organization-${crypto.randomUUID()}@example.com`;
    const registration = await instance.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Organization Owner", email, password: "Password123!" },
    });
    expect(registration.statusCode).toBe(201);
    const token = (registration.json() as { accessToken: string }).accessToken;
    const headers = {
      authorization: `Bearer ${token}`,
      "idempotency-key": crypto.randomUUID(),
    };
    const [rest, orpc] = await Promise.all([
      instance.inject({
        method: "POST",
        url: "/api/tenancy/organizations",
        headers,
        payload: { name: "REST Organization" },
      }),
      instance.inject({
        method: "POST",
        url: "/api/rpc/tenancy/organizations",
        headers: { ...headers, "idempotency-key": crypto.randomUUID() },
        payload: { name: "oRPC Organization" },
      }),
    ]);

    expect(rest.statusCode).toBe(201);
    expect(orpc.statusCode).toBe(201);
    expect(rest.json()).toMatchObject({ name: "REST Organization" });
    expect(orpc.json()).toMatchObject({ name: "oRPC Organization" });
    const memberships = await pool.query(
      "SELECT COUNT(*)::int AS count FROM public.memberships WHERE user_id = $1",
      [(registration.json() as { user: { id: string } }).user.id],
    );
    expect(Number(memberships.rows[0]?.count)).toBe(2);
  });

  it("keeps REST and oRPC validation errors semantically aligned", async () => {
    if (process.env.E2E_SKIP === "true") return;
    const instance = app.getHttpAdapter().getInstance();
    const payload = { email: "invalid", password: "short" };
    const [rest, orpc] = await Promise.all([
      instance.inject({ method: "POST", url: "/api/auth/login", payload }),
      instance.inject({ method: "POST", url: "/api/rpc/auth/login", payload }),
    ]);

    expect(rest.statusCode).toBe(400);
    expect(orpc.statusCode).toBe(400);
    const restBody = rest.json() as { code: string; i18nKey: string; fieldErrors: unknown };
    const orpcBody = orpc.json() as {
      code: string;
      i18nKey: string;
      fieldErrors: unknown;
      data: { code: string; i18nKey: string; fieldErrors: unknown };
    };
    expect(orpcBody.data).toMatchObject(restBody);
    expect(orpcBody.code).toBe(restBody.code);
    expect(orpcBody.i18nKey).toBe(restBody.i18nKey);
    expect(orpcBody.fieldErrors).toEqual(restBody.fieldErrors);
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

function protectedParityRoutes(): Array<
  ["GET" | "POST" | "PATCH" | "DELETE", string, string, Record<string, unknown> | undefined]
> {
  return [
    ["GET", "/api/notes", "/api/rpc/notes", undefined],
    ["GET", "/api/notes/note-1", "/api/rpc/notes/note-1", undefined],
    ["POST", "/api/notes", "/api/rpc/notes", { title: "Title", content: "Content" }],
    ["PATCH", "/api/notes/note-1", "/api/rpc/notes/note-1", { title: "Updated" }],
    ["DELETE", "/api/notes/note-1", "/api/rpc/notes/note-1", undefined],
    ["GET", "/api/users", "/api/rpc/users", undefined],
    ["GET", "/api/users/user-1", "/api/rpc/users/user-1", undefined],
    ["PATCH", "/api/users/user-1", "/api/rpc/users/user-1", { name: "Updated" }],
    [
      "POST",
      "/api/users",
      "/api/rpc/users",
      { email: "a@b.com", name: "A", password: "Password123!" },
    ],
    ["DELETE", "/api/users/user-1", "/api/rpc/users/user-1", undefined],
    ["POST", "/api/tenancy/organizations", "/api/rpc/tenancy/organizations", { name: "Org" }],
    ["GET", "/api/tenancy/organizations", "/api/rpc/tenancy/organizations", undefined],
    ["GET", "/api/tenancy/members", "/api/rpc/tenancy/members", undefined],
    ["PATCH", "/api/tenancy/members/user-1", "/api/rpc/tenancy/members/user-1", { role: "member" }],
    ["DELETE", "/api/tenancy/members/user-1", "/api/rpc/tenancy/members/user-1", undefined],
    [
      "POST",
      "/api/tenancy/invitations",
      "/api/rpc/tenancy/invitations",
      { email: "a@b.com", role: "member" },
    ],
    ["GET", "/api/tenancy/invitations", "/api/rpc/tenancy/invitations", undefined],
    [
      "POST",
      "/api/tenancy/invitations/accept",
      "/api/rpc/tenancy/invitations/accept",
      { token: "token" },
    ],
    ["GET", "/api/files", "/api/rpc/files", undefined],
    [
      "POST",
      "/api/files/upload-url",
      "/api/rpc/files/upload-url",
      { fileName: "a.txt", contentType: "text/plain", fileSize: 1, parentType: "general" },
    ],
    ["POST", "/api/files/confirm", "/api/rpc/files/confirm", { fileKey: "uploads/key" }],
    ["GET", "/api/files/file-1", "/api/rpc/files/file-1", undefined],
    ["GET", "/api/files/file-1/download-url", "/api/rpc/files/file-1/download-url", undefined],
    ["DELETE", "/api/files/file-1", "/api/rpc/files/file-1", undefined],
    ["GET", "/api/auth/me", "/api/rpc/auth/me", undefined],
    ["POST", "/api/auth/logout", "/api/rpc/auth/logout", undefined],
  ];
}
