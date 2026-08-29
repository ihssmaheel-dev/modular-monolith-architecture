import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { ClsService } from "nestjs-cls";
import { randomUUID } from "crypto";

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const requestId = (request.headers["x-request-id"] as string) || randomUUID();

    this.cls.set("requestId", requestId);

    if (typeof response.header === "function") {
      response.header("x-request-id", requestId);
    } else if (typeof response.setHeader === "function") {
      response.setHeader("x-request-id", requestId);
    }

    return next.handle().pipe(finalize(() => this.cls.set("requestId", undefined)));
  }
}
