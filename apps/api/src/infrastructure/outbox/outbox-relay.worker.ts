import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MetricsService } from "../metrics/metrics.service";
import { PinoLoggerService } from "../logger/logger.service";
import { OutboxEvent, OutboxRepository } from "./outbox.repository";
import { ClsService } from "nestjs-cls";
import { env } from "../../config/env";

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
    private readonly cls: ClsService,
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
    const context = { tenantMode: env.TENANCY_MODE, tenantId: event.tenantId };
    await this.cls.runWith(context, () => this.publishEvent(event));
  }

  private async publishEvent(event: OutboxEvent): Promise<void> {
    try {
      await this.eventEmitter.emitAsync(event.topic, event.payload);
      await this.repository.updateById(event.id, {
        status: "PUBLISHED",
        lockedAt: null,
        nextAttemptAt: null,
        error: null,
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
    const errorMessage = error instanceof Error ? error.message : String(error);

    await this.repository.updateById(event.id, {
      status: isExhausted ? "DEAD_LETTER" : "PENDING",
      attempts,
      error: errorMessage,
      nextAttemptAt: isExhausted ? null : new Date(Date.now() + delay),
      lockedAt: null,
    });

    if (isExhausted) {
      this.metrics.incrementCounter(
        "outbox_dead_letter_total",
        "Total number of outbox events moved to dead-letter queue",
        1,
        { topic: event.topic },
      );
      this.logger.error(
        { eventId: event.id, topic: event.topic, attempts, error: errorMessage },
        "Outbox event moved to dead-letter queue (max attempts exceeded)",
      );
    } else {
      this.logger.warn(
        {
          eventId: event.id,
          topic: event.topic,
          attempts,
          nextDelayMs: delay,
          error: errorMessage,
        },
        "Outbox event delivery failed, exponential retry scheduled",
      );
    }
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
