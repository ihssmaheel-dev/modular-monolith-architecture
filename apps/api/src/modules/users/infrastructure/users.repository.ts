import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ok, err, Result } from "neverthrow";
import { User, UserRole } from "../domain/entities/user.entity";
import { UserNotFound, EmailTaken } from "../domain/errors/user.errors";
import { UserMongooseSchema } from "./schemas/user.mongoose.schema";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(UserMongooseSchema.name) private model: Model<UserMongooseSchema>,
  ) {}

  private toDomain(doc: UserMongooseSchema & { _id: { toString(): string } }): User {
    return User.fromPersistence({
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      role: doc.role as UserRole,
      createdAt: doc["createdAt"] ?? new Date(),
      updatedAt: doc["updatedAt"] ?? new Date(),
    });
  }

  async findById(id: string): Promise<Result<User | null, UserNotFound>> {
    const doc = await this.model.findById(id).exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  async findByEmail(email: string): Promise<Result<User | null, never>> {
    const doc = await this.model.findOne({ email }).exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  async findAll(options: { skip: number; limit: number }): Promise<Result<{ users: User[]; total: number }, never>> {
    const [docs, total] = await Promise.all([
      this.model.find().skip(options.skip).limit(options.limit).sort({ createdAt: -1 }).exec(),
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
