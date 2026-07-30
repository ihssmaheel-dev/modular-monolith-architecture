import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ok, err, Result } from "neverthrow";
import { User } from "../../domain/entities/user.entity";
import { EmailTaken, UserNotFound } from "../../domain/errors/user.errors";
import { UserUpdatedEvent } from "../../domain/events/user.events";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByIdQuery } from "../queries/get-user-by-id.query";
import { GetUserByEmailQuery } from "../queries/get-user-by-email.query";

@Injectable()
export class UpdateUserCommand {
  constructor(
    private readonly repository: UsersRepository,
    private readonly getUserById: GetUserByIdQuery,
    private readonly getUserByEmail: GetUserByEmailQuery,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, data: { email?: string; name?: string }): Promise<Result<User, UserNotFound | EmailTaken>> {
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

    this.eventEmitter.emit("user.updated", new UserUpdatedEvent(saved.value.id, data));

    return ok(saved.value);
  }
}
