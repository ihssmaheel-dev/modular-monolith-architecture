import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FlattenMaps } from "mongoose";
import { ClsService } from "nestjs-cls";
import { ok, err, Result } from "neverthrow";
import { User } from "../domain/entities/user.entity";
import { UserNotFound } from "../domain/errors/user.errors";
import { UserMongooseSchema } from "./schemas/user.mongoose.schema";
import { BaseRepository } from "../../../infrastructure/database/base.repository";

const USER_SELECT_FIELDS = "email name role createdAt updatedAt";
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

  protected toDomain(doc: LeanUserDocument): User {
    return User.fromPersistence({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      role: doc.role as "user" | "admin",
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  async findById(id: string, options: import("../../../infrastructure/database/base.repository").BaseFindOptions = {}): Promise<Result<User | null, never>> {
    return super.findById(id, { ...options, select: USER_SELECT_FIELDS });
  }

  async findByEmail(email: string): Promise<Result<User | null, never>> {
    return super.findOne({ email }, { select: USER_SELECT_FIELDS });
  }

  async findByEmailWithPassword(email: string): Promise<Result<(LeanUserDocument & { passwordHash: string }) | null, never>> {
    const doc = await this.model.findOne({ email }).select(USER_SELECT_WITH_PASSWORD).lean().exec();
    if (!doc) return ok(null);
    return ok(doc as LeanUserDocument & { passwordHash: string });
  }

  async paginate(filter: Record<string, any> = {}, options: any = {}) {
    return super.paginate(filter, { ...options, select: USER_SELECT_FIELDS });
  }

  async save(data: { email: string; name: string; passwordHash: string; role?: string }): Promise<Result<User, never>> {
    return super.create({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role ?? "user",
    });
  }

  async update(user: User): Promise<Result<User, UserNotFound>> {
    const result = await super.updateById(
      user.id,
      { email: user.email, name: user.name, role: user.role },
      { select: USER_SELECT_FIELDS }
    );
    if (result.isErr()) {
      return err({ type: "USER_NOT_FOUND", userId: user.id }); // Mapped from CONFLICT if we ever get it, though we don't use version here. Wait, CONFLICT means it failed optimistic locking.
    }
    if (!result.value) {
      return err({ type: "USER_NOT_FOUND", userId: user.id });
    }
    return ok(result.value);
  }

  async delete(id: string): Promise<Result<boolean, UserNotFound>> {
    const result = await super.deleteById(id);
    if (result.isOk() && !result.value) {
      return err({ type: "USER_NOT_FOUND", userId: id });
    }
    return result as Result<boolean, UserNotFound>;
  }
}
