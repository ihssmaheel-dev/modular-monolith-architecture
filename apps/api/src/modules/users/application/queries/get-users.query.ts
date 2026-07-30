import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { User } from "../../domain/entities/user.entity";
import { UsersRepository } from "../../infrastructure/users.repository";
import { paginate } from "@repo/shared";

@Injectable()
export class GetUsersQuery {
  constructor(private readonly repository: UsersRepository) {}

  async execute(
    page?: number,
    limit?: number,
  ): Promise<Result<{ users: User[]; total: number; page: number; limit: number }, never>> {
    const { skip, page: p, limit: l } = paginate(page, limit);
    const result = await this.repository.findAll({ skip, limit: l });
    if (result.isErr()) return err(result.error);
    return ok({ users: result.value.users, total: result.value.total, page: p, limit: l });
  }
}
