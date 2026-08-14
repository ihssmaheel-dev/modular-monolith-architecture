import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { ZodValidationException } from "../exceptions/zod-validation.exception";
import type { FastifyReply, FastifyRequest } from "fastify";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";
import { I18nService } from "../../infrastructure/i18n/i18n.service";

const ERROR_MESSAGE_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "api.error.badRequest",
  [HttpStatus.UNAUTHORIZED]: "api.error.unauthorized",
  [HttpStatus.FORBIDDEN]: "api.error.forbidden",
  [HttpStatus.NOT_FOUND]: "api.error.notFound",
  [HttpStatus.CONFLICT]: "api.error.conflict",
  [HttpStatus.TOO_MANY_REQUESTS]: "api.error.rateLimited",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "api.error.internal",
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly i18n: I18nService,
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

        // If the translation returns the raw key, it wasn't found, so fallback to Zod's default message
        const msg = translation !== key ? translation : issue.message;
        errors[path].push(msg);
      }

      response.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.i18n.t("api.error.validationFailed", acceptLanguage),
        errors,
      });
      return;
    }

    const errorDetails = exception instanceof HttpException ? exception.getResponse() : null;
    const customError = this.getCustomError(errorDetails);
    const messageKey = ERROR_MESSAGE_MAP[status] ?? "api.error.internal";
    const message = customError?.message ?? this.i18n.t(messageKey, acceptLanguage);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({ err: exception }, "Unhandled exception");
    }

    response.status(status).send({
      statusCode: status,
      message,
      ...(customError ? { error: customError.code } : {}),
    });
  }

  private getCustomError(value: string | object | null): { message: string; code: string } | null {
    if (typeof value !== "object" || value === null) return null;
    if (!("message" in value) || !("error" in value)) return null;
    if (typeof value.message !== "string" || typeof value.error !== "string") return null;
    return { message: value.message, code: value.error };
  }
}
