import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { OutboxRepository } from "./outbox.repository";

@Injectable()
export class OutboxRelayWorker {
  private readonly logger = new Logger(OutboxRelayWorker.name);
  private isProcessing = false;

  constructor(
    private readonly repository: OutboxRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async relayEvents() {
    // Prevent overlapping runs if processing is slow
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Lock up to 10 pending events per tick
      const events = await this.repository.lockPendingEvents(10);
      if (events.length === 0) return;

      this.logger.debug(`Relaying ${events.length} outbox events`);

      for (const event of events) {
        try {
          // Dispatch to internal listeners (which can push to BullMQ or do anything else)
          await this.eventEmitter.emitAsync(event.topic, event.payload);
          
          // Mark as PUBLISHED
          await this.repository.updateById(event.id, { status: "PUBLISHED" });
        } catch (error) {
          this.logger.error(`Failed to relay event ${event.id}`, error instanceof Error ? error.stack : String(error));
          // Mark as FAILED
          await this.repository.updateById(event.id, { 
            status: "FAILED", 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } catch (error) {
      this.logger.error("Error in Outbox Relay Worker", error instanceof Error ? error.stack : String(error));
    } finally {
      this.isProcessing = false;
    }
  }
}
