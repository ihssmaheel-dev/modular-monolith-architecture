import { createHash } from "node:crypto";
import type { FastifyRequest } from "fastify";

export const CACHE_KEY_PREFIX = "idempotency:v2";
export const MAX_IDEMPOTENCY_KEY_LENGTH = 128;
export const VALID_IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]+$/;
export const MILLISECONDS_PER_SECOND = 1000;

export const FINALIZE_IDEMPOTENCY_SCRIPT = `
  local current = redis.call('GET', KEYS[1])
  if not current then return 0 end
  local record = cjson.decode(current)
  if record.state ~= 'processing' or record.fingerprint ~= ARGV[1] then return 0 end
  redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
  return 1
`;
export const RELEASE_IDEMPOTENCY_SCRIPT = `
  local current = redis.call('GET', KEYS[1])
  if not current then return 0 end
  local record = cjson.decode(current)
  if record.state ~= 'processing' or record.fingerprint ~= ARGV[1] then return 0 end
  return redis.call('DEL', KEYS[1])
`;
export const RECOVER_IDEMPOTENCY_SCRIPT = `
  local current = redis.call('GET', KEYS[1])
  if not current or current ~= ARGV[1] then return 0 end
  redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
  return 1
`;

export type RequestFingerprint = {
  digest: string;
  method: string;
  route: string;
  bodyHash: string;
};

export type ProcessingRecord = {
  state: "processing";
  fingerprint: string;
  method: string;
  route: string;
  bodyHash: string;
  startedAt: number;
};

export type CompletedRecord = {
  state: "completed";
  fingerprint: string;
  method: string;
  route: string;
  bodyHash: string;
  body: unknown;
  bodyBytes: number;
  completedAt: number;
};

export type IdempotencyRecord = ProcessingRecord | CompletedRecord;

export function requestFingerprint(request: FastifyRequest): RequestFingerprint {
  const method = (request.method ?? "GET").toUpperCase();
  const route = request.routeOptions?.url ?? request.url?.split("?")[0] ?? "/";
  const bodyHash = createHash("sha256").update(stableSerialize(request.body)).digest("hex");
  return {
    digest: createHash("sha256").update(`${method}\n${route}\n${bodyHash}`).digest("hex"),
    method,
    route,
    bodyHash,
  };
}

export function stableSerialize(value: unknown): string {
  return JSON.stringify(normalize(value)) ?? "null";
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (!isRecord(value)) return value ?? null;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, normalize(value[key])]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
