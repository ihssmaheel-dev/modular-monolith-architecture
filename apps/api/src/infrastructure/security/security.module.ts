import { Module, Global } from "@nestjs/common";
import { AccountLockoutService } from "./account-lockout.service";

@Global()
@Module({
  providers: [AccountLockoutService],
  exports: [AccountLockoutService],
})
export class SecurityModule {}
