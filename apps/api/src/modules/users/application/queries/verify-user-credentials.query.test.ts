import { describe, it, expect, vi, beforeEach } from "vitest";
import { VerifyUserCredentialsQuery } from "./verify-user-credentials.query";
import { UsersRepository } from "../../infrastructure/users.repository";
import { GetUserByIdQuery } from "./get-user-by-id.query";
import { User } from "../../domain/entities/user.entity";
import { ok } from "neverthrow";
import bcrypt from "bcryptjs";

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe("VerifyUserCredentialsQuery", () => {
  let query: VerifyUserCredentialsQuery;
  let repository: UsersRepository;
  let getUserById: GetUserByIdQuery;

  beforeEach(() => {
    repository = {
      findByEmailWithPassword: vi.fn(),
    } as unknown as UsersRepository;
    
    getUserById = {
      execute: vi.fn(),
    } as unknown as GetUserByIdQuery;

    query = new VerifyUserCredentialsQuery(repository, getUserById);
  });

  it("should return ok(null) if user not found", async () => {
    // Arrange
    vi.mocked(repository.findByEmailWithPassword).mockResolvedValue(ok(null));

    // Act
    const result = await query.execute("test@example.com", "pwd");

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBeNull();
    }
  });

  it("should return ok(null) if password does not match", async () => {
    // Arrange
    const dbUser = { _id: "123", passwordHash: "hash" };
    vi.mocked(repository.findByEmailWithPassword).mockResolvedValue(ok(dbUser as any));
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    // Act
    const result = await query.execute("test@example.com", "wrong");

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBeNull();
    }
  });

  it("should return ok(user) if credentials are valid", async () => {
    // Arrange
    const dbUser = { _id: "123", passwordHash: "hash" };
    const user = User.fromPersistence({ id: "123", email: "test@example.com", name: "Test", role: "user", createdAt: new Date(), updatedAt: new Date() });
    
    vi.mocked(repository.findByEmailWithPassword).mockResolvedValue(ok(dbUser as any));
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(getUserById.execute).mockResolvedValue(ok(user));

    // Act
    const result = await query.execute("test@example.com", "correct");

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(user);
    }
  });
});
