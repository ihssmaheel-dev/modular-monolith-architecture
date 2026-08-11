import { type MessageEvent as NestMessageEvent } from "@nestjs/common";
import { type Subject } from "rxjs";
import { type WebSocket } from "ws";

const WS_READY_STATE_OPEN = 1;

type WebSocketClients = Map<string, Set<WebSocket>>;
type SseClients = Map<string, Set<Subject<NestMessageEvent>>>;

export function dispatchToConnection(
  wsClients: WebSocketClients,
  sseClients: SseClients,
  key: string,
  event: string,
  payload: unknown,
): void {
  const message = JSON.stringify({ event, payload });
  for (const socket of wsClients.get(key) ?? []) {
    if (socket.readyState === WS_READY_STATE_OPEN) socket.send(message);
  }
  for (const subject of sseClients.get(key) ?? []) {
    subject.next({ type: event, data: payload } as NestMessageEvent);
  }
}

export function dispatchToEveryConnection(
  wsClients: WebSocketClients,
  sseClients: SseClients,
  event: string,
  payload: unknown,
): void {
  const message = JSON.stringify({ event, payload });
  for (const sockets of wsClients.values()) {
    for (const socket of sockets) {
      if (socket.readyState === WS_READY_STATE_OPEN) socket.send(message);
    }
  }
  for (const subjects of sseClients.values()) {
    for (const subject of subjects) {
      subject.next({ type: event, data: payload } as NestMessageEvent);
    }
  }
}
