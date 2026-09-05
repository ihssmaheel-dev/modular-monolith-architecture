import type { JwtPayload } from "jsonwebtoken";
import type { AuthenticatedUser } from "@repo/contracts";
import { env } from "../../config/env";
import { getJwtKeyring, verifyJwtWithKeyring } from "../../infrastructure/security/jwt-keyring";

export function verifyAccessToken(token: string): AuthenticatedUser | null {
  const decoded = verifyJwtWithKeyring(token, getJwtKeyring("access"), {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
  return decoded && isAuthenticatedUser(decoded) ? decoded : null;
}

function isAuthenticatedUser(value: JwtPayload): value is AuthenticatedUser {
  return (
    typeof value.sub === "string" &&
    typeof value.email === "string" &&
    (value.name === undefined || typeof value.name === "string") &&
    (value.role === "admin" || value.role === "user") &&
    (value.authVersion === undefined || typeof value.authVersion === "number")
  );
}
