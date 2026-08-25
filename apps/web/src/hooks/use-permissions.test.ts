import { describe, expect, it, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermissions } from "./use-permissions";
import { useAuthStore } from "@/stores/auth.store";
import { Permissions } from "@repo/shared";

describe("usePermissions Hook", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("returns empty permissions when unauthenticated", () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.permissions).toEqual([]);
    expect(result.current.can(Permissions.NOTES_CREATE)).toBe(false);
    expect(result.current.cannot(Permissions.NOTES_CREATE)).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns user permissions when logged in as user", () => {
    useAuthStore.getState().login({
      user: {
        id: "u1",
        email: "user@test.com",
        name: "Test User",
        role: "user",
      },
    });

    const { result } = renderHook(() => usePermissions());
    expect(result.current.can(Permissions.NOTES_CREATE)).toBe(true);
    expect(result.current.can(Permissions.USERS_DELETE)).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("grants all permissions to admin", () => {
    useAuthStore.getState().login({
      user: {
        id: "admin1",
        email: "admin@test.com",
        name: "Admin User",
        role: "admin",
      },
    });

    const { result } = renderHook(() => usePermissions());
    expect(result.current.can(Permissions.USERS_DELETE)).toBe(true);
    expect(result.current.can("billing:manage")).toBe(true);
    expect(result.current.isAdmin).toBe(true);
  });
});
