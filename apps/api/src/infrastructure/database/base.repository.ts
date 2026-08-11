import { ClientSession } from "mongoose";
import { Result } from "neverthrow";
import {
  Id,
  PaginationOptions,
  PaginatedResult,
  CreateOptions,
  UpdateOptions,
} from "./base-repository.types";
import { paginateEntities } from "./base-repository.pagination";
import {
  createEntity,
  createManyEntities,
  deleteEntity,
  softDeleteEntity,
  updateEntity,
} from "./base-repository.write";
import { applyCreateScope, applyRepositoryScope } from "./base-repository.scope";
import { BaseReadRepository } from "./base-read.repository";

export * from "./base-repository.types";

export abstract class BaseRepository<TEntity, TDocument> extends BaseReadRepository<
  TEntity,
  TDocument
> {
  async create(
    data: Record<string, unknown>,
    options: CreateOptions = {},
  ): Promise<Result<TEntity, never>> {
    const payload = applyCreateScope(data, this.repositoryScope, this.cls);
    return createEntity(this.model, this.cls, (value) => this.toDomain(value), payload, options);
  }

  async createMany(
    data: Record<string, unknown>[],
    options: CreateOptions = {},
  ): Promise<Result<TEntity[], never>> {
    const payloads = data.map((item) => applyCreateScope(item, this.repositoryScope, this.cls));
    return createManyEntities(
      this.model,
      this.cls,
      (value) => this.toDomain(value),
      payloads,
      options,
    );
  }

  async paginate(
    filter: Record<string, unknown> = {},
    options: PaginationOptions = {},
  ): Promise<Result<PaginatedResult<TEntity>, never>> {
    const scopedFilter = applyRepositoryScope(filter, this.repositoryScope, this.cls);
    return paginateEntities(
      this.model,
      this.cls,
      (value) => this.toDomain(value),
      scopedFilter,
      options,
    );
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
      applyRepositoryScope({ _id: id }, this.repositoryScope, this.cls),
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
      applyRepositoryScope(filter, this.repositoryScope, this.cls),
      update,
      options,
      true,
    );
  }

  async softDeleteById(
    id: Id,
    options: { session?: ClientSession; audit?: boolean } = {},
  ): Promise<Result<TEntity | null, never>> {
    const filter = applyRepositoryScope({ _id: id }, this.repositoryScope, this.cls);
    return softDeleteEntity(this.model, this.cls, (value) => this.toDomain(value), filter, options);
  }

  async deleteById(
    id: Id,
    options: { session?: ClientSession } = {},
  ): Promise<Result<boolean, never>> {
    const filter = applyRepositoryScope({ _id: id }, this.repositoryScope, this.cls);
    return deleteEntity(this.model, this.cls, filter, options);
  }
}
