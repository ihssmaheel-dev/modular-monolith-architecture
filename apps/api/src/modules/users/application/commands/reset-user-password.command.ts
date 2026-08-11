import { Injectable } from "@nestjs/common";
import { PASSWORD_HASH_ROUNDS } from "@repo/shared";
import bcrypt from "bcryptjs";
import { err, ok, Result } from "neverthrow";
import { User } from "../../domain/entities/user.entity";
import type { InvalidPasswordResetToken } from "../../domain/errors/user.errors";
import { UsersRepository } from "../../infrastructure/users.repository";
import { DistributedCacheService } from "../../../../infrastructure/cache/distributed-cache.service";

@Injectable()
export class ResetUserPasswordCommand {
  constructor(
    private readonly repository: UsersRepository,
    private readonly cacheService: DistributedCacheService,
  ) {}

  async execute(
    tokenHash: string,
    newPassword: string,
  ): Promise<Result<User, InvalidPasswordResetToken>> {
    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS);
    const result = await this.repository.resetPasswordByToken(tokenHash, passwordHash);
    if (result.isErr() || !result.value) {
      return err({ type: "INVALID_PASSWORD_RESET_TOKEN" });
    }
    await this.cacheService.invalidateGlobal(`user:${result.value.id}`);
    return ok(result.value);
  }
}
