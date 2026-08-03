import { describe, it, expect, vi, beforeEach } from "vitest";
import { RefreshTokensCommand } from "./refresh-tokens.command";
import { GetUserByIdQuery } from "../../../users/application/queries/get-user-by-id.query";
import { ok, err } from "neverthrow";
import jwt from "jsonwebtoken";
import * as jwtUtils from "../utils/jwt.utils";
import { User } from "../../../users/domain/entities/user.entity";
import { env } from "../../../../config/env";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("../utils/jwt.utils", () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
}));

describe("RefreshTokensCommand", () => {
  let command: RefreshTokensCommand;
  let getUserById: GetUserByIdQuery;

  beforeEach(() => {
    vi.clearAllMocks();
    
    getUserById = {
      execute: vi.fn(),
    } as unknown as GetUserByIdQuery;
    
    command = new RefreshTokensCommand(getUserById);
  });

  it("should return err INVALID_TOKEN if token type is not refresh", async () => {
    // Arrange
    vi.mocked(jwt.verify).mockReturnValue({ sub: "user-123", type: "access" } as any);

    // Act
    const result = await command.execute("invalid-token");

    // Assert
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: "INVALID_TOKEN" });
    }
  });

  it("should return err INVALID_TOKEN if verify throws", async () => {
    // Arrange
    vi.mocked(jwt.verify).mockImplementation(() => { throw new Error(); });

    // Act
    const result = await command.execute("bad-token");

    // Assert
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: "INVALID_TOKEN" });
    }
  });

  it("should return err USER_NOT_FOUND if user does not exist", async () => {
    // Arrange
    vi.mocked(jwt.verify).mockReturnValue({ sub: "user-123", type: "refresh" } as any);
    vi.mocked(getUserById.execute).mockResolvedValue(err({ type: "USER_NOT_FOUND", userId: "user-123" } as any));

    // Act
    const result = await command.execute("valid-refresh-token");

    // Assert
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: "USER_NOT_FOUND" });
    }
  });

  it("should return ok with new tokens if token is valid and user exists", async () => {
    // Arrange
    vi.mocked(jwt.verify).mockReturnValue({ sub: "user-123", type: "refresh" } as any);
    
    const user = User.fromPersistence({
      id: "user-123",
      email: "test@example.com",
      name: "Test",
      role: "USER" as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(getUserById.execute).mockResolvedValue(ok(user));
    vi.mocked(jwtUtils.signAccessToken).mockReturnValue("new-access");
    vi.mocked(jwtUtils.signRefreshToken).mockReturnValue("new-refresh");

    // Act
    const result = await command.execute("valid-refresh-token");

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual({
        accessToken: "new-access",
        refreshToken: "new-refresh",
        user: { id: "user-123", email: "test@example.com", name: "Test", role: "USER" },
      });
    }
    expect(jwt.verify).toHaveBeenCalledWith("valid-refresh-token", env.JWT_SECRET);
    expect(jwtUtils.signAccessToken).toHaveBeenCalledWith("user-123", "test@example.com", "USER");
  });
});
