import { Module } from "@nestjs/common";
import { OutboxRepository } from "./outbox.repository";
import { OutboxService } from "./outbox.service";
import { OutboxRelayWorker } from "./outbox-relay.worker";

@Module({
  providers: [OutboxRepository, OutboxService, OutboxRelayWorker],
  exports: [OutboxService],
})
export class OutboxModule {}
