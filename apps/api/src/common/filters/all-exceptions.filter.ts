import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
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

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const acceptLanguage = request.headers["accept-language"];
    const messageKey = ERROR_MESSAGE_MAP[status] ?? "api.error.internal";
    const message = this.i18n.t(messageKey, acceptLanguage);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({ err: exception }, "Unhandled exception");
    }

    response.status(status).send({
      statusCode: status,
      message,
      ...(exception instanceof HttpException
        ? { error: exception.getResponse() }
        : {}),
    });
  }
}
