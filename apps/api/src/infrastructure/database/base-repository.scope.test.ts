import { afterEach, describe, expect, it, vi } from "vitest";
import type { ClsService } from "nestjs-cls";
import { env } from "../../config/env";
import { applyCreateScope, applyRepositoryScope } from "./base-repository.scope";

const originalMode = env.TENANCY_MODE;

describe("repository tenant scope", () => {
  afterEach(() => {
    env.TENANCY_MODE = originalMode;
  });

  it("leaves tenant-owned filters unchanged in single mode", () => {
    env.TENANCY_MODE = "single";
    expect(applyRepositoryScope({ status: "active" }, "tenant")).toEqual({ status: "active" });
  });

  it("overrides caller-supplied tenant IDs in multi mode", () => {
    env.TENANCY_MODE = "multi";
    const cls = contextWithTenant("trusted-tenant");
    expect(applyRepositoryScope({ tenantId: "attacker-tenant" }, "tenant", cls)).toEqual({
      tenantId: "trusted-tenant",
    });
  });

  it("adds the active tenant to created records", () => {
    env.TENANCY_MODE = "multi";
    const cls = contextWithTenant("tenant-1");
    expect(applyCreateScope({ title: "Scoped" }, "tenant", cls)).toEqual({
      title: "Scoped",
      tenantId: "tenant-1",
    });
  });

  it("fails closed when a multi-tenant context is missing", () => {
    env.TENANCY_MODE = "multi";
    expect(() => applyRepositoryScope({}, "tenant")).toThrow();
  });
});

function contextWithTenant(tenantId: string): ClsService {
  return { get: vi.fn().mockReturnValue(tenantId) } as unknown as ClsService;
}
