import type { Result } from "neverthrow";
import { BaseReadRepository } from "./base-read.repository";
import { paginateEntities } from "./repository-pagination";
import { applyCreateScope, applyRepositoryScope } from "./repository-scope";
import type {
  CreateOptions,
  DeleteOptions,
  Id,
  PaginatedResult,
  PaginationOptions,
  SoftDeleteOptions,
  UpdateOptions,
} from "./repository.types";
import {
  createEntity,
  createManyEntities,
  deleteEntity,
  softDeleteEntity,
  updateEntity,
} from "./repository-write";

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
    const filter = applyRepositoryScope({ _id: id }, this.repositoryScope, this.cls);
    return updateEntity(
      this.model,
      this.cls,
      (value) => this.toDomain(value),
      filter,
      update,
      options,
    );
  }

  async updateOne(
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    options: UpdateOptions = {},
  ): Promise<Result<TEntity | null, { type: "CONFLICT" }>> {
    const scopedFilter = applyRepositoryScope(filter, this.repositoryScope, this.cls);
    return updateEntity(
      this.model,
      this.cls,
      (value) => this.toDomain(value),
      scopedFilter,
      update,
      options,
    );
  }

  async softDeleteById(
    id: Id,
    options: SoftDeleteOptions = {},
  ): Promise<Result<TEntity | null, never>> {
    const filter = applyRepositoryScope({ _id: id }, this.repositoryScope, this.cls);
    return softDeleteEntity(this.model, this.cls, (value) => this.toDomain(value), filter, options);
  }

  async deleteById(id: Id, options: DeleteOptions = {}): Promise<Result<boolean, never>> {
    const filter = applyRepositoryScope({ _id: id }, this.repositoryScope, this.cls);
    return deleteEntity(this.model, this.cls, filter, options);
  }
}
