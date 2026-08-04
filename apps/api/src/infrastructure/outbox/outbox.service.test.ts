import { describe, it, expect, vi, beforeEach } from "vitest";
import { OutboxService } from "./outbox.service";
import { OutboxRepository } from "./outbox.repository";
import { ok } from "neverthrow";

describe("OutboxService", () => {
  let service: OutboxService;
  let repository: OutboxRepository;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
    } as unknown as OutboxRepository;

    service = new OutboxService(repository);
  });

  it("should create an outbox event with pending status", async () => {
    (repository.create as any).mockResolvedValue(ok({ id: "event-1" }));

    const payload = { test: true };
    await service.dispatch("test.event", payload);

    expect(repository.create).toHaveBeenCalledWith({
      topic: "test.event",
      payload,
      status: "PENDING",
    });
  });
});
