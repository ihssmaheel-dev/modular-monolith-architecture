import type { UserRole } from "@repo/contracts";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../../../config/env";
import {
  getJwtKeyring,
  verifyJwtWithKeyring,
} from "../../../../infrastructure/security/jwt-keyring";

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
  const keyring = getJwtKeyring("access");
  return jwt.sign(
    { sub: userId, email, name, role, authVersion },
    keyring.keys[keyring.activeKeyId] ?? env.JWT_SECRET,
    tokenOptions(env.JWT_EXPIRES_IN, env.JWT_ISSUER, env.JWT_AUDIENCE, keyring.activeKeyId),
  );
}

export function signRefreshToken(userId: string, version: number): string {
  const keyring = getJwtKeyring("refresh");
  return jwt.sign(
    { sub: userId, type: "refresh", version, jti: crypto.randomUUID() },
    keyring.keys[keyring.activeKeyId] ?? env.JWT_REFRESH_SECRET,
    tokenOptions(env.JWT_REFRESH_EXPIRES_IN, env.JWT_ISSUER, env.JWT_AUDIENCE, keyring.activeKeyId),
  );
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  const value = verifyJwtWithKeyring(token, getJwtKeyring("refresh"), {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
  return value && isRefreshTokenPayload(value) ? value : null;
}

function tokenOptions(
  expiresIn: string,
  issuer: string,
  audience: string,
  keyId: string,
): SignOptions {
  return {
    algorithm: "HS256",
    expiresIn: expiresIn as SignOptions["expiresIn"],
    issuer,
    audience,
    keyid: keyId,
  };
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
