import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { User } from "../../domain/entities/user.entity";
import { UserNotFound } from "../../domain/errors/user.errors";
import { UsersRepository } from "../../infrastructure/users.repository";
import { DistributedCacheService } from "../../../../infrastructure/cache/distributed-cache.service";

@Injectable()
export class GetUserByIdQuery {
  constructor(
    private readonly repository: UsersRepository,
    private readonly cacheService: DistributedCacheService,
  ) {}

  async execute(id: string): Promise<Result<User, UserNotFound>> {
    return this.cacheService.getOrSet(`user:${id}`, 300, async () => {
      const result = await this.repository.findById(id);
      if (result.isErr()) return err(result.error);
      if (!result.value) return err({ type: "USER_NOT_FOUND", userId: id });
      return ok(result.value);
    });
  }
}
