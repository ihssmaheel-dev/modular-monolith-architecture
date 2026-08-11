import type { UserRole } from "@repo/shared";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../../../config/env";

interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
  version: number;
}

export function signAccessToken(
  userId: string,
  email: string,
  name: string,
  role: UserRole,
): string {
  return jwt.sign(
    { sub: userId, email, name, role },
    env.JWT_SECRET,
    tokenOptions(env.JWT_EXPIRES_IN),
  );
}

export function signRefreshToken(userId: string, version: number): string {
  return jwt.sign(
    { sub: userId, type: "refresh", version },
    env.JWT_REFRESH_SECRET,
    tokenOptions(env.JWT_REFRESH_EXPIRES_IN),
  );
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const value = jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
    if (!isRefreshTokenPayload(value)) return null;
    return value;
  } catch {
    return null;
  }
}

function tokenOptions(expiresIn: string): SignOptions {
  return { algorithm: "HS256", expiresIn: expiresIn as SignOptions["expiresIn"] };
}

function isRefreshTokenPayload(value: unknown): value is RefreshTokenPayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    payload.type === "refresh" &&
    typeof payload.sub === "string" &&
    typeof payload.version === "number"
  );
}
