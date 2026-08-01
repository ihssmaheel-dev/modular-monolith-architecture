import { SESSION_PREFIX, TOKEN_REVOCATION_PREFIX } from "./session.types";
import { RedisService } from "../redis/redis.service";

export function sessionKey(sessionId: string): string {
  return `${SESSION_PREFIX}${sessionId}`;
}

export function tokenRevocationKey(sessionId: string): string {
  return `${TOKEN_REVOCATION_PREFIX}${sessionId}`;
}

export function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isRevoked(redis: RedisService, sessionId: string): Promise<boolean> {
  const client = redis.getClient();
  if (!client) return false;
  const result = await client.get(tokenRevocationKey(sessionId));
  return result === "1";
}
