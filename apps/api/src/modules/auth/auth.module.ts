import { Module } from "@nestjs/common";
import { AuthController } from "./presentation/auth.controller";
import { RegisterCommand } from "./application/commands/register.command";
import { LoginCommand } from "./application/commands/login.command";
import { RefreshTokensCommand } from "./application/commands/refresh-tokens.command";
import { ForgotPasswordCommand } from "./application/commands/forgot-password.command";
import { ResetPasswordCommand } from "./application/commands/reset-password.command";
import { LogoutCommand } from "./application/commands/logout.command";
import { UsersModule } from "../users/users.module";
import { EmailModule } from "../../infrastructure/email/email.module";

@Module({
  imports: [UsersModule, EmailModule],
  controllers: [AuthController],
  providers: [
    RegisterCommand,
    LoginCommand,
    RefreshTokensCommand,
    ForgotPasswordCommand,
    ResetPasswordCommand,
    LogoutCommand,
  ],
})
export class AuthModule {}
