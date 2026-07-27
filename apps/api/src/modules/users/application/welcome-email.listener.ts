import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserCreatedEvent } from "../domain/events/user-created.event";
import { PinoLoggerService } from "../../../infrastructure/logger/logger.service";

@Injectable()
export class WelcomeEmailListener {
  constructor(private readonly logger: PinoLoggerService) {}

  @OnEvent("user.created")
  handle(event: UserCreatedEvent) {
    this.logger.info({ userId: event.userId, email: event.email }, "User created — welcome email queued");
  }
}
