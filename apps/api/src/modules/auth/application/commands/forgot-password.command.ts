import { Injectable } from "@nestjs/common";
import { ok, Result } from "neverthrow";
import { generateSecureToken } from "../utils/password.utils";
import type { AuthError } from "../../domain/errors/auth.errors";
import { GetUserByEmailQuery } from "../../../users/application/queries/get-user-by-email.query";
import { EmailService } from "../../../../infrastructure/email/email.service";
import { PasswordResetEmail, render } from "@repo/email";
import { env } from "../../../../config/env";
import * as React from "react";

@Injectable()
export class ForgotPasswordCommand {
  constructor(
    private readonly getUserByEmail: GetUserByEmailQuery,
    private readonly emailService: EmailService,
  ) {}

  async execute(
    email: string,
  ): Promise<Result<void, AuthError>> {
    const result = await this.getUserByEmail.execute(email);
    if (result.isErr() || !result.value) {
      return ok(undefined);
    }

    const resetToken = generateSecureToken();
    const resetLink = `http://localhost:${env.PORT}/reset-password?token=${resetToken}`;
    
    const html = await render(React.createElement(PasswordResetEmail, { resetLink }));

    await this.emailService.send({
      to: email,
      subject: "Password Reset Request",
      html,
    });

    return ok(undefined);
  }
}
