import { randomUUID } from "node:crypto";

export const REQUEST_ID_HEADER = "x-request-id";
const MAX_REQUEST_ID_LENGTH = 128;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

export function resolveRequestId(value: string | string[] | undefined): string {
  if (typeof value === "string" && isValidRequestId(value)) return value;
  return randomUUID();
}

function isValidRequestId(value: string): boolean {
  return (
    value.length > 0 && value.length <= MAX_REQUEST_ID_LENGTH && REQUEST_ID_PATTERN.test(value)
  );
}
