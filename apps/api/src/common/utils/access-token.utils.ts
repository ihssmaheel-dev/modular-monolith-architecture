import jwt from "jsonwebtoken";
import type { AuthenticatedUser } from "@repo/shared";
import { env } from "../../config/env";

export function verifyAccessToken(token: string): AuthenticatedUser | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (typeof decoded === "string") return null;
    if (!isAuthenticatedUser(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

function isAuthenticatedUser(value: jwt.JwtPayload): value is AuthenticatedUser {
  return (
    typeof value.sub === "string" &&
    typeof value.email === "string" &&
    (value.role === "admin" || value.role === "user")
  );
}
