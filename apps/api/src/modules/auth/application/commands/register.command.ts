import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import type { AuthResponse } from "@repo/shared";
import type { AuthError } from "../../domain/errors/auth.errors";
import { GetUserByEmailQuery } from "../../../users/application/queries/get-user-by-email.query";
import { CreateUserCommand } from "../../../users/application/commands/create-user.command";
import { signAccessToken, signRefreshToken } from "../utils/jwt.utils";

@Injectable()
export class RegisterCommand {
  constructor(
    private readonly getUserByEmail: GetUserByEmailQuery,
    private readonly createUser: CreateUserCommand,
  ) {}

  async execute(
    data: { name: string; email: string; password: string },
  ): Promise<Result<AuthResponse, AuthError>> {
    const existing = await this.getUserByEmail.execute(data.email);
    if (existing.isErr() || existing.value) {
      return err({ type: "EMAIL_TAKEN" });
    }

    const result = await this.createUser.execute({
      email: data.email,
      name: data.name,
      password: data.password,
    });
    if (result.isErr()) return err({ type: "EMAIL_TAKEN" });

    const user = result.value;
    const accessToken = signAccessToken(user.id, user.email, user.role);
    const refreshToken = signRefreshToken(user.id);

    return ok({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  }
}
