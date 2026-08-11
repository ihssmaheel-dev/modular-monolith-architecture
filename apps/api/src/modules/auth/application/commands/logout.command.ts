import { Injectable } from "@nestjs/common";
import { err, ok, Result } from "neverthrow";
import { SessionService } from "../../../../infrastructure/session/session.service";
import { IncrementAuthVersionCommand } from "../../../users/application/commands/increment-auth-version.command";
import type { AuthError } from "../../domain/errors/auth.errors";

@Injectable()
export class LogoutCommand {
  constructor(
    private readonly incrementAuthVersion: IncrementAuthVersionCommand,
    private readonly sessionService: SessionService,
  ) {}

  async execute(userId: string): Promise<Result<void, AuthError>> {
    const result = await this.incrementAuthVersion.execute(userId);
    if (result.isErr()) return err({ type: "INVALID_TOKEN" });
    await this.sessionService.revokeAllForUser(userId);
    return ok(undefined);
  }
}
