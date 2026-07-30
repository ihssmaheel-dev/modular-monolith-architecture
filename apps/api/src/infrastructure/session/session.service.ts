import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";
import {
  SessionData,
  CreateSessionInput,
  SESSION_TTL_SECONDS,
  TOKEN_REVOCATION_TTL_SECONDS,
} from "./session.types";
import { sessionKey, tokenRevocationKey, generateSessionId, isRevoked } from "./session.utils";

@Injectable()
export class SessionService {
  private logger: PinoLoggerService;

  constructor(
    private readonly redis: RedisService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "SessionService" });
  }

  async create(input: CreateSessionInput): Promise<SessionData> {
    const sessionId = generateSessionId();
    const now = Date.now();

    const session: SessionData = {
      id: sessionId,
      userId: input.userId,
      ip: input.ip,
      userAgent: input.userAgent,
      deviceName: input.deviceName,
      createdAt: now,
      lastAccessedAt: now,
    };

    const key = sessionKey(sessionId);
    await this.redis.getClient().setex(key, SESSION_TTL_SECONDS, JSON.stringify(session));
    await this.redis.getClient().sadd(`user:${input.userId}:sessions`, sessionId);

    this.logger.info({ sessionId, userId: input.userId }, "Session created");
    return session;
  }

  async getById(sessionId: string): Promise<SessionData | null> {
    const raw = await this.redis.getClient().get(sessionKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  }

  async validate(sessionId: string, ip: string): Promise<SessionData | null> {
    if (await isRevoked(this.redis, sessionId)) {
      return null;
    }

    const session = await this.getById(sessionId);
    if (!session) return null;

    if (session.ip !== ip) {
      this.logger.warn({ sessionId, expectedIp: session.ip, actualIp: ip }, "IP mismatch");
      return null;
    }

    session.lastAccessedAt = Date.now();
    await this.redis.getClient().setex(
      sessionKey(sessionId),
      SESSION_TTL_SECONDS,
      JSON.stringify(session),
    );

    return session;
  }

  async revoke(sessionId: string): Promise<void> {
    const session = await this.getById(sessionId);
    if (!session) return;

    await this.redis.getClient().del(sessionKey(sessionId));
    await this.redis.getClient().srem(`user:${session.userId}:sessions`, sessionId);
    await this.redis.getClient().setex(
      tokenRevocationKey(sessionId),
      TOKEN_REVOCATION_TTL_SECONDS,
      "1",
    );

    this.logger.info({ sessionId, userId: session.userId }, "Session revoked");
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const sessionIds = await this.redis.getClient().smembers(`user:${userId}:sessions`);
    
    if (sessionIds.length > 0) {
      const pipeline = this.redis.getClient().pipeline();
      for (const sid of sessionIds) {
        pipeline.del(sessionKey(sid));
        pipeline.setex(tokenRevocationKey(sid), TOKEN_REVOCATION_TTL_SECONDS, "1");
      }
      await pipeline.exec();
    }

    await this.redis.getClient().del(`user:${userId}:sessions`);
    this.logger.info({ userId, count: sessionIds.length }, "All sessions revoked for user");
  }

  async getActiveSessions(userId: string): Promise<SessionData[]> {
    const sessionIds = await this.redis.getClient().smembers(`user:${userId}:sessions`);
    if (sessionIds.length === 0) return [];

    const keys = sessionIds.map((sid) => sessionKey(sid));
    const rawSessions = await this.redis.getClient().mget(keys);

    return rawSessions
      .filter((raw): raw is string => raw !== null)
      .map((raw) => JSON.parse(raw) as SessionData);
  }
}
