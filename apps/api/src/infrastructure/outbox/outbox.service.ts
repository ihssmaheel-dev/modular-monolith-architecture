import { Injectable } from "@nestjs/common";
import { OutboxRepository } from "./outbox.repository";
import { Result, err, ok } from "neverthrow";

export interface OutboxError {
  type: "OUTBOX_WRITE_FAILED";
}

@Injectable()
export class OutboxService {
  constructor(private readonly outboxRepository: OutboxRepository) {}

  /**
   * Dispatches an event to the outbox.
   * If called within a Transaction (via DatabaseService), it inherits the ACID guarantees.
   */
  async dispatch(topic: string, payload: unknown): Promise<Result<void, OutboxError>> {
    const result = await this.outboxRepository.create({
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
