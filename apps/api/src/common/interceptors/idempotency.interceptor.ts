import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { Observable, of, throwError } from "rxjs";
import { catchError, concatMap, map, mergeMap } from "rxjs/operators";
import { from } from "rxjs";
import { Reflector } from "@nestjs/core";
import { ClsService } from "nestjs-cls";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { IDEMPOTENT_KEY } from "../decorators/idempotent.decorator";
import type { FastifyRequest } from "fastify";
import type Redis from "ioredis";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";

const CACHE_TTL_SECONDS = 24 * 60 * 60;
const MAX_KEY_LENGTH = 128;
const VALID_KEY = /^[A-Za-z0-9._:-]+$/;

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
    private readonly cls: ClsService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "IdempotencyInterceptor" });
  }

  private readonly logger: PinoLoggerService;

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const isIdempotent = this.reflector.getAllAndOverride<boolean>(IDEMPOTENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isIdempotent) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const idempotencyKey = request.headers["idempotency-key"];

    if (!this.isValidKey(idempotencyKey)) {
      throw new BadRequestException();
    }

    const redis = this.redisService.getClient();
    if (!redis) {
      // If Redis is disabled, we bypass idempotency to prevent blocking the app
      return next.handle();
    }

    const userId = this.cls.get("userId") || request.ip || "anonymous";
    const tenantId = this.cls.get("tenantId") || "single";
    const cacheKey = `idempotency:${tenantId}:${userId}:${idempotencyKey}`;

    const cached = await this.claimOrRead(redis, cacheKey);
    if (cached !== undefined) return of(cached);
    return next.handle().pipe(
      concatMap((response) =>
        from(this.cacheResponse(redis, cacheKey, response)).pipe(map(() => response)),
      ),
      catchError((error) => this.releaseAndRethrow(redis, cacheKey, error)),
    );
  }

  private isValidKey(value: string | string[] | undefined): value is string {
    return typeof value === "string" && value.length <= MAX_KEY_LENGTH && VALID_KEY.test(value);
  }

  private async claimOrRead(redis: Redis, key: string): Promise<unknown | undefined> {
    const claimed = await redis.set(key, "PROCESSING", "EX", CACHE_TTL_SECONDS, "NX");
    if (claimed) return undefined;
    const value = await redis.get(key);
    if (!value || value === "PROCESSING") throw new ConflictException();
    try {
      return JSON.parse(value) as unknown;
    } catch {
      this.logger.error({ key }, "Invalid cached idempotency response");
      throw new ConflictException();
    }
  }

  private async cacheResponse(redis: Redis, key: string, response: unknown): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(response), "EX", CACHE_TTL_SECONDS);
    } catch (error) {
      this.logger.error({ key, error }, "Failed to cache idempotent response");
    }
  }

  private releaseAndRethrow(redis: Redis, key: string, error: unknown): Observable<never> {
    return from(redis.del(key)).pipe(
      catchError(() => of(0)),
      mergeMap(() => throwError(() => error)),
    );
  }
}
