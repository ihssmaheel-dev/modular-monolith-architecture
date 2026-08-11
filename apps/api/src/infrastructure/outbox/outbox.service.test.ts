import { describe, it, expect, vi, beforeEach } from "vitest";
import { OutboxService } from "./outbox.service";
import { OutboxRepository } from "./outbox.repository";
import { ok } from "neverthrow";
import type { TenantContextService } from "../database/tenant-context.service";

describe("OutboxService", () => {
  let service: OutboxService;
  let repository: OutboxRepository;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
    } as unknown as OutboxRepository;

    const tenantContext = {
      get: vi.fn().mockReturnValue({ mode: "single" }),
    } as unknown as TenantContextService;
    service = new OutboxService(repository, tenantContext);
  });

  it("should create an outbox event with pending status", async () => {
    const now = new Date();
    vi.mocked(repository.create).mockResolvedValue(
      ok({
        id: "event-1",
        topic: "test.event",
        payload: { test: true },
        status: "PENDING",
        attempts: 0,
        createdAt: now,
        updatedAt: now,
      }),
    );

    const payload = { test: true };
    await service.dispatch("test.event", payload);

    expect(repository.create).toHaveBeenCalledWith({
      tenantId: undefined,
      topic: "test.event",
      payload,
      status: "PENDING",
    });
  });
});
