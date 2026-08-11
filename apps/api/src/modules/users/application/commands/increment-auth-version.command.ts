import { Injectable } from "@nestjs/common";
import { err, ok, Result } from "neverthrow";
import { User } from "../../domain/entities/user.entity";
import type { UserNotFound } from "../../domain/errors/user.errors";
import { UsersRepository } from "../../infrastructure/users.repository";
import { DistributedCacheService } from "../../../../infrastructure/cache/distributed-cache.service";

@Injectable()
export class IncrementAuthVersionCommand {
  constructor(
    private readonly repository: UsersRepository,
    private readonly cacheService: DistributedCacheService,
  ) {}

  async execute(userId: string): Promise<Result<User, UserNotFound>> {
    const result = await this.repository.incrementAuthVersion(userId);
    if (result.isErr() || !result.value) {
      return err({ type: "USER_NOT_FOUND", userId });
    }
    await this.cacheService.invalidateGlobal(`user:${userId}`);
    return ok(result.value);
  }
}
