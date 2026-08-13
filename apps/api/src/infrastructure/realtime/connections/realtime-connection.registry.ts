import { Injectable, MessageEvent as NestMessageEvent } from "@nestjs/common";
import { WebSocket } from "ws";
import { Subject } from "rxjs";
import { PinoLoggerService } from "../../logger/logger.service";
import { MetricsService } from "../../metrics/metrics.service";
import { dispatchToConnection, dispatchToEveryConnection } from "./realtime-connection.dispatcher";

const MAX_CLIENTS_PER_CONNECTION = 100;

@Injectable()
export class RealtimeConnectionRegistry {
  private wsClients = new Map<string, Set<WebSocket>>();
  private sseClients = new Map<string, Set<Subject<NestMessageEvent>>>();
  private logger: PinoLoggerService;

  constructor(
    private readonly metrics: MetricsService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "RealtimeConnectionRegistry" });
  }

  // --- WS Methods ---
  addWsClient(userId: string, tenantId: string | undefined, socket: WebSocket): void {
    const key = connectionKey(userId, tenantId);
    if (!this.wsClients.has(key)) {
      this.wsClients.set(key, new Set());
    }
    const userClients = this.wsClients.get(key)!;
    if (userClients.has(socket)) return;
    if (userClients.size >= MAX_CLIENTS_PER_CONNECTION) {
      this.logger.warn({ userId }, "Max WebSocket connections reached");
      socket.close();
      return;
    }
    userClients.add(socket);
    this.metrics.incrementGauge(
      "realtime_active_connections_total",
      "Total active realtime connections",
      1,
      { type: "ws" },
    );
    this.logger.debug({ userId, total: userClients.size }, "WS Client connected");
  }

  removeWsClient(userId: string, tenantId: string | undefined, socket: WebSocket): void {
    const key = connectionKey(userId, tenantId);
    const userClients = this.wsClients.get(key);
    if (userClients) {
      if (userClients.has(socket)) {
        userClients.delete(socket);
        this.metrics.decrementGauge(
          "realtime_active_connections_total",
          "Total active realtime connections",
          1,
          { type: "ws" },
        );
      }
      if (userClients.size === 0) {
        this.wsClients.delete(key);
      }
    }
  }

  // --- SSE Methods ---
  addSseClient(
    userId: string,
    tenantId: string | undefined,
    subject: Subject<NestMessageEvent>,
  ): void {
    const key = connectionKey(userId, tenantId);
    if (!this.sseClients.has(key)) {
      this.sseClients.set(key, new Set());
    }
    const userClients = this.sseClients.get(key)!;
    if (userClients.has(subject)) return;
    if (userClients.size >= MAX_CLIENTS_PER_CONNECTION) {
      this.logger.warn({ userId }, "Max SSE connections reached");
      subject.complete();
      return;
    }
    userClients.add(subject);
    this.metrics.incrementGauge(
      "realtime_active_connections_total",
      "Total active realtime connections",
      1,
      { type: "sse" },
    );
    this.logger.debug({ userId, total: userClients.size }, "SSE Client connected");
  }

  removeSseClient(
    userId: string,
    tenantId: string | undefined,
    subject: Subject<NestMessageEvent>,
  ): void {
    const key = connectionKey(userId, tenantId);
    const userClients = this.sseClients.get(key);
    if (userClients) {
      if (userClients.has(subject)) {
        userClients.delete(subject);
        this.metrics.decrementGauge(
          "realtime_active_connections_total",
          "Total active realtime connections",
          1,
          { type: "sse" },
        );
      }
      if (userClients.size === 0) {
        this.sseClients.delete(key);
      }
    }
  }

  // --- Dispatch Routing ---
  dispatchToUser(
    userId: string,
    tenantId: string | undefined,
    event: string,
    payload: unknown,
  ): void {
    const key = connectionKey(userId, tenantId);
    dispatchToConnection(this.wsClients, this.sseClients, key, event, payload);
  }

  dispatchToAll(event: string, payload: unknown): void {
    dispatchToEveryConnection(this.wsClients, this.sseClients, event, payload);
  }

  getUserCount(): number {
    return new Set([...this.wsClients.keys(), ...this.sseClients.keys()]).size;
  }
}

function connectionKey(userId: string, tenantId?: string): string {
  return `${tenantId ?? "single"}:${userId}`;
}
