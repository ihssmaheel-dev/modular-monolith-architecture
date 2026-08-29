import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ok, err, Result } from "neverthrow";
import { z } from "zod";
import { UpdateUserSchema } from "@repo/contracts";
import { User } from "../../domain/entities/user.entity";
import { EmailTaken, UserNotFound } from "../../domain/errors/user.errors";
import { UserUpdatedEvent } from "../../domain/events/user.events";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByIdQuery } from "../queries/get-user-by-id.query";
import { GetUserByEmailQuery } from "../queries/get-user-by-email.query";
import { DistributedCacheService } from "../../../../infrastructure/cache/distributed-cache.service";
import { OutboxService } from "../../../../infrastructure/outbox/outbox.service";
import type { UserEventDispatchFailed } from "../../domain/errors/user.errors";

@Injectable()
export class UpdateUserCommand {
  constructor(
    private readonly repository: UsersRepository,
    private readonly getUserById: GetUserByIdQuery,
    private readonly getUserByEmail: GetUserByEmailQuery,
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: DistributedCacheService,
    private readonly outbox: OutboxService,
  ) {}

  async execute(
    id: string,
    data: z.infer<typeof UpdateUserSchema>,
  ): Promise<Result<User, UserNotFound | EmailTaken | UserEventDispatchFailed>> {
    const existing = await this.getUserById.execute(id);
    if (existing.isErr()) return err(existing.error);

    if (data.email && data.email !== existing.value.email) {
      const emailTaken = await this.getUserByEmail.execute(data.email);
      if (emailTaken.isErr()) return err(emailTaken.error);
      if (emailTaken.value) return err({ type: "EMAIL_TAKEN", email: data.email });
    }

    existing.value.update(data);
    const saved = await this.repository.updateById(existing.value.id, {
      email: existing.value.email,
      name: existing.value.name,
      role: existing.value.role,
    });
    if (saved.isErr()) return err({ type: "USER_NOT_FOUND", userId: existing.value.id });
    if (!saved.value) return err({ type: "USER_NOT_FOUND", userId: existing.value.id });

    // Explicit Cache Invalidation
    await this.cacheService.invalidateGlobal(`user:${id}`);

    const dispatched = await this.outbox.dispatch(
      "user.updated",
      new UserUpdatedEvent(saved.value.id, data),
    );
    if (dispatched.isErr()) return err({ type: "USER_EVENT_DISPATCH_FAILED" });
    try {
      await this.eventEmitter.emitAsync("database.mutated", {
        collectionName: "users",
        documentId: saved.value.id,
        action: "UPDATE",
        actorId: saved.value.id,
        tenantId: undefined,
        before: { id: existing.value.id },
        after: { id: saved.value.id, email: saved.value.email, name: saved.value.name },
      });
    } catch {
      return err({ type: "USER_EVENT_DISPATCH_FAILED" });
    }

    return ok(saved.value);
  }
}
