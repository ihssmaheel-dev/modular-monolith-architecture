import { beforeEach, describe, expect, it, vi } from "vitest";
import { err, ok } from "neverthrow";
import { SessionService } from "../../../../infrastructure/session/session.service";
import { IncrementAuthVersionCommand } from "../../../users/application/commands/increment-auth-version.command";
import { User } from "../../../users/domain/entities/user.entity";
import { LogoutCommand } from "./logout.command";

const USER = User.fromPersistence({
  id: "user-1",
  email: "user@example.com",
  name: "User",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("LogoutCommand", () => {
  let incrementAuthVersion: IncrementAuthVersionCommand;
  let sessionService: SessionService;
  let events: { emitAsync: ReturnType<typeof vi.fn> };
  let command: LogoutCommand;

  beforeEach(() => {
    incrementAuthVersion = { execute: vi.fn() } as unknown as IncrementAuthVersionCommand;
    sessionService = { revokeAllForUser: vi.fn() } as unknown as SessionService;
    events = { emitAsync: vi.fn().mockResolvedValue([]) };
    command = new LogoutCommand(incrementAuthVersion, sessionService, events as never);
  });

  it("invalidates refresh tokens and server sessions", async () => {
    vi.mocked(incrementAuthVersion.execute).mockResolvedValue(ok(USER));

    const result = await command.execute(USER.id);

    expect(result.isOk()).toBe(true);
    expect(sessionService.revokeAllForUser).toHaveBeenCalledWith(USER.id);
    expect(events.emitAsync).toHaveBeenCalledWith("auth.session.revoked", { userId: USER.id });
  });

  it("rejects an identity that no longer exists", async () => {
    vi.mocked(incrementAuthVersion.execute).mockResolvedValue(
      err({ type: "USER_NOT_FOUND", userId: USER.id }),
    );

    const result = await command.execute(USER.id);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe("INVALID_TOKEN");
    expect(sessionService.revokeAllForUser).not.toHaveBeenCalled();
  });
});
