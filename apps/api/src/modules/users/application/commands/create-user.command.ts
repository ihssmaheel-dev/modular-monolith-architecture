import { Injectable } from "@nestjs/common";
import { err, Result } from "neverthrow";
import bcrypt from "bcryptjs";
import { User } from "../../domain/entities/user.entity";
import { EmailTaken } from "../../domain/errors/user.errors";
import { UserCreatedEvent } from "../../domain/events/user.events";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByEmailQuery } from "../queries/get-user-by-email.query";
import { DatabaseService, TransactionError } from "../../../../infrastructure/database/database.service";
import { OutboxService } from "../../../../infrastructure/outbox/outbox.service";

const BCRYPT_ROUNDS = 12;

@Injectable()
export class CreateUserCommand {
  constructor(
    private readonly repository: UsersRepository,
    private readonly getUserByEmail: GetUserByEmailQuery,
    private readonly databaseService: DatabaseService,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(data: { email: string; name: string; password: string }): Promise<Result<User, EmailTaken | TransactionError>> {
    const existing = await this.getUserByEmail.execute(data.email);
    if (existing.isErr()) return err(existing.error);
    if (existing.value) return err({ type: "EMAIL_TAKEN", email: data.email });

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    return this.databaseService.withTransaction(async () => {
      const result = await this.repository.create({
        email: data.email,
        name: data.name,
        passwordHash,
        role: "user",
      });

      if (result.isErr()) throw result.error; // Will abort transaction, caught externally if we handled it, but neverthrow doesn't natively bubble. 
      // Actually withTransaction doesn't natively handle throwing inside, it aborts but we want to return err.
      // Wait, withTransaction catches throws and returns err(TransactionError).
      // Let's manually bubble up by returning if possible?
      // withTransaction returns Result<T, TransactionError>. If we want to return EmailTaken from inside? We already checked EMAIL_TAKEN before the transaction.
      // So result.isErr() should theoretically never happen here, but if it does, throwing is fine to abort.
      
      const user = result.value;

      // Use Outbox instead of direct Event Emitter to guarantee 100% reliable execution
      await this.outboxService.dispatch("user.created", new UserCreatedEvent(user.id, user.email, user.name));

      return user;
    });
  }
}
