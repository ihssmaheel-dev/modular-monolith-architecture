import { Injectable, MessageEvent as NestMessageEvent } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";
import { RealtimeConnectionRegistry } from "./connections/realtime-connection.registry";
import { WebSocket } from "ws";
import { Subject } from "rxjs";

const STREAM_KEY = "realtime:events";
const MAX_STREAM_LENGTH = 10000;

@Injectable()
export class RealtimeService {
  private logger: PinoLoggerService;

  constructor(
    private readonly redis: RedisService,
    private readonly registry: RealtimeConnectionRegistry,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "RealtimeService" });
  }

  addWsClient(userId: string, tenantId: string | undefined, socket: WebSocket): void {
    this.registry.addWsClient(userId, tenantId, socket);
  }

  removeWsClient(userId: string, tenantId: string | undefined, socket: WebSocket): void {
    this.registry.removeWsClient(userId, tenantId, socket);
  }

  addSseClient(
    userId: string,
    tenantId: string | undefined,
    subject: Subject<NestMessageEvent>,
  ): void {
    this.registry.addSseClient(userId, tenantId, subject);
  }

  removeSseClient(
    userId: string,
    tenantId: string | undefined,
    subject: Subject<NestMessageEvent>,
  ): void {
    this.registry.removeSseClient(userId, tenantId, subject);
  }

  broadcast(event: string, payload: unknown): void {
    this.publishToStream("broadcast", event, payload);
  }

  sendToUser(userId: string, event: string, payload: unknown, tenantId?: string): void {
    const target = tenantId ? `tenant:${tenantId}:user:${userId}` : `user:${userId}`;
    this.publishToStream(target, event, payload);
  }

  private publishToStream(target: string, event: string, payload: unknown): void {
    const client = this.redis.getClient();
    if (!client) return;

    client
      .xadd(
        STREAM_KEY,
        "MAXLEN",
        "~",
        MAX_STREAM_LENGTH,
        "*",
        "target",
        target,
        "event",
        event,
        "payload",
        JSON.stringify(payload),
      )
      .catch((err) => {
        this.logger.error({ err, target, event }, "Failed to publish to stream");
      });
  }

  disconnectUser(userId: string): number {
    return this.registry.disconnectUser(userId);
  }

  getUserCount(): number {
    return this.registry.getUserCount();
  }
}
