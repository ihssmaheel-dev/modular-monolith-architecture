import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "./auth.store";

const user = { id: "user-1", email: "user@example.com", name: "User", role: "user" } as const;

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("records the authenticated user on login", () => {
    useAuthStore.getState().login({ user });

    expect(useAuthStore.getState()).toMatchObject({ user, isAuthenticated: true });
  });

  it("clears authentication state on logout", () => {
    useAuthStore.getState().login({ user });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState()).toMatchObject({ user: null, isAuthenticated: false });
  });
});
