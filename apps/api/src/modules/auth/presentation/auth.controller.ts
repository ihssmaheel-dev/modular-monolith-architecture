import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { err } from "neverthrow";
import { Public, TenantAgnostic, requireAuthenticatedUser } from "../../../common";
import { handleResult } from "../../../common/utils/presentation.utils";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import {
  type RegisterInput,
  type LoginInput,
  type RefreshTokenInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type AuthResponse,
  type MessageResponse,
} from "@repo/shared";
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

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @AuthRateLimit("register")
  async register(
    @Body() body: RegisterInput,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponse> {
    const locale = this.i18n.getLocale(req.headers["accept-language"]);
    const result = await this.registerCmd.execute(body, locale);
    const value = handleResult(
      result,
      EMAIL_TAKEN_ERRORS,
      this.i18n,
      req.headers["accept-language"],
    );
    setAuthCookies(reply, value.accessToken, value.refreshToken);
    return value;
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Public()
  @AuthRateLimit("login")
  async login(
    @Body() body: LoginInput,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponse> {
    const result = await this.loginCmd.execute(body);
    const value = handleResult(result, LOGIN_ERRORS, this.i18n, req.headers["accept-language"]);
    setAuthCookies(reply, value.accessToken, value.refreshToken);
    return value;
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<MessageResponse> {
    const lang = req.headers["accept-language"];
    const actor = requireAuthenticatedUser(req);
    const result = await this.logoutCmd.execute(actor.sub);
    handleResult(result, INVALID_TOKEN_ERRORS, this.i18n, lang);
    clearAuthCookies(reply);
    return { message: this.i18n.t("auth.logoutSuccess", lang) };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @Public()
  @AuthRateLimit("refresh")
  async refresh(
    @Body() body: RefreshTokenInput,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponse> {
    const lang = req.headers["accept-language"];
    const token = body?.refreshToken ?? (req.cookies as Record<string, string | undefined>)?.refresh_token;
    if (!token) {
      handleResult(err({ type: "INVALID_TOKEN" as const }), INVALID_TOKEN_ERRORS, this.i18n, lang);
    }
    const result = await this.refreshCmd.execute(token!);
    const value = handleResult(result, INVALID_TOKEN_ERRORS, this.i18n, lang);
    setAuthCookies(reply, value.accessToken, value.refreshToken);
    return value;
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @Public()
  @AuthRateLimit("forgotPassword")
  async forgotPassword(
    @Body() body: ForgotPasswordInput,
    @Req() req: FastifyRequest,
  ): Promise<MessageResponse> {
    const lang = req.headers["accept-language"];
    await this.forgotPasswordCmd.execute(body.email, lang);
    return { message: this.i18n.t("auth.resetLinkSent", lang) };
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @Public()
  @AuthRateLimit("resetPassword")
  async resetPassword(
    @Body() body: ResetPasswordInput,
    @Req() req: FastifyRequest,
  ): Promise<MessageResponse> {
    const lang = req.headers["accept-language"];
    const result = await this.resetPasswordCmd.execute(body.token, body.password);
    handleResult(result, INVALID_TOKEN_ERRORS, this.i18n, lang);
    return { message: this.i18n.t("auth.passwordResetSuccess", lang) };
  }
}
