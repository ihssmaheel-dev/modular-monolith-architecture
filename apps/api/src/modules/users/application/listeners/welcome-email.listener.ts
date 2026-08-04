import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserCreatedEvent } from "../../domain/events/user.events";
import { PinoLoggerService } from "../../../../infrastructure/logger/logger.service";
import { QueueService } from "../../../../infrastructure/queue/queue.service";

@Injectable()
export class WelcomeEmailListener {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly queueService: QueueService,
  ) {}

  @OnEvent("user.created")
  async handle(event: UserCreatedEvent) {
    this.logger.info({ userId: event.userId, email: event.email }, "User created — queuing welcome email via BullMQ");
    await this.queueService.getQueue("email")?.add("welcome", {
      to: event.email,
      name: event.name,
    });
  }
}
