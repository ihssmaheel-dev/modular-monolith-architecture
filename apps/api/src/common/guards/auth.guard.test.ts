import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExecutionContext } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { ClsService } from "nestjs-cls";
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

  it("accepts and stores a verified access-token actor", () => {
    const actor = { sub: "user-1", email: "user@example.com", role: "user" } as const;
    vi.mocked(verifyAccessToken).mockReturnValue(actor);
    const request = { url: "/api/users", headers: { authorization: "Bearer token" } };

    expect(guard.canActivate(contextFor(request))).toBe(true);
    expect(request).toHaveProperty("user", actor);
    expect(cls.set).toHaveBeenCalledWith("userId", actor.sub);
  });

  it("rejects a protected route without a valid token", () => {
    expect(() => guard.canActivate(contextFor({ url: "/api/users", headers: {} }))).toThrow(
      UnauthorizedException,
    );
  });

  it("allows metrics only with the dedicated token", () => {
    const accepted = contextFor({
      url: "/metrics",
      headers: { authorization: `Bearer ${"m".repeat(32)}` },
    });
    expect(guard.canActivate(accepted)).toBe(true);
    expect(() =>
      guard.canActivate(contextFor({ url: "/metrics", headers: { authorization: "Bearer bad" } })),
    ).toThrow(UnauthorizedException);
  });
});

function contextFor(request: object): ExecutionContext {
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}
