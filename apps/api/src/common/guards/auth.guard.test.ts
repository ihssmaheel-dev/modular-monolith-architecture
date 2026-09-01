import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { ClsService } from "nestjs-cls";
import { ok } from "neverthrow";
import type { GetUserByIdQuery } from "../../modules/users/application/queries/get-user-by-id.query";
import { AuthGuard } from "./auth.guard";
import { verifyAccessToken } from "../utils/access-token.utils";

vi.mock("../../config/env", () => ({
  env: { NODE_ENV: "production", METRICS_TOKEN: "m".repeat(32) },
}));
vi.mock("../utils/access-token.utils", () => ({ verifyAccessToken: vi.fn() }));

describe("AuthGuard", () => {
  let reflector: Reflector;
  let cls: ClsService;
  let guard: AuthGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn().mockReturnValue(false) } as unknown as Reflector;
    cls = { set: vi.fn() } as unknown as ClsService;
    guard = new AuthGuard(reflector, cls);
  });

  it("accepts and stores a verified access-token actor", async () => {
    const actor = { sub: "user-1", email: "user@example.com", role: "user" } as const;
    vi.mocked(verifyAccessToken).mockReturnValue(actor);
    const request = { url: "/api/users", headers: { authorization: "Bearer token" } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request).toHaveProperty("user", actor);
    expect(cls.set).toHaveBeenCalledWith("userId", actor.sub);
  });

  it("rejects a protected route without a valid token", async () => {
    await expect(guard.canActivate(contextFor({ url: "/api/users", headers: {} }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("allows metrics only with the dedicated token", async () => {
    const accepted = contextFor({
      url: "/metrics",
      headers: { authorization: `Bearer ${"m".repeat(32)}` },
    });
    await expect(guard.canActivate(accepted)).resolves.toBe(true);
    await expect(
      guard.canActivate(contextFor({ url: "/metrics", headers: { authorization: "Bearer bad" } })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("rejects a token whose auth version is no longer current", async () => {
    const actor = {
      sub: "user-1",
      email: "user@example.com",
      role: "user",
      authVersion: 1,
    } as const;
    vi.mocked(verifyAccessToken).mockReturnValue(actor);
    const users = {
      execute: vi.fn().mockResolvedValue(ok({ authVersion: 2 })),
    } as unknown as GetUserByIdQuery;
    guard = new AuthGuard(reflector, cls, users);

    await expect(
      guard.canActivate(
        contextFor({ url: "/api/users", headers: { authorization: "Bearer token" } }),
      ),
    ).rejects.toThrow(UnauthorizedException);
    expect(users.execute).toHaveBeenCalledWith(actor.sub);
  });
});

function contextFor(request: object): ExecutionContext {
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}
