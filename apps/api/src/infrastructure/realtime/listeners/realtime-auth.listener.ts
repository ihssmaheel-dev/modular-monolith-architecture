import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { RealtimeService } from "../realtime.service";
import { PinoLoggerService } from "../../logger/logger.service";

@Injectable()
export class RealtimeAuthListener {
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly realtime: RealtimeService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "RealtimeAuthListener" });
  }

  @OnEvent("user.auth-version.incremented")
  handleAuthVersionIncremented(payload: { userId: string }): void {
    if (payload?.userId) {
      const closed = this.realtime.disconnectUser(payload.userId);
      this.logger.info(
        { userId: payload.userId, closed },
        "Closed realtime sessions on auth version increment",
      );
    }
  }

  @OnEvent("user.password.reset")
  handlePasswordReset(payload: { userId: string }): void {
    if (payload?.userId) {
      const closed = this.realtime.disconnectUser(payload.userId);
      this.logger.info(
        { userId: payload.userId, closed },
        "Closed realtime sessions on password reset",
      );
    }
  }

  @OnEvent("auth.session.revoked")
  handleSessionRevoked(payload: { userId: string }): void {
    if (payload?.userId) {
      const closed = this.realtime.disconnectUser(payload.userId);
      this.logger.info(
        { userId: payload.userId, closed },
        "Closed realtime sessions on session revocation",
      );
    }
  }
}
