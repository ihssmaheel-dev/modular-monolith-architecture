import { Injectable } from "@nestjs/common";
import { err, ok, Result } from "neverthrow";
import type { AuthError } from "../../domain/errors/auth.errors";
import { ResetUserPasswordCommand } from "../../../users/application/commands/reset-user-password.command";
import { SessionService } from "../../../../infrastructure/session/session.service";
import { hashPasswordResetToken } from "../utils/password.utils";

@Injectable()
export class ResetPasswordCommand {
  constructor(
    private readonly resetUserPassword: ResetUserPasswordCommand,
    private readonly sessionService: SessionService,
  ) {}

  async execute(token: string, newPassword: string): Promise<Result<void, AuthError>> {
    const result = await this.resetUserPassword.execute(hashPasswordResetToken(token), newPassword);
    if (result.isErr()) return err({ type: "INVALID_TOKEN" });

    await this.sessionService.revokeAllForUser(result.value.id);
    return ok(undefined);
  }
}
