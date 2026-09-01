import { Injectable } from "@nestjs/common";
import { OutboxRepository } from "./outbox.repository";
import { Result, err, ok } from "neverthrow";
import { DatabaseService, TenantContextService } from "../database";
import { env } from "../../config/env";

export interface OutboxError {
  type: "OUTBOX_WRITE_FAILED" | "TENANT_SCOPE_REQUIRED";
}

@Injectable()
export class OutboxService {
  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly tenantContext: TenantContextService,
    private readonly database: DatabaseService,
  ) {}

  /** Tenant events require the trusted request/worker tenant context in multi-tenant mode. */
  async dispatchTenant(topic: string, payload: unknown): Promise<Result<void, OutboxError>> {
    const tenantId = this.tenantContext.get().tenantId;
    if (env.TENANCY_MODE === "multi" && !tenantId) {
      return err({ type: "TENANT_SCOPE_REQUIRED" });
    }
    return this.persist(topic, payload, tenantId);
  }

  /** Global events are persisted only inside the internal system-scope capability. */
  async dispatchGlobal(topic: string, payload: unknown): Promise<Result<void, OutboxError>> {
    return this.database.withSystemScope(() => this.persist(topic, payload, undefined));
  }

  private async persist(
    topic: string,
    payload: unknown,
    tenantId: string | undefined,
  ): Promise<Result<void, OutboxError>> {
    let result: Awaited<ReturnType<OutboxRepository["create"]>>;
    try {
      result = await this.outboxRepository.create({
        tenantId,
        topic,
        payload,
        status: "PENDING",
      });
    } catch {
      return err({ type: "OUTBOX_WRITE_FAILED" });
    }

    if (result.isErr()) {
      return err({ type: "OUTBOX_WRITE_FAILED" });
    }

    return ok(undefined);
  }
}
