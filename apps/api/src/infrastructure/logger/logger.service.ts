import { Injectable, OnModuleDestroy } from "@nestjs/common";
import pino from "pino";
import { trace } from "@opentelemetry/api";
import { env } from "../../config/env";

export interface LogContext {
  userId?: string;
  requestId?: string;
  trace_id?: string;
  span_id?: string;
  [key: string]: unknown;
}

@Injectable()
export class PinoLoggerService implements OnModuleDestroy {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    });
  }

  private enrichContext(context: LogContext): LogContext {
    const span = trace.getActiveSpan();
    if (span) {
      const spanContext = span.spanContext();
      return {
        ...context,
        trace_id: spanContext.traceId,
        span_id: spanContext.spanId,
      };
    }
    return context;
  }

  info(context: LogContext, message: string) {
    this.logger.info(this.enrichContext(context), message);
  }

  warn(context: LogContext, message: string) {
    this.logger.warn(this.enrichContext(context), message);
  }

  error(context: LogContext, message: string) {
    this.logger.error(this.enrichContext(context), message);
  }

  debug(context: LogContext, message: string) {
    this.logger.debug(this.enrichContext(context), message);
  }

  child(bindings: Record<string, unknown>): PinoLoggerService {
    const child = new PinoLoggerService();
    child.logger = this.logger.child(bindings);
    return child;
  }

  onModuleDestroy() {
    this.logger.flush();
  }
}
