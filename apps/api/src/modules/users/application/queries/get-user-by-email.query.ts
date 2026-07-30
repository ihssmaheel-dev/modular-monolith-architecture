import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { User } from "../../domain/entities/user.entity";
import { UsersRepository } from "../../infrastructure/users.repository";

@Injectable()
export class GetUserByEmailQuery {
  constructor(private readonly repository: UsersRepository) {}

  async execute(email: string): Promise<Result<User | null, never>> {
    return this.repository.findByEmail(email);
  }
}
