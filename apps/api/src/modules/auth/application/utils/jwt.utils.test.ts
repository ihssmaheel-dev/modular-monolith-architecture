import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { signAccessToken, signRefreshToken } from "./jwt.utils";
import { env } from "../../../../config/env";

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

describe("jwt.utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signAccessToken", () => {
    it("should sign a JWT with the correct payload and expiry", () => {
      // Arrange
      const userId = "user-123";
      const email = "test@example.com";
      const role = "USER";
      vi.mocked(jwt.sign).mockReturnValue("mock-access-token" as any);

      // Act
      const token = signAccessToken(userId, email, role);

      // Assert
      expect(token).toBe("mock-access-token");
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: userId, email, role },
        env.JWT_SECRET,
        { expiresIn: "15m" }
      );
    });
  });

  describe("signRefreshToken", () => {
    it("should sign a refresh token with the correct payload and expiry", () => {
      // Arrange
      const userId = "user-123";
      vi.mocked(jwt.sign).mockReturnValue("mock-refresh-token" as any);

      // Act
      const token = signRefreshToken(userId);

      // Assert
      expect(token).toBe("mock-refresh-token");
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: userId, type: "refresh" },
        env.JWT_SECRET,
        { expiresIn: "7d" }
      );
    });
  });
});
