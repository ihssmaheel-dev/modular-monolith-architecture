import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { RealtimeService } from "./realtime.service";
import { PinoLoggerService } from "../logger/logger.service";
import { env } from "../../config/env";

const WS_READY_STATE_OPEN = 1;
const USER_ID_QUERY_PARAM = "userId";

@WebSocketGateway({ cors: { origin: env.CLIENT_URL.split(",") } })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private socketToUser = new Map<WebSocket, string>();

  constructor(
    private readonly realtime: RealtimeService,
    private readonly logger: PinoLoggerService,
  ) {}

  handleConnection(@ConnectedSocket() client: WebSocket, ...args: unknown[]): void {
    const req = args[0] as { url?: string } | undefined;
    const url = new URL(req?.url ?? "/", "http://localhost");
    const userId = url.searchParams.get(USER_ID_QUERY_PARAM);

    if (!userId) {
      client.close();
      return;
    }

    this.socketToUser.set(client, userId);
    this.realtime.addWsClient(userId, client);
    this.logger.debug({ userId }, "WS connected");
  }

  handleDisconnect(@ConnectedSocket() client: WebSocket): void {
    const userId = this.socketToUser.get(client);
    if (userId) {
      this.realtime.removeWsClient(userId, client);
      this.socketToUser.delete(client);
      this.logger.debug({ userId }, "WS disconnected");
    }
  }

  @SubscribeMessage("ping")
  handlePing(@ConnectedSocket() client: WebSocket): void {
    if (client.readyState === WS_READY_STATE_OPEN) {
      client.send(JSON.stringify({ event: "pong", payload: null }));
    }
  }

  @SubscribeMessage("join-room")
  handleJoinRoom(
    @ConnectedSocket() client: WebSocket,
    @MessageBody() data: { room: string },
  ): void {
    const userId = this.socketToUser.get(client);
    this.logger.debug({ userId, room: data.room }, "Client joined room");
  }
}
