import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type FlattenMaps, type Model } from "mongoose";
import { type ClsService } from "nestjs-cls";
import { type Result } from "neverthrow";
import type { TenantRole } from "@repo/shared";
import {
  BaseRepository,
  type PaginatedResult,
  type PaginationOptions,
} from "../../../infrastructure/database/base.repository";
import { Membership } from "../domain/entities/tenancy.entity";
import { MembershipMongooseSchema } from "./schemas/tenancy.mongoose-schema";

type LeanMembership = FlattenMaps<MembershipMongooseSchema> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class MembershipsRepository extends BaseRepository<Membership, MembershipMongooseSchema> {
  constructor(
    @InjectModel(MembershipMongooseSchema.name) model: Model<MembershipMongooseSchema>,
    cls: ClsService,
  ) {
    super(model, cls);
  }

  protected toDomain(value: unknown): Membership {
    const doc = value as LeanMembership;
    return Membership.fromPersistence({
      id: doc._id.toString(),
      tenantId: doc.tenantId,
      userId: doc.userId,
      userEmail: doc.userEmail,
      userName: doc.userName,
      role: doc.role as TenantRole,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  findMembership(tenantId: string, userId: string): Promise<Result<Membership | null, never>> {
    return this.findOne({ tenantId, userId });
  }

  findByEmail(tenantId: string, email: string): Promise<Result<Membership | null, never>> {
    return this.findOne({ tenantId, userEmail: email });
  }

  paginateForUser(
    userId: string,
    options: PaginationOptions,
  ): Promise<Result<PaginatedResult<Membership>, never>> {
    return this.paginate({ userId }, { ...options, sort: { createdAt: -1 } });
  }

  paginateForTenant(
    tenantId: string,
    options: PaginationOptions,
  ): Promise<Result<PaginatedResult<Membership>, never>> {
    return this.paginate({ tenantId }, { ...options, sort: { createdAt: 1 } });
  }

  countOwners(tenantId: string): Promise<Result<number, never>> {
    return this.count({ tenantId, role: "owner" });
  }

  hasOwnerMembership(userId: string): Promise<Result<boolean, never>> {
    return this.exists({ userId, role: "owner" });
  }

  updateRole(
    tenantId: string,
    userId: string,
    role: TenantRole,
  ): Promise<Result<Membership | null, { type: "CONFLICT" }>> {
    return this.updateOne({ tenantId, userId }, { role });
  }

  async remove(tenantId: string, userId: string): Promise<Result<boolean, never>> {
    const membership = await this.findMembership(tenantId, userId);
    if (membership.isErr() || !membership.value) return membership.map(() => false);
    return this.deleteById(membership.value.data.id);
  }

  async updateUserSnapshot(
    userId: string,
    changes: { email?: string; name?: string },
  ): Promise<void> {
    const update: Record<string, string> = {};
    if (changes.email) update.userEmail = changes.email;
    if (changes.name) update.userName = changes.name;
    if (Object.keys(update).length > 0) await this.model.updateMany({ userId }, { $set: update });
  }

  async removeUser(userId: string): Promise<void> {
    await this.model.deleteMany({ userId });
  }
}
