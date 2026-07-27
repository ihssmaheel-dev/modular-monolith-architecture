import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Result, ok, err } from "neverthrow";
import { User } from "../domain/entities/user.entity";
import { UserError, EmailTaken, UserNotFound } from "../domain/errors/user.errors";
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from "../domain/events/user-created.event";
import { UsersRepository } from "../infrastructure/users.repository";
import { paginate } from "@repo/shared";

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(page?: number, limit?: number): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const { skip, page: p, limit: l } = paginate(page, limit);
    const { users, total } = await this.repository.findAll({ skip, limit: l });
    return { users, total, page: p, limit: l };
  }

  async getById(id: string): Promise<Result<User, UserNotFound>> {
    const user = await this.repository.findById(id);
    if (user.isErr()) return err(user.error);
    if (!user.value) return err({ type: "USER_NOT_FOUND", userId: id });
    return ok(user.value);
  }

  async create(data: { email: string; name: string }): Promise<Result<User, EmailTaken>> {
    const existing = await this.repository.findByEmail(data.email);
    if (existing) return err({ type: "EMAIL_TAKEN", email: data.email });

    const user = User.create(data);
    const saved = await this.repository.save(user);

    this.eventEmitter.emit("user.created", new UserCreatedEvent(saved.id, saved.email, saved.name));

    return ok(saved);
  }

  async update(id: string, data: { email?: string; name?: string }): Promise<Result<User, UserNotFound | EmailTaken>> {
    const existing = await this.repository.findById(id);
    if (existing.isErr()) return err(existing.error);
    if (!existing.value) return err({ type: "USER_NOT_FOUND", userId: id });

    if (data.email && data.email !== existing.value.email) {
      const emailTaken = await this.repository.findByEmail(data.email);
      if (emailTaken) return err({ type: "EMAIL_TAKEN", email: data.email });
    }

    existing.value.update(data);
    const saved = await this.repository.update(existing.value);

    this.eventEmitter.emit("user.updated", new UserUpdatedEvent(saved.id, data));

    return ok(saved);
  }

  async delete(id: string): Promise<Result<void, UserNotFound>> {
    const existing = await this.repository.findById(id);
    if (existing.isErr()) return err(existing.error);
    if (!existing.value) return err({ type: "USER_NOT_FOUND", userId: id });

    await this.repository.delete(id);

    this.eventEmitter.emit("user.deleted", new UserDeletedEvent(id));

    return ok(undefined);
  }
}
