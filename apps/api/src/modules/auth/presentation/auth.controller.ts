import { Controller, Req, HttpStatus } from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
import { Public } from "../../../common";
import { authContract, RegisterInput, LoginInput } from "@repo/shared";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import { RegisterCommand } from "../application/commands/register.command";
import { LoginCommand } from "../application/commands/login.command";
import { RefreshTokensCommand } from "../application/commands/refresh-tokens.command";
import { ForgotPasswordCommand } from "../application/commands/forgot-password.command";
import { ResetPasswordCommand } from "../application/commands/reset-password.command";
import { handleResult } from "../../../common/utils/presentation.utils";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
} from "./auth.cookies";

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

  @TsRestHandler(authContract.register)
  async register(@Req() req?: FastifyRequest, @Req() reply?: FastifyReply) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(authContract.register, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.registerCmd.execute(body as RegisterInput);
      handleResult(result, {
        EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "auth.emailTaken" },
      }, this.i18n, lang);
      if (!result.isOk()) return { status: 500 as const, body: { message: "unexpected" } };
      setAccessTokenCookie(reply!, result.value.accessToken);
      setRefreshTokenCookie(reply!, result.value.refreshToken);
      return { status: 201 as const, body: { user: result.value.user } };
    });
  }

  @TsRestHandler(authContract.login)
  async login(@Req() req?: FastifyRequest, @Req() reply?: FastifyReply) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(authContract.login, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.loginCmd.execute(body as LoginInput);
      handleResult(result, {
        INVALID_CREDENTIALS: { status: HttpStatus.UNAUTHORIZED, i18nKey: "auth.invalidCredentials" },
        ACCOUNT_LOCKED: { status: HttpStatus.TOO_MANY_REQUESTS, i18nKey: "auth.accountLocked" },
      }, this.i18n, lang);
      if (!result.isOk()) return { status: 500 as const, body: { message: "unexpected" } };
      setAccessTokenCookie(reply!, result.value.accessToken);
      setRefreshTokenCookie(reply!, result.value.refreshToken);
      return { status: 200 as const, body: { user: result.value.user } };
    });
  }

  @TsRestHandler(authContract.logout)
  async logout(@Req() req?: FastifyRequest, @Req() reply?: FastifyReply) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(authContract.logout, async () => {
      const lang = req?.headers["accept-language"];
      clearAuthCookies(reply!);
      return { status: 200 as const, body: { message: this.i18n.t("auth.logoutSuccess", lang) } };
    });
  }

  @TsRestHandler(authContract.refresh)
  async refresh(@Req() req?: FastifyRequest, @Req() reply?: FastifyReply) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(authContract.refresh, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const refreshToken = body?.refreshToken ?? (req as any)?.cookies?.refresh_token;
      if (!refreshToken) {
        return { status: 401 as const, body: { message: this.i18n.t("auth.invalidToken", lang) } };
      }
      const result = await this.refreshCmd.execute(refreshToken);
      handleResult(result, {
        INVALID_TOKEN: { status: HttpStatus.UNAUTHORIZED, i18nKey: "auth.invalidToken" },
      }, this.i18n, lang);
      if (!result.isOk()) return { status: 500 as const, body: { message: "unexpected" } };
      setAccessTokenCookie(reply!, result.value.accessToken);
      setRefreshTokenCookie(reply!, result.value.refreshToken);
      return { status: 200 as const, body: { user: result.value.user } };
    });
  }

  @TsRestHandler(authContract.forgotPassword)
  async forgotPassword(@Req() req?: FastifyRequest) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(authContract.forgotPassword, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      await this.forgotPasswordCmd.execute(body.email);
      return { status: 200, body: { message: this.i18n.t("auth.resetLinkSent", lang) } };
    });
  }

  @TsRestHandler(authContract.resetPassword)
  async resetPassword(@Req() req?: FastifyRequest) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(authContract.resetPassword, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      await this.resetPasswordCmd.execute(body.token, body.password);
      return { status: 200, body: { message: this.i18n.t("auth.passwordResetSuccess", lang) } };
    });
  }
}
