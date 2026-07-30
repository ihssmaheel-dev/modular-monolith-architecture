import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { User } from "../../domain/entities/user.entity";
import { UserNotFound } from "../../domain/errors/user.errors";
import { UsersRepository } from "../../infrastructure/users.repository";

@Injectable()
export class GetUserByIdQuery {
  constructor(private readonly repository: UsersRepository) {}

  async execute(id: string): Promise<Result<User, UserNotFound>> {
    const result = await this.repository.findById(id);
    if (result.isErr()) return err(result.error);
    if (!result.value) return err({ type: "USER_NOT_FOUND", userId: id });
    return ok(result.value);
  }
}
