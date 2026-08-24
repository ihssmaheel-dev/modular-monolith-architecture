import { beforeEach, describe, expect, it, vi } from "vitest";
import { RealtimeAuthListener } from "./realtime-auth.listener";
import type { RealtimeService } from "../realtime.service";
import type { PinoLoggerService } from "../../logger/logger.service";

describe("RealtimeAuthListener", () => {
  let listener: RealtimeAuthListener;
  let mockRealtime: RealtimeService;
  let mockLogger: PinoLoggerService;

  beforeEach(() => {
    mockRealtime = {
      disconnectUser: vi.fn().mockReturnValue(2),
    } as unknown as RealtimeService;

    mockLogger = {
      child: vi.fn().mockReturnThis(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as PinoLoggerService;

    listener = new RealtimeAuthListener(mockRealtime, mockLogger);
  });

  it("disconnects realtime sessions on user.auth-version.incremented", () => {
    listener.handleAuthVersionIncremented({ userId: "user-123" });
    expect(mockRealtime.disconnectUser).toHaveBeenCalledWith("user-123");
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it("disconnects realtime sessions on user.password.reset", () => {
    listener.handlePasswordReset({ userId: "user-456" });
    expect(mockRealtime.disconnectUser).toHaveBeenCalledWith("user-456");
  });

  it("disconnects realtime sessions on auth.session.revoked", () => {
    listener.handleSessionRevoked({ userId: "user-789" });
    expect(mockRealtime.disconnectUser).toHaveBeenCalledWith("user-789");
  });

  it("ignores invalid empty payload without throwing", () => {
    listener.handleAuthVersionIncremented({} as { userId: string });
    expect(mockRealtime.disconnectUser).not.toHaveBeenCalled();
  });
});
