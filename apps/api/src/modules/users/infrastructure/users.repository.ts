import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FlattenMaps } from "mongoose";
import { ok, err, Result } from "neverthrow";
import { User } from "../domain/entities/user.entity";
import { UserNotFound } from "../domain/errors/user.errors";
import { UserMongooseSchema } from "./schemas/user.mongoose.schema";

const USER_SELECT_FIELDS = "email name role createdAt updatedAt";

type LeanUserDocument = FlattenMaps<UserMongooseSchema> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserMongooseSchema.name) private model: Model<UserMongooseSchema>,
  ) {}

  private toDomain(doc: LeanUserDocument): User {
    return User.fromPersistence({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      role: doc.role as "user" | "admin",
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  async findById(id: string): Promise<Result<User | null, UserNotFound>> {
    const doc = await this.model.findById(id).select(USER_SELECT_FIELDS).lean().exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  async findByEmail(email: string): Promise<Result<User | null, never>> {
    const doc = await this.model.findOne({ email }).select(USER_SELECT_FIELDS).lean().exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  async findAll(options: { skip: number; limit: number }): Promise<Result<{ users: User[]; total: number }, never>> {
    const [docs, total] = await Promise.all([
      this.model.find().select(USER_SELECT_FIELDS).lean().skip(options.skip).limit(options.limit).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments().exec(),
    ]);

    const users = docs.map((doc) => this.toDomain(doc));
    return ok({ users, total });
  }

  async save(user: User): Promise<Result<User, never>> {
    const doc = await this.model.create({
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return ok(this.toDomain(doc));
  }

  async update(user: User): Promise<Result<User, UserNotFound>> {
    const doc = await this.model
      .findByIdAndUpdate(
        user.id,
        { email: user.email, name: user.name, role: user.role },
        { new: true },
      )
      .select(USER_SELECT_FIELDS)
      .lean()
      .exec();

    if (!doc) return err({ type: "USER_NOT_FOUND", userId: user.id });
    return ok(this.toDomain(doc));
  }

  async delete(id: string): Promise<Result<boolean, UserNotFound>> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) return err({ type: "USER_NOT_FOUND", userId: id });
    return ok(true);
  }

  async count(): Promise<Result<number, never>> {
    const total = await this.model.countDocuments().exec();
    return ok(total);
  }
}
