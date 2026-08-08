import { Controller, Req, HttpStatus } from "@nestjs/common";
import { FastifyRequest } from "fastify";
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
  async register(@Req() req?: FastifyRequest) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(authContract.register, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.registerCmd.execute(body as RegisterInput);
      const response = handleResult(result, {
        EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "auth.emailTaken" },
      }, this.i18n, lang);
      return { status: 201, body: response };
    });
  }

  @TsRestHandler(authContract.login)
  async login(@Req() req?: FastifyRequest) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(authContract.login, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.loginCmd.execute(body as LoginInput);
      const response = handleResult(result, {
        INVALID_CREDENTIALS: { status: HttpStatus.UNAUTHORIZED, i18nKey: "auth.invalidCredentials" },
      }, this.i18n, lang);
      return { status: 200, body: response };
    });
  }

  @TsRestHandler(authContract.refresh)
  async refresh(@Req() req?: FastifyRequest) {
    // @ts-ignore: ts-rest inference is broken with Zod 4
    return tsRestHandler(authContract.refresh, async ({ body }: any) => {
      const lang = req?.headers["accept-language"];
      const result = await this.refreshCmd.execute(body.refreshToken);
      const response = handleResult(result, {
        INVALID_TOKEN: { status: HttpStatus.UNAUTHORIZED, i18nKey: "auth.invalidToken" },
      }, this.i18n, lang);
      return { status: 200, body: response };
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
