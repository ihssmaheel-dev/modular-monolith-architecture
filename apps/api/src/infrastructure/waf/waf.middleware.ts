import { Injectable, NestMiddleware, HttpStatus } from "@nestjs/common";
import type { FastifyRequest, FastifyReply } from "fastify";
import {
  XSS_PATTERNS,
  SQL_INJECTION_PATTERNS,
  HEADER_INJECTION_PATTERNS,
  scanObject,
  containsPattern,
} from "./waf.patterns";
import { I18nService } from "../i18n/i18n.service";

const MAX_URL_LENGTH = 2048;

@Injectable()
export class WafMiddleware implements NestMiddleware {
  constructor(private readonly i18n: I18nService) {}

  async use(req: FastifyRequest, res: FastifyReply, next: () => void): Promise<void> {
    const url = req.url ?? "";
    const lang = req.headers["accept-language"] as string | undefined;

    if (url.length > MAX_URL_LENGTH) {
      res.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.i18n.t("api.error.urlTooLong", lang),
      });
      return;
    }

    if (containsPattern(url, [...XSS_PATTERNS, ...SQL_INJECTION_PATTERNS])) {
      res.status(HttpStatus.BAD_REQUEST).send({
        statusCode: HttpStatus.BAD_REQUEST,
        message: this.i18n.t("api.error.invalidRequest", lang),
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
            message: this.i18n.t("api.error.blockedContent", lang),
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
          message: this.i18n.t("api.error.invalidHeader", lang),
        });
        return;
      }
    }

    next();
  }
}
