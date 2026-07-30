import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ok, err, Result } from "neverthrow";
import bcrypt from "bcryptjs";
import { User } from "../../domain/entities/user.entity";
import { EmailTaken } from "../../domain/errors/user.errors";
import { UserCreatedEvent } from "../../domain/events/user.events";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByEmailQuery } from "../queries/get-user-by-email.query";

const BCRYPT_ROUNDS = 12;

@Injectable()
export class CreateUserCommand {
  constructor(
    private readonly repository: UsersRepository,
    private readonly getUserByEmail: GetUserByEmailQuery,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(data: { email: string; name: string; password: string }): Promise<Result<User, EmailTaken>> {
    const existing = await this.getUserByEmail.execute(data.email);
    if (existing.isErr()) return err(existing.error);
    if (existing.value) return err({ type: "EMAIL_TAKEN", email: data.email });

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    const result = await this.repository.save({
      email: data.email,
      name: data.name,
      passwordHash,
    });
    if (result.isErr()) return err(result.error);

    this.eventEmitter.emit("user.created", new UserCreatedEvent(result.value.id, result.value.email, result.value.name));

    return ok(result.value);
  }
}
