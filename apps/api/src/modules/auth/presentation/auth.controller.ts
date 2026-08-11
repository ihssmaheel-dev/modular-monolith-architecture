import { Controller, Req, Res } from "@nestjs/common";
import { authContract } from "@repo/shared";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Public, TenantAgnostic, requireAuthenticatedUser } from "../../../common";
import { handleResult } from "../../../common/utils/presentation.utils";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { ForgotPasswordCommand } from "../application/commands/forgot-password.command";
import { LoginCommand } from "../application/commands/login.command";
import { LogoutCommand } from "../application/commands/logout.command";
import { RefreshTokensCommand } from "../application/commands/refresh-tokens.command";
import { RegisterCommand } from "../application/commands/register.command";
import { ResetPasswordCommand } from "../application/commands/reset-password.command";
import { clearAuthCookies, setAuthCookies } from "./auth.cookies";
import { EMAIL_TAKEN_ERRORS, INVALID_TOKEN_ERRORS, LOGIN_ERRORS } from "./auth.error-maps";
import { AuthRateLimit } from "./auth-rate-limit.decorator";

@Controller("auth")
@TenantAgnostic()
export class AuthController {
  constructor(
    private readonly registerCmd: RegisterCommand,
    private readonly loginCmd: LoginCommand,
    private readonly logoutCmd: LogoutCommand,
    private readonly refreshCmd: RefreshTokensCommand,
    private readonly forgotPasswordCmd: ForgotPasswordCommand,
    private readonly resetPasswordCmd: ResetPasswordCommand,
    private readonly i18n: I18nService,
  ) {}

  @TsRestHandler(authContract.register)
  @Public()
  @AuthRateLimit("register")
  register(@Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return tsRestHandler(authContract.register, async ({ body }) => {
      const locale = this.i18n.getLocale(req.headers["accept-language"]);
      const result = await this.registerCmd.execute(body, locale);
      const value = handleResult(
        result,
        EMAIL_TAKEN_ERRORS,
        this.i18n,
        req.headers["accept-language"],
      );
      setAuthCookies(reply, value.accessToken, value.refreshToken);
      return { status: 201 as const, body: value };
    });
  }

  @TsRestHandler(authContract.login)
  @Public()
  @AuthRateLimit("login")
  login(@Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return tsRestHandler(authContract.login, async ({ body }) => {
      const result = await this.loginCmd.execute(body);
      const value = handleResult(result, LOGIN_ERRORS, this.i18n, req.headers["accept-language"]);
      setAuthCookies(reply, value.accessToken, value.refreshToken);
      return { status: 200 as const, body: value };
    });
  }

  @TsRestHandler(authContract.logout)
  logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return tsRestHandler(authContract.logout, async () => {
      const lang = req.headers["accept-language"];
      const actor = requireAuthenticatedUser(req);
      const result = await this.logoutCmd.execute(actor.sub);
      handleResult(result, INVALID_TOKEN_ERRORS, this.i18n, lang);
      clearAuthCookies(reply);
      return {
        status: 200 as const,
        body: { message: this.i18n.t("auth.logoutSuccess", lang) },
      };
    });
  }

  @TsRestHandler(authContract.refresh)
  @Public()
  @AuthRateLimit("refresh")
  refresh(@Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return tsRestHandler(authContract.refresh, async ({ body }) => {
      const lang = req.headers["accept-language"];
      const token = body.refreshToken ?? req.cookies.refresh_token;
      if (!token) {
        return { status: 401 as const, body: { message: this.i18n.t("auth.invalidToken", lang) } };
      }
      const result = await this.refreshCmd.execute(token);
      const value = handleResult(result, INVALID_TOKEN_ERRORS, this.i18n, lang);
      setAuthCookies(reply, value.accessToken, value.refreshToken);
      return { status: 200 as const, body: value };
    });
  }

  @TsRestHandler(authContract.forgotPassword)
  @Public()
  @AuthRateLimit("forgotPassword")
  forgotPassword(@Req() req: FastifyRequest) {
    return tsRestHandler(authContract.forgotPassword, async ({ body }) => {
      const lang = req.headers["accept-language"];
      await this.forgotPasswordCmd.execute(body.email, lang);
      return {
        status: 200 as const,
        body: { message: this.i18n.t("auth.resetLinkSent", lang) },
      };
    });
  }

  @TsRestHandler(authContract.resetPassword)
  @Public()
  @AuthRateLimit("resetPassword")
  resetPassword(@Req() req: FastifyRequest) {
    return tsRestHandler(authContract.resetPassword, async ({ body }) => {
      const lang = req.headers["accept-language"];
      const result = await this.resetPasswordCmd.execute(body.token, body.password);
      handleResult(result, INVALID_TOKEN_ERRORS, this.i18n, lang);
      return {
        status: 200 as const,
        body: { message: this.i18n.t("auth.passwordResetSuccess", lang) },
      };
    });
  }
}
