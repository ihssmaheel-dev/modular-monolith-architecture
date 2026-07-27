import { Injectable } from "@nestjs/common";
import pino from "pino";

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
      level: process.env["LOG_LEVEL"] ?? "info",
      transport:
        process.env["NODE_ENV"] !== "production"
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
