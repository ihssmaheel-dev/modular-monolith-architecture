import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { ZodValidationException } from "../exceptions/zod-validation.exception";
import type { FastifyReply, FastifyRequest } from "fastify";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";
import { I18nService } from "../../infrastructure/i18n/i18n.service";
import { ClsService } from "nestjs-cls";

const ERROR_MESSAGE_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "api.error.badRequest",
  [HttpStatus.UNAUTHORIZED]: "api.error.unauthorized",
  [HttpStatus.FORBIDDEN]: "api.error.forbidden",
  [HttpStatus.NOT_FOUND]: "api.error.notFound",
  [HttpStatus.CONFLICT]: "api.error.conflict",
  [HttpStatus.SERVICE_UNAVAILABLE]: "api.error.serviceUnavailable",
  [HttpStatus.TOO_MANY_REQUESTS]: "api.error.rateLimited",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "api.error.internal",
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly i18n: I18nService,
    private readonly cls?: ClsService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const acceptLanguage = request.headers["accept-language"];

    if (exception instanceof ZodValidationException) {
      const errors: Record<string, string[]> = {};
      for (const issue of exception.zodError.issues) {
        const path = issue.path.join(".") || "root";
        if (!errors[path]) errors[path] = [];

        // Zod issues contain dynamic properties like 'expected', 'received', 'minimum', etc.
        const key = `zod.errors.${issue.code}`;
        // We pass the issue as params so `{{expected}}` interpolates properly
        const params = issue as unknown as Record<string, string | number>;
        const translation = this.i18n.t(key, acceptLanguage, params);

        // Never expose schema implementation messages; keep validation output localized.
        const msg =
          translation !== key
            ? translation
            : this.i18n.t("api.error.validationFailed", acceptLanguage);
        errors[path].push(msg);
      }

      response.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.i18n.t("api.error.validationFailed", acceptLanguage),
        code: "VALIDATION_FAILED",
        requestId: this.requestId(),
        path: request.url,
        errors,
      });
      return;
    }

    const errorDetails = exception instanceof HttpException ? exception.getResponse() : null;
    const customError = this.getCustomError(errorDetails);
    const messageKey = ERROR_MESSAGE_MAP[status] ?? "api.error.internal";
    const message = customError?.messageKey
      ? this.i18n.t(customError.messageKey, acceptLanguage)
      : (customError?.message ?? this.i18n.t(messageKey, acceptLanguage));

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({ err: exception }, "Unhandled exception");
    }

    response.status(status).send({
      statusCode: status,
      message,
      code: customError?.code ?? this.codeForStatus(status),
      error: customError?.code ?? this.codeForStatus(status),
      requestId: this.requestId(),
      path: request.url,
    });
  }

  private getCustomError(
    value: string | object | null,
  ): { messageKey?: string; message?: string; code: string } | null {
    if (typeof value !== "object" || value === null) return null;
    if (!("message" in value) || !("error" in value)) return null;
    if (typeof value.message !== "string" || typeof value.error !== "string") return null;
    if (value.message === value.error) return null;
    if (value.message.startsWith("api.")) {
      return { messageKey: value.message, code: value.error };
    }
    if (/^[A-Z][A-Z0-9_]+$/.test(value.error)) {
      return { message: value.message, code: value.error };
    }
    return null;
  }

  private requestId(): string | undefined {
    return this.cls?.isActive() ? this.cls.get("requestId") : undefined;
  }

  private codeForStatus(status: number): string {
    return HttpStatus[status] ?? "INTERNAL_SERVER_ERROR";
  }
}
