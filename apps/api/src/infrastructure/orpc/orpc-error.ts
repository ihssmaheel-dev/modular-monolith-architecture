import { HttpException, HttpStatus } from "@nestjs/common";
import { I18nService } from "../i18n/i18n.service";
import { ORPCError } from "./orpc-runtime";

type ErrorPayload = {
  code?: unknown;
  error?: unknown;
  message?: unknown;
};

const STATUS_MESSAGE_KEYS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "api.error.badRequest",
  [HttpStatus.UNAUTHORIZED]: "api.error.unauthorized",
  [HttpStatus.FORBIDDEN]: "api.error.forbidden",
  [HttpStatus.NOT_FOUND]: "api.error.notFound",
  [HttpStatus.CONFLICT]: "api.error.conflict",
  [HttpStatus.TOO_MANY_REQUESTS]: "api.error.rateLimited",
  [HttpStatus.SERVICE_UNAVAILABLE]: "api.error.serviceUnavailable",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "api.error.internal",
};

export async function invokeOrpc<T>(
  action: () => Promise<T>,
  i18n: I18nService,
  language?: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw toOrpcError(error, i18n, language);
  }
}

function toOrpcError(
  error: unknown,
  i18n: I18nService,
  language?: string,
): InstanceType<typeof ORPCError> {
  const status =
    error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  const payload = error instanceof HttpException ? readPayload(error.getResponse()) : undefined;
  const code = readCode(payload) ?? HttpStatus[status] ?? "INTERNAL_SERVER_ERROR";
  const message =
    readMessage(payload) ?? i18n.t(STATUS_MESSAGE_KEYS[status] ?? "api.error.internal", language);
  return new ORPCError(code, { status, message });
}

function readPayload(value: string | object): ErrorPayload | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const payload = value as Record<string, unknown>;
  return {
    code: payload.code ?? payload.error,
    error: payload.error,
    message: payload.message,
  };
}

function readCode(payload?: ErrorPayload): string | undefined {
  return typeof payload?.code === "string" ? payload.code : undefined;
}

function readMessage(payload?: ErrorPayload): string | undefined {
  return typeof payload?.message === "string" && !payload.message.startsWith("api.")
    ? payload.message
    : undefined;
}
