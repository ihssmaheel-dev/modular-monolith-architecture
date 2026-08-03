import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginCommand } from "./login.command";
import { VerifyUserCredentialsQuery } from "../../../users/application/queries/verify-user-credentials.query";
import { ok } from "neverthrow";
import * as jwtUtils from "../utils/jwt.utils";
import { User } from "../../../users/domain/entities/user.entity";

vi.mock("../utils/jwt.utils", () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
}));

describe("LoginCommand", () => {
  let command: LoginCommand;
  let verifyCredentials: VerifyUserCredentialsQuery;

  beforeEach(() => {
    vi.clearAllMocks();
    
    verifyCredentials = {
      execute: vi.fn(),
    } as unknown as VerifyUserCredentialsQuery;
    
    command = new LoginCommand(verifyCredentials);
  });

  it("should return ok with tokens and user data when credentials are valid", async () => {
    // Arrange
    const user = User.fromPersistence({
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      role: "USER" as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    vi.mocked(verifyCredentials.execute).mockResolvedValue(ok(user));
    vi.mocked(jwtUtils.signAccessToken).mockReturnValue("access-token");
    vi.mocked(jwtUtils.signRefreshToken).mockReturnValue("refresh-token");

    // Act
    const result = await command.execute({ email: "test@example.com", password: "password123" });

    // Assert
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: {
          id: "user-123",
          email: "test@example.com",
          name: "Test User",
          role: "USER",
        },
      });
    }
    
    expect(verifyCredentials.execute).toHaveBeenCalledWith("test@example.com", "password123");
    expect(jwtUtils.signAccessToken).toHaveBeenCalledWith("user-123", "test@example.com", "USER");
    expect(jwtUtils.signRefreshToken).toHaveBeenCalledWith("user-123");
  });

  it("should return err INVALID_CREDENTIALS when credentials are invalid", async () => {
    // Arrange
    vi.mocked(verifyCredentials.execute).mockResolvedValue(ok(null));

    // Act
    const result = await command.execute({ email: "test@example.com", password: "wrong" });

    // Assert
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toEqual({ type: "INVALID_CREDENTIALS" });
    }
    expect(jwtUtils.signAccessToken).not.toHaveBeenCalled();
  });
});
