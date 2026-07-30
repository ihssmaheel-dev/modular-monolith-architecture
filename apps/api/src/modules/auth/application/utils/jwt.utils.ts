import jwt from "jsonwebtoken";
import { env } from "../../../../config/env";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export function signAccessToken(userId: string, email: string, role: string): string {
  return jwt.sign({ sub: userId, email, role }, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}
