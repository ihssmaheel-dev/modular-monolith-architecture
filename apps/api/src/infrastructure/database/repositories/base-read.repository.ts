import type { Model } from "mongoose";
import type { ClsService } from "nestjs-cls";
import type { Result } from "neverthrow";
import {
  countEntities,
  entityExists,
  findEntities,
  findEntityById,
  findOneEntity,
} from "./repository-read";
import type { RepositoryScope } from "./repository-scope";
import type { BaseFindOptions, Id } from "./repository.types";

export abstract class BaseReadRepository<TEntity, TDocument> {
  constructor(
    protected readonly model: Model<TDocument>,
    protected readonly cls?: ClsService,
    protected readonly repositoryScope: RepositoryScope = "global",
  ) {}

  protected abstract toDomain(document: unknown): TEntity;

  findById(id: Id, options: BaseFindOptions = {}): Promise<Result<TEntity | null, never>> {
    return findEntityById(
      this.model,
      this.cls,
      (value) => this.toDomain(value),
      this.repositoryScope,
      id,
      options,
    );
  }

  findOne(
    filter: Record<string, unknown>,
    options: BaseFindOptions = {},
  ): Promise<Result<TEntity | null, never>> {
    return findOneEntity(
      this.model,
      this.cls,
      (value) => this.toDomain(value),
      this.repositoryScope,
      filter,
      options,
    );
  }

  find(
    filter: Record<string, unknown> = {},
    options: BaseFindOptions = {},
  ): Promise<Result<TEntity[], never>> {
    return findEntities(
      this.model,
      this.cls,
      (value) => this.toDomain(value),
      this.repositoryScope,
      filter,
      options,
    );
  }

  exists(
    filter: Record<string, unknown>,
    options: Pick<BaseFindOptions, "includeDeleted" | "onlyDeleted" | "session"> = {},
  ): Promise<Result<boolean, never>> {
    return entityExists(this.model, this.cls, this.repositoryScope, filter, options);
  }

  count(
    filter: Record<string, unknown> = {},
    options: Pick<BaseFindOptions, "includeDeleted" | "onlyDeleted" | "session"> = {},
  ): Promise<Result<number, never>> {
    return countEntities(this.model, this.cls, this.repositoryScope, filter, options);
  }
}
