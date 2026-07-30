import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ok, err, Result } from "neverthrow";
import { UserNotFound } from "../../domain/errors/user.errors";
import { UserDeletedEvent } from "../../domain/events/user.events";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByIdQuery } from "../queries/get-user-by-id.query";

@Injectable()
export class DeleteUserCommand {
  constructor(
    private readonly repository: UsersRepository,
    private readonly getUserById: GetUserByIdQuery,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<Result<void, UserNotFound>> {
    const existing = await this.getUserById.execute(id);
    if (existing.isErr()) return err(existing.error);

    const deleted = await this.repository.deleteById(id);
    if (deleted.isErr()) return err({ type: "USER_NOT_FOUND", userId: id });
    if (!deleted.value) return err({ type: "USER_NOT_FOUND", userId: id });

    this.eventEmitter.emit("user.deleted", new UserDeletedEvent(id));

    return ok(undefined);
  }
}
