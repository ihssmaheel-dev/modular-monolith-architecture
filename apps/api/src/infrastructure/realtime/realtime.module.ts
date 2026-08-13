import { Module, Global } from "@nestjs/common";
import { RealtimeConnectionRegistry } from "./connections/realtime-connection.registry";
import { RealtimeService } from "./realtime.service";
import { RealtimeStreamConsumer } from "./streams/realtime-stream.consumer";
import { RealtimeStreamRouter } from "./streams/realtime-stream.router";
import { RealtimeSseController } from "./transports/realtime-sse.controller";
import { RealtimeWebsocketGateway } from "./transports/realtime-websocket.gateway";

@Global()
@Module({
  controllers: [RealtimeSseController],
  providers: [
    RealtimeConnectionRegistry,
    RealtimeStreamConsumer,
    RealtimeStreamRouter,
    RealtimeWebsocketGateway,
    RealtimeService,
  ],
  exports: [RealtimeService],
})
export class RealtimeModule {}
