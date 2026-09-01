import { Injectable, Optional } from "@nestjs/common";
import { err, ok, Result } from "neverthrow";
import { SessionService } from "../../../../infrastructure/session/session.service";
import { IncrementAuthVersionCommand } from "../../../users/application/commands/increment-auth-version.command";
import type { AuthError } from "../../domain/errors/auth.errors";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class LogoutCommand {
  constructor(
    private readonly incrementAuthVersion: IncrementAuthVersionCommand,
    private readonly sessionService: SessionService,
    @Optional() private readonly events?: EventEmitter2,
  ) {}

  async execute(userId: string): Promise<Result<void, AuthError>> {
    const result = await this.incrementAuthVersion.execute(userId);
    if (result.isErr()) return err({ type: "INVALID_TOKEN" });
    await this.sessionService.revokeAllForUser(userId);
    if (this.events) await this.events.emitAsync("auth.session.revoked", { userId });
    return ok(undefined);
  }
}
