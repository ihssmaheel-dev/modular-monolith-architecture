import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FlattenMaps } from "mongoose";
import { ClsService } from "nestjs-cls";
import { ok, Result } from "neverthrow";
import { User } from "../domain/entities/user.entity";
import { UserMongooseSchema } from "./schemas/user.mongoose.schema";
import { BaseRepository } from "../../../infrastructure/database";

const USER_SELECT_WITH_PASSWORD = "email name passwordHash role createdAt updatedAt";

type LeanUserDocument = FlattenMaps<UserMongooseSchema> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class UsersRepository extends BaseRepository<User, UserMongooseSchema> {
  constructor(
    @InjectModel(UserMongooseSchema.name) model: Model<UserMongooseSchema>,
    cls: ClsService,
  ) {
    super(model, cls);
  }

  protected toDomain(value: unknown): User {
    const doc = value as LeanUserDocument;
    return User.fromPersistence({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      role: doc.role as "user" | "admin",
      authVersion: doc.authVersion,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<Result<(LeanUserDocument & { passwordHash: string }) | null, never>> {
    const doc = await this.model.findOne({ email }).select(USER_SELECT_WITH_PASSWORD).lean().exec();
    if (!doc) return ok(null);
    return ok(doc as LeanUserDocument & { passwordHash: string });
  }

  async setPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<Result<boolean, never>> {
    const result = await this.model
      .updateOne(
        { _id: userId },
        { $set: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt } },
      )
      .exec();
    return ok(result.matchedCount === 1);
  }

  async resetPasswordByToken(
    tokenHash: string,
    passwordHash: string,
  ): Promise<Result<User | null, never>> {
    const user = await this.model
      .findOneAndUpdate(
        { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } },
        {
          $set: { passwordHash },
          $inc: { authVersion: 1 },
          $unset: { passwordResetTokenHash: "", passwordResetExpiresAt: "" },
        },
        { new: true },
      )
      .exec();
    return ok(user ? this.toDomain(user as LeanUserDocument) : null);
  }

  async incrementAuthVersion(userId: string): Promise<Result<User | null, never>> {
    const user = await this.model
      .findByIdAndUpdate(userId, { $inc: { authVersion: 1 } }, { new: true })
      .exec();
    return ok(user ? this.toDomain(user as LeanUserDocument) : null);
  }
}
