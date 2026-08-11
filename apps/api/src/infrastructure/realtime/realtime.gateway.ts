import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { RealtimeService } from "./realtime.service";
import { PinoLoggerService } from "../logger/logger.service";
import { env } from "../../config/env";
import { verifyAccessToken } from "../../common/utils/access-token.utils";

const WS_READY_STATE_OPEN = 1;
const ACCESS_TOKEN_COOKIE = "access_token";

interface HandshakeRequest {
  headers?: Record<string, string | string[] | undefined>;
}

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
    const request = args[0] as HandshakeRequest | undefined;
    const token = this.extractToken(request);
    const user = token ? verifyAccessToken(token) : null;

    if (!user) {
      client.close();
      return;
    }

    this.socketToUser.set(client, user.sub);
    this.realtime.addWsClient(user.sub, client);
    this.logger.debug({ userId: user.sub }, "WS connected");
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

  private extractToken(request?: HandshakeRequest): string | null {
    const authorization = request?.headers?.authorization;
    if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
      return authorization.slice(7);
    }

    const cookie = request?.headers?.cookie;
    if (typeof cookie !== "string") return null;
    return this.readCookie(cookie, ACCESS_TOKEN_COOKIE);
  }

  private readCookie(header: string, name: string): string | null {
    for (const item of header.split(";")) {
      const [key, ...value] = item.trim().split("=");
      if (key === name) return decodeURIComponent(value.join("="));
    }
    return null;
  }
}
