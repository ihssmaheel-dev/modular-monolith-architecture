import { describe, it, expect, vi, beforeEach } from "vitest";
import { ok } from "neverthrow";
import { GetUserByIdQuery } from "./get-user-by-id.query";
import { User } from "../../domain/entities/user.entity";

describe("GetUserByIdQuery", () => {
  let query: GetUserByIdQuery;
  const mockFindById = vi.fn();
  const mockCacheGetOrSet = vi.fn((_key, _ttl, fetcher) => fetcher());

  beforeEach(() => {
    vi.clearAllMocks();
    query = new GetUserByIdQuery(
      { findById: mockFindById } as any,
      { getOrSet: mockCacheGetOrSet } as any
    );
  });



  it("should return USER_NOT_FOUND if user not found", async () => {
    // Arrange
    vi.mocked(mockFindById).mockResolvedValue(ok(null));

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
    vi.mocked(mockFindById).mockResolvedValue(ok(user));

    // Act
    const result = await query.execute("123");

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(user);
    }
    expect(mockFindById).toHaveBeenCalledWith("123");
  });
});
