import { beforeEach, describe, expect, it } from "vitest";

import { useTenantStore } from "./tenant.store";

describe("useTenantStore", () => {
  beforeEach(() => {
    useTenantStore.getState().clearTenant();
  });

  it("selects an active tenant", () => {
    useTenantStore.getState().selectTenant("tenant-1");

    expect(useTenantStore.getState().activeTenantId).toBe("tenant-1");
  });

  it("clears an active tenant", () => {
    useTenantStore.getState().selectTenant("tenant-1");

    useTenantStore.getState().clearTenant();

    expect(useTenantStore.getState().activeTenantId).toBeNull();
  });
});
