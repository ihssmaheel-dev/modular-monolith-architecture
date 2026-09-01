import { Global, Module } from "@nestjs/common";
import { OutboxRepository } from "./outbox.repository";
import { OutboxService } from "./outbox.service";
import { OutboxRelayWorker } from "./outbox-relay.worker";
import { OutboxEventWorker } from "./outbox-event.worker";
import { OutboxRelayDelivery } from "./outbox-relay.delivery";

@Global()
@Module({
  providers: [
    OutboxRepository,
    OutboxService,
    OutboxRelayWorker,
    OutboxEventWorker,
    OutboxRelayDelivery,
  ],
  exports: [OutboxService],
})
export class OutboxModule {}
