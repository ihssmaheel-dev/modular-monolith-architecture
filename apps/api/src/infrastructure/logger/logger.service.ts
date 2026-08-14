import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
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

  constructor(private readonly cls: ClsService) {
    this.logger = pino({
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : {
              target: "pino-loki",
              options: {
                batching: true,
                interval: 5,
                host: env.LOKI_HOST,
                labels: { application: "api-service" },
              },
            },
    });
  }

  private enrichContext(context: LogContext): LogContext {
    const requestId = this.cls.get("requestId");
    const enriched = { ...context };

    if (requestId && !enriched.requestId) {
      enriched.requestId = requestId;
    }

    const span = trace.getActiveSpan();
    if (span) {
      const spanContext = span.spanContext();
      enriched.trace_id = spanContext.traceId;
      enriched.span_id = spanContext.spanId;
    }

    return enriched;
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
    const child = new PinoLoggerService(this.cls);
    child.logger = this.logger.child(bindings);
    return child;
  }

  onModuleDestroy() {
    this.logger.flush();
  }
}
