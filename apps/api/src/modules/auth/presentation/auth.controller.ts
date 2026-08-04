import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from "@nestjs/common";
import { Public } from "../../../common";
import { RegisterCommand } from "../application/commands/register.command";
import { LoginCommand } from "../application/commands/login.command";
import { RefreshTokensCommand } from "../application/commands/refresh-tokens.command";
import { ForgotPasswordCommand } from "../application/commands/forgot-password.command";
import { ResetPasswordCommand } from "../application/commands/reset-password.command";
import { handleResult } from "../../../common/utils/presentation.utils";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";


@Public()
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
    return handleResult(result, {
      EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "auth.emailTaken" },
    }, this.i18n, acceptLanguage);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Headers("accept-language") acceptLanguage?: string,
  ) {
    const result = await this.loginCmd.execute(body);
    return handleResult(result, {
      INVALID_CREDENTIALS: { status: HttpStatus.UNAUTHORIZED, i18nKey: "auth.invalidCredentials" },
    }, this.i18n, acceptLanguage);
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: { refreshToken: string },
    @Headers("accept-language") acceptLanguage?: string,
  ) {
    const result = await this.refreshCmd.execute(body.refreshToken);
    return handleResult(result, {
      INVALID_TOKEN: { status: HttpStatus.UNAUTHORIZED, i18nKey: "auth.invalidToken" },
    }, this.i18n, acceptLanguage);
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
