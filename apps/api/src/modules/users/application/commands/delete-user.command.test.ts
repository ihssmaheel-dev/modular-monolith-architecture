import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteUserCommand } from "./delete-user.command";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByIdQuery } from "../queries/get-user-by-id.query";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { User } from "../../domain/entities/user.entity";
import { ok, err } from "neverthrow";
import { UserDeletedEvent } from "../../domain/events/user.events";

describe("DeleteUserCommand", () => {
  let command: DeleteUserCommand;
  let repository: UsersRepository;
  let getUserById: GetUserByIdQuery;
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    repository = {
      deleteById: vi.fn(),
    } as unknown as UsersRepository;

    getUserById = {
      execute: vi.fn(),
    } as unknown as GetUserByIdQuery;

    eventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2;
    
    command = new DeleteUserCommand(repository, getUserById, eventEmitter);
  });

  it("should return USER_NOT_FOUND if user does not exist", async () => {
    // Arrange
    vi.mocked(getUserById.execute).mockResolvedValue(err({ type: "USER_NOT_FOUND", userId: "123" }));

    // Act
    const result = await command.execute("123");

    // Assert
    expect(result.isErr()).toBe(true);
  });

  it("should delete user, emit event, and return ok", async () => {
    // Arrange
    const user = User.fromPersistence({ id: "123", email: "old@example.com", name: "Old", role: "user", createdAt: new Date(), updatedAt: new Date() });
    vi.mocked(getUserById.execute).mockResolvedValue(ok(user));
    vi.mocked(repository.deleteById).mockResolvedValue(ok(true));

    // Act
    const result = await command.execute("123");

    // Assert
    expect(result.isOk()).toBe(true);
    expect(repository.deleteById).toHaveBeenCalledWith("123");
    expect(eventEmitter.emit).toHaveBeenCalledWith("user.deleted", expect.any(UserDeletedEvent));
  });

  it("should return USER_NOT_FOUND if repository delete fails", async () => {
    // Arrange
    const user = User.fromPersistence({ id: "123", email: "old@example.com", name: "Old", role: "user", createdAt: new Date(), updatedAt: new Date() });
    vi.mocked(getUserById.execute).mockResolvedValue(ok(user));
    vi.mocked(repository.deleteById).mockResolvedValue(ok(false));

    // Act
    const result = await command.execute("123");

    // Assert
    expect(result.isErr()).toBe(true);
  });
});
