import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FlattenMaps } from "mongoose";
import { ClsService } from "nestjs-cls";
import { OutboxEventMongooseSchema } from "./schemas/outbox-event.mongoose.schema";
import { BaseRepository } from "../database";

export interface OutboxEvent {
  id: string;
  tenantId?: string;
  topic: string;
  payload: unknown;
  status: "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";
  error?: string;
  attempts: number;
  nextAttemptAt?: Date;
  lockedAt?: Date;
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

  protected toDomain(value: unknown): OutboxEvent {
    const doc = value as LeanOutboxDocument;
    return {
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      topic: doc.topic,
      payload: doc.payload,
      status: doc.status as OutboxEvent["status"],
      error: doc.error,
      attempts: doc.attempts ?? 0,
      nextAttemptAt: doc.nextAttemptAt,
      lockedAt: doc.lockedAt,
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
      const doc = await this.model
        .findOneAndUpdate(
          {
            status: "PENDING",
            $or: [{ nextAttemptAt: { $exists: false } }, { nextAttemptAt: { $lte: new Date() } }],
          },
          { $set: { status: "PROCESSING", lockedAt: new Date() } },
          { sort: { createdAt: 1 }, returnDocument: "after" },
        )
        .lean()
        .exec();

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

  async recoverStaleLocks(lockedBefore: Date): Promise<number> {
    const result = await this.model
      .updateMany(
        { status: "PROCESSING", lockedAt: { $lt: lockedBefore } },
        { $set: { status: "PENDING" }, $unset: { lockedAt: "" } },
      )
      .exec();
    return result.modifiedCount;
  }
}
