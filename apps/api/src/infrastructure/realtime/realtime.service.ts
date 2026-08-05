import { Injectable, MessageEvent as NestMessageEvent } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";
import { RealtimeConnectionRegistry } from "./realtime-connection.registry";
import { WebSocket } from "ws";
import { Subject } from "rxjs";

const STREAM_KEY = "realtime:events";
const MAX_STREAM_LENGTH = 10000;

export interface RealtimeEvent {
  event: string;
  payload: unknown;
}

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

  // --- WS Methods (Facade) ---
  addWsClient(userId: string, socket: WebSocket): void {
    this.registry.addWsClient(userId, socket);
  }

  removeWsClient(userId: string, socket: WebSocket): void {
    this.registry.removeWsClient(userId, socket);
  }

  // --- SSE Methods (Facade) ---
  addSseClient(userId: string, subject: Subject<NestMessageEvent>): void {
    this.registry.addSseClient(userId, subject);
  }

  removeSseClient(userId: string, subject: Subject<NestMessageEvent>): void {
    this.registry.removeSseClient(userId, subject);
  }

  // --- Publishing ---
  broadcast(event: string, payload: unknown): void {
    this.publishToStream("broadcast", event, payload);
  }

  sendToUser(userId: string, event: string, payload: unknown): void {
    this.publishToStream(`user:${userId}`, event, payload);
  }

  sendToRoom(room: string, event: string, payload: unknown): void {
    this.publishToStream(`room:${room}`, event, payload);
  }

  private publishToStream(target: string, event: string, payload: unknown) {
    const client = this.redis.getClient();
    if (!client) return;

    client.xadd(
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
      JSON.stringify(payload)
    ).catch(err => {
      this.logger.error({ err, target, event }, "Failed to publish to stream");
    });
  }

  getUserCount(): number {
    return this.registry.getUserCount();
  }
}
