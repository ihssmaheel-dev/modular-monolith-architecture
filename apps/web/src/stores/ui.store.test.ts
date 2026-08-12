import { beforeEach, describe, expect, it } from "vitest";

import { useUIStore } from "./ui.store";

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.getState().setSidebarOpen(true);
  });

  it("toggles sidebar visibility", () => {
    useUIStore.getState().toggleSidebar();

    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it("sets sidebar visibility explicitly", () => {
    useUIStore.getState().setSidebarOpen(false);

    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });
});
