import { Injectable, OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { OutboxEventEnvelopeSchema, type OutboxEventEnvelope } from "@repo/contracts";
import { QueueService } from "../queue/queue.service";
import { PinoLoggerService } from "../logger/logger.service";
import { env } from "../../config/env";

const OUTBOX_QUEUE = "domain-events";

@Injectable()
export class OutboxEventWorker implements OnModuleInit {
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly queues: QueueService,
    private readonly events: EventEmitter2,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "OutboxEventWorker" });
  }

  onModuleInit(): void {
    if (env.PROCESS_ROLE === "api") return;
    this.queues.addWorker<OutboxEventEnvelope>(OUTBOX_QUEUE, async (job) => {
      const event = OutboxEventEnvelopeSchema.parse(job.data);
      await this.events.emitAsync(event.topic, event.payload);
      this.logger.debug({ eventId: event.id, topic: event.topic }, "Durable outbox event consumed");
    });
  }
}

export { OUTBOX_QUEUE };
