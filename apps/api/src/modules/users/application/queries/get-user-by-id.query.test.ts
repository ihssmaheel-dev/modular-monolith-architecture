import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserByIdQuery } from "./get-user-by-id.query";
import { UsersRepository } from "../../infrastructure/users.repository";
import { User } from "../../domain/entities/user.entity";
import { ok } from "neverthrow";

describe("GetUserByIdQuery", () => {
  let query: GetUserByIdQuery;
  let repository: UsersRepository;

  beforeEach(() => {
    repository = {
      findById: vi.fn(),
    } as unknown as UsersRepository;
    
    query = new GetUserByIdQuery(repository);
  });



  it("should return USER_NOT_FOUND if user not found", async () => {
    // Arrange
    vi.mocked(repository.findById).mockResolvedValue(ok(null));

    // Act
    const result = await query.execute("123");

    // Assert
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: "USER_NOT_FOUND", userId: "123" });
    }
  });

  it("should return ok(user) if found", async () => {
    // Arrange
    const user = User.fromPersistence({ id: "123", email: "test@example.com", name: "Test", role: "user", createdAt: new Date(), updatedAt: new Date() });
    vi.mocked(repository.findById).mockResolvedValue(ok(user));

    // Act
    const result = await query.execute("123");

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(user);
    }
    expect(repository.findById).toHaveBeenCalledWith("123");
  });
});
