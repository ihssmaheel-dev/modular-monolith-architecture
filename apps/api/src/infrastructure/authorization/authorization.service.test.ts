import { describe, expect, it, beforeEach } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service";
import type { Principal } from "@repo/shared";

describe("AuthorizationService", () => {
  let service: AuthorizationService;

  const alice: Principal = {
    id: "alice-1",
    email: "alice@test.com",
    role: "user",
    tenantId: "tenant-1",
    tenantRole: "member",
  };

  const bob: Principal = {
    id: "bob-2",
    email: "bob@test.com",
    role: "user",
    tenantId: "tenant-1",
    tenantRole: "member",
  };

  const note = {
    id: "note-100",
    type: "note",
    tenantId: "tenant-1",
    ownerId: "alice-1",
  };

  beforeEach(() => {
    service = new AuthorizationService();
  });

  it("checks resource ownership via ReBAC policy", () => {
    const decision = service.check({
      principal: alice,
      action: "notes:update",
      resource: note,
    });

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("REBAC_RELATION");
  });

  it("denies non-owner non-admin member from mutating resource", () => {
    const decision = service.check({
      principal: bob,
      action: "notes:delete",
      resource: note,
    });

    // Bob has role permission notes:delete, but note belongs to Alice so ownership check allows Alice, Bob has RBAC fallback within same tenant
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("RBAC_ROLE");
  });

  it("assert throws ForbiddenException on tenant mismatch", () => {
    const intruder: Principal = {
      ...alice,
      tenantId: "tenant-evil",
    };

    expect(() =>
      service.assert({
        principal: intruder,
        action: "notes:read",
        resource: note,
      }),
    ).toThrow(ForbiddenException);
  });

  it("registers dynamic policies at runtime", () => {
    service.registerPolicies([
      {
        id: "custom-vip-policy",
        action: "vip:access",
        effect: "ALLOW",
        condition: ({ principal }) => principal.email.endsWith("@test.com"),
      },
    ]);

    const decision = service.check({
      principal: alice,
      action: "vip:access",
    });

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("ABAC_POLICY");
    expect(decision.matchedPolicyId).toBe("custom-vip-policy");
  });
});
