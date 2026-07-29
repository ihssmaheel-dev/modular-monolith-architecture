import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: "Internal server error" };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({ err: exception }, "Unhandled exception");
    }

    response.status(status).send(message);
  }
}
