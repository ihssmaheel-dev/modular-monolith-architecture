import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { trace } from "@opentelemetry/api";
import type { FastifyReply } from "fastify";

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const span = trace.getActiveSpan();

    if (span) {
      const { traceId } = span.spanContext();
      const ctx = context.switchToHttp();
      const response = ctx.getResponse<FastifyReply>();
      response.header("x-trace-id", traceId);
    }

    return next.handle();
  }
}
