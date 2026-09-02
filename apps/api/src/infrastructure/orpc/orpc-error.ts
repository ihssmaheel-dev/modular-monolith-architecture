import { HttpException, HttpStatus } from "@nestjs/common";
import { ClsServiceManager } from "nestjs-cls";
import { I18nService } from "../i18n/i18n.service";
import { createApiErrorEnvelope } from "../../common/utils/error-envelope.utils";
import { ORPCError } from "./orpc-runtime";

export async function invokeOrpc<T>(
  action: () => Promise<T>,
  i18n: I18nService,
  language?: string,
  requestId?: string,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw toOrpcError(error, i18n, language, requestId);
  }
}

function toOrpcError(
  error: unknown,
  i18n: I18nService,
  language: string | undefined,
  requestId: string | undefined,
): InstanceType<typeof ORPCError> {
  const status =
    error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  const envelope = createApiErrorEnvelope(
    error,
    status,
    language,
    requestId ?? requestIdFromContext() ?? "",
    i18n,
  );
  return new ORPCError(envelope.code, {
    status: envelope.status,
    message: envelope.message,
    data: envelope,
  });
}

function requestIdFromContext(): string | undefined {
  const cls = ClsServiceManager.getClsService();
  if (!cls.isActive()) return undefined;
  const requestId = cls.get("requestId");
  return typeof requestId === "string" ? requestId : undefined;
}
