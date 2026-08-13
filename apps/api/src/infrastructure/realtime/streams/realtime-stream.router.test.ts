import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RealtimeConnectionRegistry } from "../connections/realtime-connection.registry";
import { RealtimeStreamRouter } from "./realtime-stream.router";

describe("RealtimeStreamRouter", () => {
  let registry: RealtimeConnectionRegistry;
  let router: RealtimeStreamRouter;

  beforeEach(() => {
    registry = {
      dispatchToAll: vi.fn(),
      dispatchToUser: vi.fn(),
    } as unknown as RealtimeConnectionRegistry;
    router = new RealtimeStreamRouter(registry);
  });

  it("routes broadcasts to every local client", () => {
    const routed = router.route("broadcast", "system.ready", { ready: true });

    expect(routed).toBe(true);
    expect(registry.dispatchToAll).toHaveBeenCalledWith("system.ready", { ready: true });
  });

  it("routes a tenant-scoped user event only to that tenant user", () => {
    const routed = router.route("tenant:tenant-1:user:user-1", "note.created", { id: "note-1" });

    expect(routed).toBe(true);
    expect(registry.dispatchToUser).toHaveBeenCalledWith("user-1", "tenant-1", "note.created", {
      id: "note-1",
    });
  });

  it("routes a single-tenant user event", () => {
    const routed = router.route("user:user-1", "note.deleted", { id: "note-1" });

    expect(routed).toBe(true);
    expect(registry.dispatchToUser).toHaveBeenCalledWith("user-1", undefined, "note.deleted", {
      id: "note-1",
    });
  });

  it("rejects malformed and unsupported targets", () => {
    const malformed = router.route("tenant:tenant-1:user", "note.updated", {});
    const unsupported = router.route("room:all", "note.updated", {});

    expect(malformed).toBe(false);
    expect(unsupported).toBe(false);
    expect(registry.dispatchToAll).not.toHaveBeenCalled();
    expect(registry.dispatchToUser).not.toHaveBeenCalled();
  });
});
