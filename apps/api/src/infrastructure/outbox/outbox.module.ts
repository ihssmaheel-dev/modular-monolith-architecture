import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OutboxEventMongooseSchema, OutboxEventSchema } from "./schemas/outbox-event.mongoose.schema";
import { OutboxRepository } from "./outbox.repository";
import { OutboxService } from "./outbox.service";
import { OutboxRelayWorker } from "./outbox-relay.worker";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OutboxEventMongooseSchema.name, schema: OutboxEventSchema },
    ]),
  ],
  providers: [OutboxRepository, OutboxService, OutboxRelayWorker],
  exports: [OutboxService],
})
export class OutboxModule {}
