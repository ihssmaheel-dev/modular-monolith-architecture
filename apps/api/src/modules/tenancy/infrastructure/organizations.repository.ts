import { Injectable, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FlattenMaps, Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { Result } from "neverthrow";
import { BaseRepository } from "../../../infrastructure/database";
import { Organization } from "../domain/entities/tenancy.entity";
import { OrganizationMongooseSchema } from "./schemas/tenancy.mongoose.schema";

type LeanOrganization = FlattenMaps<OrganizationMongooseSchema> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class OrganizationsRepository extends BaseRepository<
  Organization,
  OrganizationMongooseSchema
> {
  constructor(
    @InjectModel(OrganizationMongooseSchema.name) model: Model<OrganizationMongooseSchema>,
    @Inject(ClsService) cls: ClsService,
  ) {
    super(model, cls);
  }

  protected toDomain(value: unknown): Organization {
    const doc = value as LeanOrganization;
    return Organization.fromPersistence({
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  findBySlug(slug: string): Promise<Result<Organization | null, never>> {
    return this.findOne({ slug });
  }

  findByIds(ids: string[]): Promise<Result<Organization[], never>> {
    if (ids.length === 0) return this.find({ _id: { $in: [] } });
    return this.find({ _id: { $in: ids } });
  }
}
