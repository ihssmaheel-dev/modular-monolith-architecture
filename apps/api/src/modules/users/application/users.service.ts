import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Result, ok, err } from "neverthrow";
import { User } from "../domain/entities/user.entity";
import { EmailTaken, UserNotFound } from "../domain/errors/user.errors";
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from "../domain/events/user.events";
import { UsersRepository } from "../infrastructure/users.repository";
import { paginate } from "@repo/shared";

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(
    page?: number,
    limit?: number,
  ): Promise<Result<{ users: User[]; total: number; page: number; limit: number }, never>> {
    const { skip, page: p, limit: l } = paginate(page, limit);
    const result = await this.repository.findAll({ skip, limit: l });
    if (result.isErr()) return err(result.error);
    return ok({ users: result.value.users, total: result.value.total, page: p, limit: l });
  }

  async getById(id: string): Promise<Result<User, UserNotFound>> {
    const result = await this.repository.findById(id);
    if (result.isErr()) return err(result.error);
    if (!result.value) return err({ type: "USER_NOT_FOUND", userId: id });
    return ok(result.value);
  }

  async create(data: { email: string; name: string }): Promise<Result<User, EmailTaken>> {
    const existing = await this.repository.findByEmail(data.email);
    if (existing.isErr()) return err(existing.error);
    if (existing.value) return err({ type: "EMAIL_TAKEN", email: data.email });

    const user = User.create(data);
    const saved = await this.repository.save(user);
    if (saved.isErr()) return err(saved.error);

    this.eventEmitter.emit("user.created", new UserCreatedEvent(saved.value.id, saved.value.email, saved.value.name));

    return ok(saved.value);
  }

  async update(id: string, data: { email?: string; name?: string }): Promise<Result<User, UserNotFound | EmailTaken>> {
    const existing = await this.repository.findById(id);
    if (existing.isErr()) return err(existing.error);
    if (!existing.value) return err({ type: "USER_NOT_FOUND", userId: id });

    if (data.email && data.email !== existing.value.email) {
      const emailTaken = await this.repository.findByEmail(data.email);
      if (emailTaken.isErr()) return err(emailTaken.error);
      if (emailTaken.value) return err({ type: "EMAIL_TAKEN", email: data.email });
    }

    existing.value.update(data);
    const saved = await this.repository.update(existing.value);
    if (saved.isErr()) return err(saved.error);

    this.eventEmitter.emit("user.updated", new UserUpdatedEvent(saved.value.id, data));

    return ok(saved.value);
  }

  async delete(id: string): Promise<Result<void, UserNotFound>> {
    const existing = await this.repository.findById(id);
    if (existing.isErr()) return err(existing.error);
    if (!existing.value) return err({ type: "USER_NOT_FOUND", userId: id });

    const deleted = await this.repository.delete(id);
    if (deleted.isErr()) return err(deleted.error);

    this.eventEmitter.emit("user.deleted", new UserDeletedEvent(id));

    return ok(undefined);
  }
}
