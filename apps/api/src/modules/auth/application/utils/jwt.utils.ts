import type { UserRole } from "@repo/contracts";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../../../config/env";

interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
  version: number;
  jti?: string;
}

export function signAccessToken(
  userId: string,
  email: string,
  name: string,
  role: UserRole,
  authVersion = 0,
): string {
  return jwt.sign(
    { sub: userId, email, name, role, authVersion },
    env.JWT_SECRET,
    tokenOptions(env.JWT_EXPIRES_IN, env.JWT_ISSUER, env.JWT_AUDIENCE),
  );
}

export function signRefreshToken(userId: string, version: number): string {
  return jwt.sign(
    { sub: userId, type: "refresh", version, jti: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    tokenOptions(env.JWT_REFRESH_EXPIRES_IN, env.JWT_ISSUER, env.JWT_AUDIENCE),
  );
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const value = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    });
    if (!isRefreshTokenPayload(value)) return null;
    return value;
  } catch {
    return null;
  }
}

function tokenOptions(expiresIn: string, issuer: string, audience: string): SignOptions {
  return { algorithm: "HS256", expiresIn: expiresIn as SignOptions["expiresIn"], issuer, audience };
}

function isRefreshTokenPayload(value: unknown): value is RefreshTokenPayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    payload.type === "refresh" &&
    typeof payload.sub === "string" &&
    typeof payload.version === "number" &&
    (payload.jti === undefined || typeof payload.jti === "string")
  );
}
