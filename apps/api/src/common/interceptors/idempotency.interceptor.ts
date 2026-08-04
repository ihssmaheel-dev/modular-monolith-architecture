import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { Observable, of, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Reflector } from "@nestjs/core";
import { ClsService } from "nestjs-cls";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { IDEMPOTENT_KEY } from "../decorators/idempotent.decorator";
import { FastifyRequest } from "fastify";

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
    private readonly cls: ClsService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const isIdempotent = this.reflector.getAllAndOverride<boolean>(IDEMPOTENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isIdempotent) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const idempotencyKey = request.headers["idempotency-key"];

    if (!idempotencyKey || typeof idempotencyKey !== "string") {
      throw new BadRequestException("Idempotency-Key header is required for this endpoint");
    }

    const redis = this.redisService.getClient();
    if (!redis) {
      // If Redis is disabled, we bypass idempotency to prevent blocking the app
      return next.handle();
    }

    const userId = this.cls.get("userId") || request.ip || "anonymous";
    const cacheKey = `idempotency:${userId}:${idempotencyKey}`;

    // Try to set the key as PROCESSING atomically
    // NX = Only set if not exists, EX = Expire in 24 hours (86400 seconds)
    const isNew = await redis.set(cacheKey, "PROCESSING", "EX", 86400, "NX");

    if (!isNew) {
      // Key already exists, it's either processing or completed
      const value = await redis.get(cacheKey);

      if (value === "PROCESSING") {
        throw new ConflictException("Duplicate request is currently processing");
      }

      if (value) {
        // Return cached response
        try {
          const parsed = JSON.parse(value);
          return of(parsed);
        } catch (e) {
          return of(value);
        }
      }
    }

    // It's a new request, process it
    return next.handle().pipe(
      tap(async (response) => {
        // On success, save the response payload
        try {
          const serialized = JSON.stringify(response);
          await redis.set(cacheKey, serialized, "EX", 86400);
        } catch (e) {
          // Ignore cache serialization errors
        }
      }),
      catchError((error) => {
        // On error, delete the lock so the client can retry safely
        redis.del(cacheKey).catch(() => {});
        return throwError(() => error);
      }),
    );
  }
}
