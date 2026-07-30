import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import bcrypt from "bcryptjs";
import { User } from "../../domain/entities/user.entity";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByIdQuery } from "./get-user-by-id.query";

@Injectable()
export class VerifyUserCredentialsQuery {
  constructor(
    private readonly repository: UsersRepository,
    private readonly getUserById: GetUserByIdQuery,
  ) {}

  async execute(email: string, password: string): Promise<Result<User | null, never>> {
    const result = await this.repository.findByEmailWithPassword(email);
    if (result.isErr()) return err(result.error);
    if (!result.value) return ok(null);

    const passwordValid = await bcrypt.compare(password, result.value.passwordHash);
    if (!passwordValid) return ok(null);

    const userResult = await this.getUserById.execute(result.value._id.toString());
    if (userResult.isErr()) return ok(null);
    return ok(userResult.value);
  }
}
