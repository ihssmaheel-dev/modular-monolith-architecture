import { Injectable } from "@nestjs/common";
import pino from "pino";
import { env } from "../../config/env";

export interface LogContext {
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

@Injectable()
export class PinoLoggerService {
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

  info(context: LogContext, message: string) {
    this.logger.info(context, message);
  }

  warn(context: LogContext, message: string) {
    this.logger.warn(context, message);
  }

  error(context: LogContext, message: string) {
    this.logger.error(context, message);
  }

  debug(context: LogContext, message: string) {
    this.logger.debug(context, message);
  }

  child(bindings: Record<string, unknown>): PinoLoggerService {
    const child = new PinoLoggerService();
    child.logger = this.logger.child(bindings);
    return child;
  }
}
