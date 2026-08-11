import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type FlattenMaps, type Model } from "mongoose";
import { type ClsService } from "nestjs-cls";
import { ok, type Result } from "neverthrow";
import {
  BaseRepository,
  type PaginatedResult,
  type PaginationOptions,
} from "../../../infrastructure/database";
import { Invitation } from "../domain/entities/tenancy.entity";
import { InvitationMongooseSchema } from "./schemas/tenancy.mongoose-schema";

type LeanInvitation = FlattenMaps<InvitationMongooseSchema> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class InvitationsRepository extends BaseRepository<Invitation, InvitationMongooseSchema> {
  constructor(
    @InjectModel(InvitationMongooseSchema.name) model: Model<InvitationMongooseSchema>,
    cls: ClsService,
  ) {
    super(model, cls);
  }

  protected toDomain(value: unknown): Invitation {
    const doc = value as LeanInvitation;
    return Invitation.fromPersistence({
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      email: doc.email,
      role: doc.role as "admin" | "member",
      status: doc.status as "pending" | "accepted" | "revoked",
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  findPending(tenantId: string, email: string): Promise<Result<Invitation | null, never>> {
    return this.findOne({ tenantId, email, status: "pending", expiresAt: { $gt: new Date() } });
  }

  async revokeExpired(tenantId: string, email: string): Promise<void> {
    await this.model.updateMany(
      { tenantId, email, status: "pending", expiresAt: { $lte: new Date() } },
      { $set: { status: "revoked" } },
    );
  }

  findByTokenHash(tokenHash: string): Promise<Result<Invitation | null, never>> {
    return this.findOne({ tokenHash, status: "pending", expiresAt: { $gt: new Date() } });
  }

  paginateForTenant(
    tenantId: string,
    options: PaginationOptions,
  ): Promise<Result<PaginatedResult<Invitation>, never>> {
    return this.paginate({ tenantId }, { ...options, sort: { createdAt: -1 } });
  }

  async markAccepted(id: string, userId: string): Promise<Result<Invitation | null, never>> {
    const result = await this.updateOne(
      { _id: id, status: "pending", expiresAt: { $gt: new Date() } },
      { status: "accepted", acceptedBy: userId, acceptedAt: new Date() },
    );
    if (result.isErr()) return ok(null);
    return ok(result.value);
  }
}
