import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { User } from "../../domain/entities/user.entity";
import { UserNotFound } from "../../domain/errors/user.errors";
import { UsersRepository } from "../../infrastructure/users.repository";
import { Cacheable } from "../../../../infrastructure/cache/cache.decorators";

@Injectable()
export class GetUserByIdQuery {
  constructor(private readonly repository: UsersRepository) {}

  @Cacheable((id: string) => `user:${id}`)
  async execute(id: string): Promise<Result<User, UserNotFound>> {
    const result = await this.repository.findById(id);
    if (result.isErr()) return err(result.error);
    if (!result.value) return err({ type: "USER_NOT_FOUND", userId: id });
    return ok(result.value);
  }
}
