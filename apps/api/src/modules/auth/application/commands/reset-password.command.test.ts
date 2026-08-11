import { beforeEach, describe, expect, it, vi } from "vitest";
import { err, ok } from "neverthrow";
import { User } from "../../../users/domain/entities/user.entity";
import { ResetUserPasswordCommand } from "../../../users/application/commands/reset-user-password.command";
import { SessionService } from "../../../../infrastructure/session/session.service";
import { ResetPasswordCommand } from "./reset-password.command";

const USER = User.fromPersistence({
  id: "user-123",
  email: "test@example.com",
  name: "Test",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("ResetPasswordCommand", () => {
  let command: ResetPasswordCommand;
  let resetUserPassword: ResetUserPasswordCommand;
  let sessionService: SessionService;

  beforeEach(() => {
    resetUserPassword = { execute: vi.fn() } as unknown as ResetUserPasswordCommand;
    sessionService = { revokeAllForUser: vi.fn() } as unknown as SessionService;
    command = new ResetPasswordCommand(resetUserPassword, sessionService);
  });

  it("rejects an invalid or expired token", async () => {
    vi.mocked(resetUserPassword.execute).mockResolvedValue(
      err({ type: "INVALID_PASSWORD_RESET_TOKEN" }),
    );

    const result = await command.execute("invalid-token", "new-password");

    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.type).toBe("INVALID_TOKEN");
    expect(sessionService.revokeAllForUser).not.toHaveBeenCalled();
  });

  it("revokes every session after changing the password", async () => {
    vi.mocked(resetUserPassword.execute).mockResolvedValue(ok(USER));

    const result = await command.execute("valid-token", "new-password");

    expect(result.isOk()).toBe(true);
    expect(sessionService.revokeAllForUser).toHaveBeenCalledWith(USER.id);
  });
});
