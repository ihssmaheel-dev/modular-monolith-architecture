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
      const userId = "user-123";
      const email = "test@example.com";
      const role = "user" as const;
      vi.mocked(jwt.sign).mockImplementation(() => "mock-access-token");

      const token = signAccessToken(userId, email, "Test User", role);

      expect(token).toBe("mock-access-token");
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: userId, email, name: "Test User", role },
        env.JWT_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "15m",
          issuer: env.JWT_ISSUER,
          audience: env.JWT_AUDIENCE,
        },
      );
    });
  });

  describe("signRefreshToken", () => {
    it("should sign a refresh token with the correct payload and expiry", () => {
      const userId = "user-123";
      const version = 2;
      vi.mocked(jwt.sign).mockImplementation(() => "mock-refresh-token");

      const token = signRefreshToken(userId, version);

      expect(token).toBe("mock-refresh-token");
      const [payload] = vi.mocked(jwt.sign).mock.calls[0] ?? [];
      expect(payload).toEqual({
        sub: userId,
        type: "refresh",
        version,
        jti: expect.any(String),
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: userId, type: "refresh", version }),
        env.JWT_REFRESH_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "7d",
          issuer: env.JWT_ISSUER,
          audience: env.JWT_AUDIENCE,
        },
      );
    });
  });
});
