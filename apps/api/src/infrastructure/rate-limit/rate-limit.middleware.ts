import { Injectable, NestMiddleware, HttpStatus } from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
import { RateLimitService } from "./rate-limit.service";
import { I18nService } from "../i18n/i18n.service";

const RATE_LIMIT_HEADERS = {
  REMAINING: "X-RateLimit-Remaining",
  RESET: "X-RateLimit-Reset",
  LIMIT: "X-RateLimit-Limit",
};

const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_SECONDS = 60;

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(
    private readonly rateLimit: RateLimitService,
    private readonly i18n: I18nService,
  ) {}

  async use(req: FastifyRequest, res: FastifyReply, next: () => void): Promise<void> {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const route = req.routeOptions?.url ?? req.url;
    const lang = req.headers["accept-language"] as string | undefined;

    const result = await this.rateLimit.check(`ip:${ip}:route:${route}`, {
      windowSeconds: DEFAULT_WINDOW_SECONDS,
      maxRequests: DEFAULT_MAX_REQUESTS,
    });

    res.header(RATE_LIMIT_HEADERS.LIMIT, DEFAULT_MAX_REQUESTS.toString());
    res.header(RATE_LIMIT_HEADERS.REMAINING, result.remaining.toString());
    res.header(RATE_LIMIT_HEADERS.RESET, result.resetAt.toString());

    if (!result.allowed) {
      res.status(HttpStatus.TOO_MANY_REQUESTS).send({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: this.i18n.t("api.error.rateLimited", lang),
        error: "Rate limit exceeded",
      });
      return;
    }

    next();
  }
}
