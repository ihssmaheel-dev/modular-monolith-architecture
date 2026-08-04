import { Injectable } from "@nestjs/common";
import { OutboxRepository } from "./outbox.repository";
import { Result, err, ok } from "neverthrow";

@Injectable()
export class OutboxService {
  constructor(private readonly outboxRepository: OutboxRepository) {}

  /**
   * Dispatches an event to the outbox.
   * If called within a Transaction (via DatabaseService), it inherits the ACID guarantees.
   */
  async dispatch(topic: string, payload: any): Promise<Result<void, Error>> {
    const result = await this.outboxRepository.create({
      topic,
      payload,
      status: "PENDING",
    });

    if (result.isErr()) {
      return err(new Error("Failed to save outbox event"));
    }

    return ok(undefined);
  }
}
