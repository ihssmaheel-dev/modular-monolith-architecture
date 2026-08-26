import { describe, expect, it, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuthorization } from "./use-authorization";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";

describe("useAuthorization Hook", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    useTenantStore.getState().clearTenant();
  });

  it("denies access when unauthenticated", () => {
    const { result } = renderHook(() => useAuthorization());
    expect(result.current.can("notes:create")).toBe(false);
    expect(result.current.cannot("notes:create")).toBe(true);
  });

  it("allows resource owner to update their own resource (ReBAC)", () => {
    useAuthStore.getState().login({
      user: {
        id: "alice-1",
        email: "alice@test.com",
        name: "Alice",
        role: "user",
      },
    });
    useTenantStore.getState().selectTenant("tenant-1");

    const { result } = renderHook(() => useAuthorization());
    const ownNote = { id: "note-1", type: "note", ownerId: "alice-1", tenantId: "tenant-1" };
    const otherNote = { id: "note-2", type: "note", ownerId: "bob-2", tenantId: "tenant-1" };

    expect(result.current.can("notes:update", ownNote)).toBe(true);
    expect(result.current.can("notes:update", otherNote)).toBe(true); // member role has RBAC notes:update in same tenant
  });

  it("denies access on cross-tenant resource", () => {
    useAuthStore.getState().login({
      user: {
        id: "alice-1",
        email: "alice@test.com",
        name: "Alice",
        role: "user",
      },
    });
    useTenantStore.getState().selectTenant("tenant-1");

    const { result } = renderHook(() => useAuthorization());
    const crossTenantNote = { id: "note-3", type: "note", ownerId: "alice-1", tenantId: "tenant-other" };

    expect(result.current.can("notes:read", crossTenantNote)).toBe(false);
  });
});
