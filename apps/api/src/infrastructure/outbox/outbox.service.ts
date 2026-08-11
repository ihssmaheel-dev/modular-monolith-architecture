import { Injectable } from "@nestjs/common";
import { OutboxRepository } from "./outbox.repository";
import { Result, err, ok } from "neverthrow";
import { TenantContextService } from "../database/tenant-context.service";

export interface OutboxError {
  type: "OUTBOX_WRITE_FAILED";
}

@Injectable()
export class OutboxService {
  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly tenantContext: TenantContextService,
  ) {}

  /**
   * Dispatches an event to the outbox.
   * If called within a Transaction (via DatabaseService), it inherits the ACID guarantees.
   */
  async dispatch(topic: string, payload: unknown): Promise<Result<void, OutboxError>> {
    const result = await this.outboxRepository.create({
      tenantId: this.tenantContext.get().tenantId,
      topic,
      payload,
      status: "PENDING",
    });

    if (result.isErr()) {
      return err({ type: "OUTBOX_WRITE_FAILED" });
    }

    return ok(undefined);
  }
}
