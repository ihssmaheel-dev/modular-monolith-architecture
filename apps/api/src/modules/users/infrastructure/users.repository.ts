import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ok, Result } from "neverthrow";
import { User, UserRole } from "../domain/entities/user.entity";
import { UserNotFound } from "../domain/errors/user.errors";
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

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.model.findOne({ email }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(options: { skip: number; limit: number }): Promise<{ users: User[]; total: number }> {
    const [docs, total] = await Promise.all([
      this.model.find().skip(options.skip).limit(options.limit).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments().exec(),
    ]);

    const users = docs.map((doc) => this.toDomain(doc));

    return { users, total };
  }

  async save(user: User): Promise<User> {
    const doc = await this.model.create({
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return this.toDomain(doc);
  }

  async update(user: User): Promise<User> {
    const doc = await this.model
      .findByIdAndUpdate(
        user.id,
        { email: user.email, name: user.name, role: user.role },
        { new: true },
      )
      .exec();

    if (!doc) throw new Error("User not found after update");

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async count(): Promise<number> {
    return this.model.countDocuments().exec();
  }
}
