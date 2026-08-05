import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FlattenMaps } from "mongoose";
import { ClsService } from "nestjs-cls";
import { OutboxEventMongooseSchema } from "./schemas/outbox-event.mongoose.schema";
import { BaseRepository } from "../database/base.repository";

export interface OutboxEvent {
  id: string;
  topic: string;
  payload: any;
  status: "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

type LeanOutboxDocument = FlattenMaps<OutboxEventMongooseSchema> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class OutboxRepository extends BaseRepository<OutboxEvent, OutboxEventMongooseSchema> {
  constructor(
    @InjectModel(OutboxEventMongooseSchema.name) model: Model<OutboxEventMongooseSchema>,
    cls: ClsService,
  ) {
    super(model, cls);
  }

  protected toDomain(doc: LeanOutboxDocument): OutboxEvent {
    return {
      id: doc._id.toString(),
      topic: doc.topic,
      payload: doc.payload,
      status: doc.status as OutboxEvent["status"],
      error: doc.error,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    };
  }

  /**
   * Atomically locks pending events for processing.
   */
  async lockPendingEvents(limit: number): Promise<OutboxEvent[]> {
    // In multi-node setups, findOneAndUpdate is safe
    const events: OutboxEvent[] = [];
    for (let i = 0; i < limit; i++) {
      const doc = await this.model.findOneAndUpdate(
        { status: "PENDING" },
        { $set: { status: "PROCESSING" } },
        { sort: { createdAt: 1 }, new: true }
      ).lean().exec();

      if (!doc) break; // No more pending events
      events.push(this.toDomain(doc as LeanOutboxDocument));
    }
    return events;
  }

  /**
   * Counts the total number of pending outbox events.
   */
  async countPendingEvents(): Promise<number> {
    return this.model.countDocuments({ status: "PENDING" }).exec();
  }
}
