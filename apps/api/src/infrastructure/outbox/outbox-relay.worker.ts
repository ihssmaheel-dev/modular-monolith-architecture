import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MetricsService } from "../metrics/metrics.service";
import { PinoLoggerService } from "../logger/logger.service";
import { OutboxEvent, OutboxRepository } from "./outbox.repository";

const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 5_000;
const RETRY_MULTIPLIER = 2;
const LOCK_TIMEOUT_MS = 60_000;

@Injectable()
export class OutboxRelayWorker {
  private isProcessing = false;
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly repository: OutboxRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly metrics: MetricsService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "OutboxRelayWorker" });
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async relayEvents(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    try {
      await this.recoverStaleLocks();
      const events = await this.getPendingEvents();
      for (const event of events) await this.relayEvent(event);
    } catch (error) {
      this.logger.error({ error }, "Outbox relay failed");
    } finally {
      this.isProcessing = false;
    }
  }

  private async getPendingEvents(): Promise<OutboxEvent[]> {
    const pendingCount = await this.repository.countPendingEvents();
    this.metrics.setGauge(
      "outbox_pending_events_depth",
      "Number of pending outbox events",
      pendingCount,
    );
    return this.repository.lockPendingEvents(BATCH_SIZE);
  }

  private async relayEvent(event: OutboxEvent): Promise<void> {
    try {
      await this.eventEmitter.emitAsync(event.topic, event.payload);
      await this.repository.updateById(event.id, {
        $set: { status: "PUBLISHED" },
        $unset: { lockedAt: "", nextAttemptAt: "", error: "" },
      });
      this.recordLatency(event);
    } catch (error) {
      await this.scheduleRetry(event, error);
    }
  }

  private async scheduleRetry(event: OutboxEvent, error: unknown): Promise<void> {
    const attempts = event.attempts + 1;
    const isExhausted = attempts >= MAX_ATTEMPTS;
    const delay = RETRY_BASE_DELAY_MS * RETRY_MULTIPLIER ** Math.max(0, attempts - 1);
    await this.repository.updateById(event.id, {
      $set: {
        status: isExhausted ? "FAILED" : "PENDING",
        attempts,
        error: error instanceof Error ? error.message : String(error),
        nextAttemptAt: new Date(Date.now() + delay),
      },
      $unset: { lockedAt: "" },
    });
    this.logger.error({ eventId: event.id, attempts, error }, "Outbox event delivery failed");
  }

  private async recoverStaleLocks(): Promise<void> {
    const cutoff = new Date(Date.now() - LOCK_TIMEOUT_MS);
    const recovered = await this.repository.recoverStaleLocks(cutoff);
    if (recovered > 0) this.logger.warn({ recovered }, "Recovered stale outbox locks");
  }

  private recordLatency(event: OutboxEvent): void {
    const latency = Date.now() - event.createdAt.getTime();
    this.metrics.recordHistogram(
      "outbox_processing_latency_ms",
      "Latency between outbox event creation and processing",
      latency,
    );
  }
}
