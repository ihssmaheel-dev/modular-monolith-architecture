import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { WebSocket } from "ws";
import { Redis } from "ioredis";
import { RedisService } from "../redis/redis.service";
import { PinoLoggerService } from "../logger/logger.service";

const WS_READY_STATE_OPEN = 1;
const WS_READY_STATE_CLOSING = 2;
const MAX_CLIENTS_PER_CONNECTION = 100;

export interface RealtimeEvent {
  event: string;
  payload: unknown;
}

@Injectable()
export class RealtimeService implements OnModuleInit, OnModuleDestroy {
  private clients = new Map<string, Set<WebSocket>>();
  private subscriber: Redis | null = null;
  private logger: PinoLoggerService;

  constructor(
    private readonly redis: RedisService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "RealtimeService" });
  }

  async onModuleInit(): Promise<void> {
    await this.initSubscriber();
  }

  private async initSubscriber(): Promise<void> {
    this.subscriber = this.redis.getClient().duplicate();
    await this.subscriber.connect();
    await this.subscriber.subscribe("realtime:broadcast", (message) => {
      try {
        const event = JSON.parse(message) as RealtimeEvent;
        this.broadcastToAll(event.event, event.payload);
      } catch {
        // Ignore invalid messages
      }
    });
  }

  addClient(userId: string, socket: WebSocket): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    const userClients = this.clients.get(userId)!;
    if (userClients.size >= MAX_CLIENTS_PER_CONNECTION) {
      this.logger.warn({ userId }, "Max WebSocket connections reached");
      socket.close();
      return;
    }
    userClients.add(socket);
    this.logger.debug({ userId, total: userClients.size }, "Client connected");
  }

  removeClient(userId: string, socket: WebSocket): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(socket);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  broadcast(event: string, payload: unknown): void {
    this.redis.getClient().publish(
      "realtime:broadcast",
      JSON.stringify({ event, payload } satisfies RealtimeEvent),
    );
  }

  sendToUser(userId: string, event: string, payload: unknown): void {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const message = JSON.stringify({ event, payload });
    for (const socket of userClients) {
      if (socket.readyState === WS_READY_STATE_OPEN) {
        socket.send(message);
      }
    }
  }

  sendToRoom(room: string, event: string, payload: unknown): void {
    this.redis.getClient().publish(
      `realtime:room:${room}`,
      JSON.stringify({ event, payload } satisfies RealtimeEvent),
    );
  }

  private broadcastToAll(event: string, payload: unknown): void {
    const message = JSON.stringify({ event, payload });
    for (const userClients of this.clients.values()) {
      for (const socket of userClients) {
        if (
          socket.readyState === WS_READY_STATE_OPEN &&
          socket.readyState !== WS_READY_STATE_CLOSING
        ) {
          socket.send(message);
        }
      }
    }
  }

  getUserCount(): number {
    return this.clients.size;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.subscriber) {
      await this.subscriber.disconnect();
    }
  }
}
