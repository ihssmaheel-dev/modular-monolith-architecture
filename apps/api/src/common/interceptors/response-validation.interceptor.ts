import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map, type Observable } from "rxjs";
import type { z } from "zod";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";
import { RESPONSE_SCHEMA_KEY } from "../decorators/response-schema.decorator";
import { ResponseValidationException } from "../exceptions/response-validation.exception";

@Injectable()
export class ResponseValidationInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "ResponseValidationInterceptor" });
  }

  private readonly logger: PinoLoggerService;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") return next.handle();
    const schema = this.reflector.getAllAndOverride<z.ZodType>(RESPONSE_SCHEMA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!schema) return next.handle();

    return next.handle().pipe(
      map((value: unknown) => {
        const parsed = schema.safeParse(value);
        if (parsed.success) return parsed.data;
        this.logger.error(
          { issues: parsed.error.issues },
          "Controller response violated its shared contract",
        );
        throw new ResponseValidationException(parsed.error.issues);
      }),
    );
  }
}
