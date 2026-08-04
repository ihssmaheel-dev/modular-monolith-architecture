import { Injectable } from "@nestjs/common";
import { ok, Result } from "neverthrow";
import { generateSecureToken } from "../utils/password.utils";
import type { AuthError } from "../../domain/errors/auth.errors";
import { GetUserByEmailQuery } from "../../../users/application/queries/get-user-by-email.query";
import { EmailService } from "../../../../infrastructure/email/email.service";

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

    await this.emailService.send({
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Use this token to reset your password:</p><p><strong>${resetToken}</strong></p><p>This token expires in 1 hour.</p>`,
    });

    return ok(undefined);
  }
}
