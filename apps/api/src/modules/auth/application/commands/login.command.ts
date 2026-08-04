import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import type { AuthResponse } from "@repo/shared";
import type { AuthError } from "../../domain/errors/auth.errors";
import { VerifyUserCredentialsQuery } from "../../../users/application/queries/verify-user-credentials.query";
import { signAccessToken, signRefreshToken } from "../utils/jwt.utils";
import { MetricsService } from "../../../../infrastructure/metrics/metrics.service";

@Injectable()
export class LoginCommand {
  constructor(
    private readonly verifyCredentials: VerifyUserCredentialsQuery,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(
    data: { email: string; password: string },
  ): Promise<Result<AuthResponse, AuthError>> {
    const result = await this.verifyCredentials.execute(data.email, data.password);
    if (result.isErr() || !result.value) {
      this.metricsService.incrementCounter("auth_failed_logins_total", "Total number of failed logins");
      return err({ type: "INVALID_CREDENTIALS" });
    }

    const user = result.value;
    const accessToken = signAccessToken(user.id, user.email, user.role);
    const refreshToken = signRefreshToken(user.id);

    this.metricsService.incrementCounter("auth_successful_logins_total", "Total number of successful logins");

    return ok({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  }
}
