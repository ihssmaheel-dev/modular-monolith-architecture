import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import jwt from "jsonwebtoken";
import { env } from "../../../../config/env";
import type { AuthResponse } from "@repo/shared";
import type { AuthError } from "../../domain/errors/auth.errors";
import { GetUserByIdQuery } from "../../../users/application/queries/get-user-by-id.query";
import { signAccessToken, signRefreshToken } from "../utils/jwt.utils";

@Injectable()
export class RefreshTokensCommand {
  constructor(private readonly getUserById: GetUserByIdQuery) {}

  async execute(
    refreshToken: string,
  ): Promise<Result<AuthResponse, AuthError>> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { sub: string; type: string };
      if (decoded.type !== "refresh") return err({ type: "INVALID_TOKEN" });

      const result = await this.getUserById.execute(decoded.sub);
      if (result.isErr() || !result.value) {
        return err({ type: "USER_NOT_FOUND" });
      }

      const user = result.value;
      const newAccessToken = signAccessToken(user.id, user.email, user.role);
      const newRefreshToken = signRefreshToken(user.id);

      return ok({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
      });
    } catch {
      return err({ type: "INVALID_TOKEN" });
    }
  }
}
