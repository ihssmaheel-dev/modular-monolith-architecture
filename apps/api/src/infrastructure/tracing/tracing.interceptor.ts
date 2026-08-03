import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { trace } from "@opentelemetry/api";

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const span = trace.getActiveSpan();
    
    if (span) {
      const { traceId } = span.spanContext();
      const ctx = context.switchToHttp();
      const response = ctx.getResponse();
      
      // Fastify reply object has header method
      if (typeof response.header === 'function') {
        response.header("x-trace-id", traceId);
      } else if (typeof response.setHeader === 'function') {
        // Express fallback
        response.setHeader("x-trace-id", traceId);
      }
    }

    return next.handle();
  }
}
