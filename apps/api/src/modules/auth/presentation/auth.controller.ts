import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from "@nestjs/common";
import { RegisterCommand } from "../application/commands/register.command";
import { LoginCommand } from "../application/commands/login.command";
import { RefreshTokensCommand } from "../application/commands/refresh-tokens.command";
import { ForgotPasswordCommand } from "../application/commands/forgot-password.command";
import { ResetPasswordCommand } from "../application/commands/reset-password.command";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import type { AuthError } from "../domain/errors/auth.errors";

const ERROR_MESSAGE_MAP: Record<AuthError["type"], string> = {
  INVALID_CREDENTIALS: "auth.invalidCredentials",
  EMAIL_TAKEN: "auth.emailTaken",
  USER_NOT_FOUND: "auth.userNotFound",
  INVALID_TOKEN: "auth.invalidToken",
  EMAIL_NOT_FOUND: "auth.userNotFound",
};

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerCmd: RegisterCommand,
    private readonly loginCmd: LoginCommand,
    private readonly refreshCmd: RefreshTokensCommand,
    private readonly forgotPasswordCmd: ForgotPasswordCommand,
    private readonly resetPasswordCmd: ResetPasswordCommand,
    private readonly i18n: I18nService,
  ) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: { name: string; email: string; password: string },
    @Headers("accept-language") acceptLanguage?: string,
  ) {
    const result = await this.registerCmd.execute(body);
    if (result.isErr()) {
      const status = result.error.type === "EMAIL_TAKEN" ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;
      const message = this.i18n.t(ERROR_MESSAGE_MAP[result.error.type], acceptLanguage);
      return { statusCode: status, message };
    }
    return result.value;
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Headers("accept-language") acceptLanguage?: string,
  ) {
    const result = await this.loginCmd.execute(body);
    if (result.isErr()) {
      const message = this.i18n.t(ERROR_MESSAGE_MAP[result.error.type], acceptLanguage);
      return { statusCode: HttpStatus.UNAUTHORIZED, message };
    }
    return result.value;
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: { refreshToken: string },
    @Headers("accept-language") acceptLanguage?: string,
  ) {
    const result = await this.refreshCmd.execute(body.refreshToken);
    if (result.isErr()) {
      const message = this.i18n.t(ERROR_MESSAGE_MAP[result.error.type], acceptLanguage);
      return { statusCode: HttpStatus.UNAUTHORIZED, message };
    }
    return result.value;
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() body: { email: string },
    @Headers("accept-language") acceptLanguage?: string,
  ) {
    await this.forgotPasswordCmd.execute(body.email);
    return { message: this.i18n.t("auth.resetLinkSent", acceptLanguage) };
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: { token: string; password: string },
    @Headers("accept-language") acceptLanguage?: string,
  ) {
    await this.resetPasswordCmd.execute(body.token, body.password);
    return { message: this.i18n.t("auth.passwordResetSuccess", acceptLanguage) };
  }
}
