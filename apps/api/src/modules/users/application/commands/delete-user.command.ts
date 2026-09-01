import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ok, err, Result } from "neverthrow";
import type { UserNotFound, UserOwnsOrganization } from "../../domain/errors/user.errors";
import { UserDeletedEvent } from "../../domain/events/user.events";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByIdQuery } from "../queries/get-user-by-id.query";
import { DistributedCacheService } from "../../../../infrastructure/cache/distributed-cache.service";
import { CanDeleteUserQuery } from "../../../tenancy/application/queries/can-delete-user.query";
import { OutboxService } from "../../../../infrastructure/outbox/outbox.service";
import type { UserEventDispatchFailed } from "../../domain/errors/user.errors";

@Injectable()
export class DeleteUserCommand {
  constructor(
    private readonly repository: UsersRepository,
    private readonly getUserById: GetUserByIdQuery,
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: DistributedCacheService,
    private readonly canDeleteUser: CanDeleteUserQuery,
    private readonly outbox: OutboxService,
  ) {}

  async execute(
    id: string,
  ): Promise<Result<void, UserNotFound | UserOwnsOrganization | UserEventDispatchFailed>> {
    const existing = await this.getUserById.execute(id);
    if (existing.isErr()) return err(existing.error);
    const allowed = await this.canDeleteUser.execute(id);
    if (allowed.isErr()) return err(allowed.error);

    const deleted = await this.repository.deleteById(id);
    if (deleted.isErr()) return err({ type: "USER_NOT_FOUND", userId: id });
    if (!deleted.value) return err({ type: "USER_NOT_FOUND", userId: id });

    await this.cacheService.invalidateGlobal(`user:${id}`);
    const dispatched = await this.outbox.dispatchGlobal("user.deleted", new UserDeletedEvent(id));
    if (dispatched.isErr()) return err({ type: "USER_EVENT_DISPATCH_FAILED" });
    try {
      await this.eventEmitter.emitAsync("database.mutated", {
        collectionName: "users",
        documentId: id,
        action: "DELETE",
        actorId: id,
        tenantId: undefined,
        before: { id, email: existing.value.email },
        after: null,
      });
    } catch {
      return err({ type: "USER_EVENT_DISPATCH_FAILED" });
    }

    return ok(undefined);
  }
}
