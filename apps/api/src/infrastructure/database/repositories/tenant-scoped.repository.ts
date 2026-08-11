import type { Model } from "mongoose";
import type { ClsService } from "nestjs-cls";
import { BaseRepository } from "./base.repository";

export abstract class TenantScopedRepository<TEntity, TDocument> extends BaseRepository<
  TEntity,
  TDocument
> {
  protected constructor(model: Model<TDocument>, cls: ClsService) {
    super(model, cls, "tenant");
  }
}
