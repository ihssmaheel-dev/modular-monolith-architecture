import { Injectable } from "@nestjs/common";
import { err, ok, Result } from "neverthrow";
import type { UserNotFound } from "../../domain/errors/user.errors";
import { UsersRepository } from "../../infrastructure/users.repository";

@Injectable()
export class SetPasswordResetTokenCommand {
  constructor(private readonly repository: UsersRepository) {}

  async execute(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<Result<void, UserNotFound>> {
    const result = await this.repository.setPasswordResetToken(userId, tokenHash, expiresAt);
    if (result.isErr() || !result.value) return err({ type: "USER_NOT_FOUND", userId });
    return ok(undefined);
  }
}
