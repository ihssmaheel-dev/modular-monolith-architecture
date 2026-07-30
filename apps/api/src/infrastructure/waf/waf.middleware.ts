import { Injectable, NestMiddleware, HttpStatus } from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
import {
  XSS_PATTERNS,
  SQL_INJECTION_PATTERNS,
  HEADER_INJECTION_PATTERNS,
  scanObject,
  containsPattern,
} from "./waf.patterns";

const MAX_URL_LENGTH = 2048;

@Injectable()
export class WafMiddleware implements NestMiddleware {
  async use(req: FastifyRequest, res: FastifyReply, next: () => void): Promise<void> {
    const url = req.url ?? "";

    if (url.length > MAX_URL_LENGTH) {
      res.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "URL too long",
      });
      return;
    }

    if (containsPattern(url, [...XSS_PATTERNS, ...SQL_INJECTION_PATTERNS])) {
      res.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Invalid request",
      });
      return;
    }

    const contentType = req.headers["content-type"] ?? "";
    if (contentType.includes("application/json")) {
      const body = req.body as Record<string, unknown> | undefined;
      if (body) {
        const violations = scanObject(body);
        if (violations.length > 0) {
          res.status(HttpStatus.BAD_REQUEST).send({
            statusCode: HttpStatus.BAD_REQUEST,
            message: "Request body contains blocked content",
            violations,
          });
          return;
        }
      }
    }

    for (const [, value] of Object.entries(req.headers)) {
      if (typeof value === "string" && containsPattern(value, HEADER_INJECTION_PATTERNS)) {
        res.status(HttpStatus.BAD_REQUEST).send({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Invalid header value",
        });
        return;
      }
    }

    next();
  }
}
