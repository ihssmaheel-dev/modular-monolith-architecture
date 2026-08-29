import { BadRequestException, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { ClsService } from "nestjs-cls";
import { afterEach, describe, expect, it, vi } from "vitest";
import { err, ok } from "neverthrow";
import { env } from "../../config/env";
import type { ResolveTenantAccessQuery } from "../../modules/tenancy/application/queries/resolve-tenant-access.query";
import { TenantContextGuard } from "./tenant-context.guard";

const originalMode = env.TENANCY_MODE;

describe("TenantContextGuard", () => {
  afterEach(() => {
    env.TENANCY_MODE = originalMode;
  });

  it("activates single mode without requiring a tenant", async () => {
    env.TENANCY_MODE = "single";
    const { guard, request, cls } = createGuard();

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.tenant).toEqual({ mode: "single" });
    expect(cls.set).toHaveBeenCalledWith("tenantMode", "single");
  });

  it("resolves membership and stores the trusted tenant context", async () => {
    env.TENANCY_MODE = "multi";
    const tenant = {
      mode: "multi" as const,
      tenantId: "507f1f77bcf86cd799439011",
      membershipId: "membership-1",
      role: "admin" as const,
    };
    const { guard, request, resolver, cls } = createGuard(tenant.tenantId);
    vi.mocked(resolver.execute).mockResolvedValue(ok(tenant));

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(resolver.execute).toHaveBeenCalledWith("user-1", tenant.tenantId);
    expect(cls.set).toHaveBeenCalledWith("tenantRole", "admin");
  });

  it("rejects a missing tenant in multi mode", async () => {
    env.TENANCY_MODE = "multi";
    const { guard, request, resolver } = createGuard();
    vi.mocked(resolver.execute).mockResolvedValue(err({ type: "TENANT_REQUIRED" }));

    await expect(guard.canActivate(contextFor(request))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

function createGuard(tenantId?: string) {
  const reflector = {
    getAllAndOverride: vi.fn().mockReturnValue(false),
  } as unknown as Reflector;
  const resolver = { execute: vi.fn() } as unknown as ResolveTenantAccessQuery;
  const cls = { set: vi.fn(), get: vi.fn() } as unknown as ClsService;
  const i18n = {
    t: vi.fn().mockReturnValue("translated"),
  } as unknown as import("../../infrastructure/i18n/i18n.service").I18nService;
  const request = {
    headers: tenantId ? { "x-tenant-id": tenantId } : {},
    user: { sub: "user-1", email: "user@example.com", role: "user" as const },
    tenant: undefined as unknown,
  };
  return { guard: new TenantContextGuard(reflector, resolver, cls, i18n), request, resolver, cls };
}

function contextFor(request: object): ExecutionContext {
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: vi.fn().mockReturnValue({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}
