import { Module, Global } from "@nestjs/common";
import { RealtimeGateway } from "./realtime.gateway";
import { RealtimeService } from "./realtime.service";
import { RealtimeController } from "./realtime.controller";
import { RealtimeConnectionRegistry } from "./realtime-connection.registry";
import { RealtimeStreamConsumer } from "./realtime-stream.consumer";

@Global()
@Module({
  controllers: [RealtimeController],
  providers: [RealtimeConnectionRegistry, RealtimeStreamConsumer, RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
