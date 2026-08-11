import { Model, ClientSession } from "mongoose";
import { ClsService } from "nestjs-cls";
import { ok, Result } from "neverthrow";
import {
  Id,
  BaseFindOptions,
  PaginationOptions,
  PaginatedResult,
  CreateOptions,
  UpdateOptions,
} from "./base-repository.types";
import { applySoftDelete, applyOptions, getSession } from "./base-repository.helpers";
import { paginateEntities } from "./base-repository.pagination";
import {
  createEntity,
  createManyEntities,
  deleteEntity,
  softDeleteEntity,
  updateEntity,
} from "./base-repository.write";

export * from "./base-repository.types";

export abstract class BaseRepository<TEntity, TDocument> {
  constructor(
    protected readonly model: Model<TDocument>,
    protected readonly cls?: ClsService,
  ) {}
  protected abstract toDomain(doc: unknown): TEntity;

  async create(
    data: Record<string, unknown>,
    options: CreateOptions = {},
  ): Promise<Result<TEntity, never>> {
    return createEntity(this.model, this.cls, (value) => this.toDomain(value), data, options);
  }

  async createMany(
    data: Record<string, unknown>[],
    options: CreateOptions = {},
  ): Promise<Result<TEntity[], never>> {
    return createManyEntities(this.model, this.cls, (value) => this.toDomain(value), data, options);
  }

  async findById(id: Id, options: BaseFindOptions = {}): Promise<Result<TEntity | null, never>> {
    let query = this.model.findById(id);
    query = applyOptions(query, options, this.cls);
    const doc = await query.exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  async findOne(
    filter: Record<string, unknown>,
    options: BaseFindOptions = {},
  ): Promise<Result<TEntity | null, never>> {
    let query = this.model.findOne(applySoftDelete(filter, options));
    query = applyOptions(query, options, this.cls);
    const doc = await query.exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  async find(
    filter: Record<string, unknown> = {},
    options: BaseFindOptions = {},
  ): Promise<Result<TEntity[], never>> {
    let query = this.model.find(applySoftDelete(filter, options));
    query = applyOptions(query, options, this.cls);
    const docs = await query.exec();
    return ok(docs.map((doc) => this.toDomain(doc)));
  }

  async exists(
    filter: Record<string, unknown>,
    options: Pick<BaseFindOptions, "includeDeleted" | "onlyDeleted" | "session"> = {},
  ): Promise<Result<boolean, never>> {
    const result = await this.model
      .exists(applySoftDelete(filter, options))
      .session(options.session ?? getSession(this.cls) ?? null);
    return ok(!!result);
  }

  async count(
    filter: Record<string, unknown> = {},
    options: Pick<BaseFindOptions, "includeDeleted" | "onlyDeleted" | "session"> = {},
  ): Promise<Result<number, never>> {
    const total = await this.model
      .countDocuments(applySoftDelete(filter, options))
      .session(options.session ?? getSession(this.cls) ?? null)
      .exec();
    return ok(total);
  }

  async paginate(
    filter: Record<string, unknown> = {},
    options: PaginationOptions = {},
  ): Promise<Result<PaginatedResult<TEntity>, never>> {
    return paginateEntities(this.model, this.cls, (value) => this.toDomain(value), filter, options);
  }

  async updateById(
    id: Id,
    update: Record<string, unknown>,
    options: UpdateOptions = {},
  ): Promise<Result<TEntity | null, { type: "CONFLICT" }>> {
    return updateEntity(
      this.model,
      this.cls,
      (value) => this.toDomain(value),
      { _id: id },
      update,
      options,
      false,
    );
  }

  async updateOne(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: UpdateOptions = {},
  ): Promise<Result<TEntity | null, { type: "CONFLICT" }>> {
    return updateEntity(
      this.model,
      this.cls,
      (value) => this.toDomain(value),
      filter,
      update,
      options,
      true,
    );
  }

  async softDeleteById(
    id: Id,
    options: { session?: ClientSession; audit?: boolean } = {},
  ): Promise<Result<TEntity | null, never>> {
    return softDeleteEntity(this.model, this.cls, (value) => this.toDomain(value), id, options);
  }

  async deleteById(
    id: Id,
    options: { session?: ClientSession } = {},
  ): Promise<Result<boolean, never>> {
    return deleteEntity(this.model, this.cls, id, options);
  }
}
