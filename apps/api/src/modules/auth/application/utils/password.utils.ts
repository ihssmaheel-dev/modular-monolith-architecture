import { createHash, randomBytes } from "crypto";

/**
 * Generates a secure random token, typically used for password resets or email verification.
 * @param length The length of the token in bytes (default 32)
 * @returns A hexadecimal string representation of the secure token
 */
export function generateSecureToken(length = 32): string {
  const tokenBytes = randomBytes(length);
  return tokenBytes.toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
