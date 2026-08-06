import jwt from "jsonwebtoken";
import { env } from "../../../../config/env";

export function signAccessToken(userId: string, email: string, role: string): string {
  return jwt.sign({ sub: userId, email, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, env.JWT_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
}
