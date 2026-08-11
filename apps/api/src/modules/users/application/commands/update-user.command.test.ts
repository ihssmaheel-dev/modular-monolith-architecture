import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateUserCommand } from "./update-user.command";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByIdQuery } from "../queries/get-user-by-id.query";
import { GetUserByEmailQuery } from "../queries/get-user-by-email.query";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { User } from "../../domain/entities/user.entity";
import { ok, err } from "neverthrow";
import { UserUpdatedEvent } from "../../domain/events/user.events";
import { DistributedCacheService } from "../../../../infrastructure/cache/distributed-cache.service";

describe("UpdateUserCommand", () => {
  let command: UpdateUserCommand;
  let repository: UsersRepository;
  let getUserById: GetUserByIdQuery;
  let getUserByEmail: GetUserByEmailQuery;
  let eventEmitter: EventEmitter2;
  let distributedCacheService: DistributedCacheService;

  beforeEach(() => {
    repository = {
      updateById: vi.fn(),
    } as unknown as UsersRepository;

    getUserById = {
      execute: vi.fn(),
    } as unknown as GetUserByIdQuery;

    getUserByEmail = {
      execute: vi.fn(),
    } as unknown as GetUserByEmailQuery;

    eventEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2;

    distributedCacheService = {
      invalidateGlobal: vi.fn(),
    } as unknown as DistributedCacheService;

    command = new UpdateUserCommand(
      repository,
      getUserById,
      getUserByEmail,
      eventEmitter,
      distributedCacheService,
    );
  });

  it("should return USER_NOT_FOUND if user does not exist", async () => {
    // Arrange
    vi.mocked(getUserById.execute).mockResolvedValue(
      err({ type: "USER_NOT_FOUND", userId: "123" }),
    );

    // Act
    const result = await command.execute("123", { name: "New Name" });

    // Assert
    expect(result.isErr()).toBe(true);
  });

  it("should return EMAIL_TAKEN if changing email to an existing one", async () => {
    // Arrange
    const user = User.fromPersistence({
      id: "123",
      email: "old@example.com",
      name: "Old",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getUserById.execute).mockResolvedValue(ok(user));

    const otherUser = User.fromPersistence({
      id: "456",
      email: "new@example.com",
      name: "Other",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getUserByEmail.execute).mockResolvedValue(ok(otherUser));

    // Act
    const result = await command.execute("123", { email: "new@example.com" });

    // Assert
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: "EMAIL_TAKEN", email: "new@example.com" });
    }
  });

  it("should update user, emit event, and return ok", async () => {
    // Arrange
    const user = User.fromPersistence({
      id: "123",
      email: "old@example.com",
      name: "Old",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getUserById.execute).mockResolvedValue(ok(user));
    vi.mocked(repository.updateById).mockResolvedValue(ok(user));

    // Act
    const result = await command.execute("123", { name: "New Name" });

    // Assert
    expect(result.isOk()).toBe(true);
    expect(repository.updateById).toHaveBeenCalledWith("123", {
      email: "old@example.com",
      name: "New Name",
      role: "user",
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith("user.updated", expect.any(UserUpdatedEvent));
  });
});
