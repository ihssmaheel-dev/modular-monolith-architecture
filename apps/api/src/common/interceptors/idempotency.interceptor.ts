import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ServiceUnavailableException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { ClsService } from "nestjs-cls";
import { Reflector } from "@nestjs/core";
import { from, of, type Observable } from "rxjs";
import { catchError, concatMap, map, mergeMap } from "rxjs/operators";
import { env } from "../../config/env";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { IDEMPOTENT_KEY } from "../decorators/idempotent.decorator";
import {
  CACHE_KEY_PREFIX,
  MAX_IDEMPOTENCY_KEY_LENGTH,
  VALID_IDEMPOTENCY_KEY,
  requestFingerprint,
} from "../utils/idempotency.utils";
import { IdempotencyStore } from "../utils/idempotency.store";

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly store: IdempotencyStore;

  constructor(
    private readonly reflector: Reflector,
    redisService: RedisService,
    private readonly cls: ClsService,
    logger: PinoLoggerService,
  ) {
    this.store = new IdempotencyStore(redisService, logger);
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    if (!this.isIdempotent(context)) return next.handle();
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const key = request.headers["idempotency-key"];
    this.assertValidKey(key);
    if (!this.storeAvailable()) return next.handle();

    const scope = this.cls.get("tenantId") || "single";
    const actor = this.cls.get("userId") || request.ip || "anonymous";
    const cacheKey = `${CACHE_KEY_PREFIX}:${scope}:${actor}:${key}`;
    const fingerprint = requestFingerprint(request);
    const cached = await this.store.claimOrRead(cacheKey, fingerprint);
    if (cached !== undefined) return of(cached);

    return next.handle().pipe(
      concatMap((body) =>
        from(this.store.cacheResponse(cacheKey, fingerprint, body)).pipe(map(() => body)),
      ),
      catchError((error: unknown) =>
        from(this.store.release(cacheKey, fingerprint)).pipe(
          catchError(() => of(undefined)),
          mergeMap(() => {
            throw error;
          }),
        ),
      ),
    );
  }

  private isIdempotent(context: ExecutionContext): boolean {
    return Boolean(
      this.reflector.getAllAndOverride<boolean>(IDEMPOTENT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]),
    );
  }

  private assertValidKey(key: string | string[] | undefined): asserts key is string {
    if (
      typeof key !== "string" ||
      key.length === 0 ||
      key.length > MAX_IDEMPOTENCY_KEY_LENGTH ||
      !VALID_IDEMPOTENCY_KEY.test(key)
    ) {
      throw new BadRequestException({
        code: "IDEMPOTENCY_KEY_INVALID",
        i18nKey: "api.error.invalidRequest",
        fieldErrors: {},
      });
    }
  }

  private storeAvailable(): boolean {
    if (this.store.isAvailable()) return true;
    if (env.NODE_ENV === "production") {
      throw new ServiceUnavailableException({
        code: "IDEMPOTENCY_UNAVAILABLE",
        i18nKey: "api.error.serviceUnavailable",
        fieldErrors: {},
      });
    }
    return false;
  }
}
