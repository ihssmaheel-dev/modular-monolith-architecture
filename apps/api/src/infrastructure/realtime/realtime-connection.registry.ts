import { Injectable, MessageEvent as NestMessageEvent } from "@nestjs/common";
import { WebSocket } from "ws";
import { Subject } from "rxjs";
import { PinoLoggerService } from "../logger/logger.service";

const WS_READY_STATE_OPEN = 1;
const MAX_CLIENTS_PER_CONNECTION = 100;

@Injectable()
export class RealtimeConnectionRegistry {
  private wsClients = new Map<string, Set<WebSocket>>();
  private sseClients = new Map<string, Set<Subject<NestMessageEvent>>>();
  private logger: PinoLoggerService;

  constructor(logger: PinoLoggerService) {
    this.logger = logger.child({ module: "RealtimeConnectionRegistry" });
  }

  // --- WS Methods ---
  addWsClient(userId: string, socket: WebSocket): void {
    if (!this.wsClients.has(userId)) {
      this.wsClients.set(userId, new Set());
    }
    const userClients = this.wsClients.get(userId)!;
    if (userClients.size >= MAX_CLIENTS_PER_CONNECTION) {
      this.logger.warn({ userId }, "Max WebSocket connections reached");
      socket.close();
      return;
    }
    userClients.add(socket);
    this.logger.debug({ userId, total: userClients.size }, "WS Client connected");
  }

  removeWsClient(userId: string, socket: WebSocket): void {
    const userClients = this.wsClients.get(userId);
    if (userClients) {
      userClients.delete(socket);
      if (userClients.size === 0) {
        this.wsClients.delete(userId);
      }
    }
  }

  // --- SSE Methods ---
  addSseClient(userId: string, subject: Subject<NestMessageEvent>): void {
    if (!this.sseClients.has(userId)) {
      this.sseClients.set(userId, new Set());
    }
    const userClients = this.sseClients.get(userId)!;
    if (userClients.size >= MAX_CLIENTS_PER_CONNECTION) {
      this.logger.warn({ userId }, "Max SSE connections reached");
      subject.complete();
      return;
    }
    userClients.add(subject);
    this.logger.debug({ userId, total: userClients.size }, "SSE Client connected");
  }

  removeSseClient(userId: string, subject: Subject<NestMessageEvent>): void {
    const userClients = this.sseClients.get(userId);
    if (userClients) {
      userClients.delete(subject);
      if (userClients.size === 0) {
        this.sseClients.delete(userId);
      }
    }
  }

  // --- Dispatch Routing ---
  dispatchToUser(userId: string, event: string, payload: unknown): void {
    const wsSet = this.wsClients.get(userId);
    if (wsSet) {
      const message = JSON.stringify({ event, payload });
      for (const socket of wsSet) {
        if (socket.readyState === WS_READY_STATE_OPEN) {
          socket.send(message);
        }
      }
    }

    const sseSet = this.sseClients.get(userId);
    if (sseSet) {
      for (const subject of sseSet) {
        subject.next({ type: event, data: payload } as NestMessageEvent);
      }
    }
  }

  dispatchToAll(event: string, payload: unknown): void {
    const message = JSON.stringify({ event, payload });

    for (const wsSet of this.wsClients.values()) {
      for (const socket of wsSet) {
        if (socket.readyState === WS_READY_STATE_OPEN) {
          socket.send(message);
        }
      }
    }

    for (const sseSet of this.sseClients.values()) {
      for (const subject of sseSet) {
        subject.next({ type: event, data: payload } as NestMessageEvent);
      }
    }
  }

  getUserCount(): number {
    return this.wsClients.size + this.sseClients.size;
  }
}
