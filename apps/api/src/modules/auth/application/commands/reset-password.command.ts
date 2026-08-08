import { Injectable } from "@nestjs/common";
import { ok, Result } from "neverthrow";
import type { AuthError } from "../../domain/errors/auth.errors";

@Injectable()
export class ResetPasswordCommand {
  async execute(_token: string, _newPassword: string): Promise<Result<void, AuthError>> {
    return ok(undefined);
  }
}
