import {
  Model,
  ClientSession,
  PopulateOptions,
  Types,
} from 'mongoose';
import { ClsService } from 'nestjs-cls';
import { ok, err, Result } from 'neverthrow';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type Id = string | Types.ObjectId;

/**
 * Common options for find and read operations.
 */
export interface BaseFindOptions {
  /** Fields to include or exclude */
  select?: string | string[];
  /** Fields to populate from other collections */
  populate?: string | PopulateOptions | Array<string | PopulateOptions>;
  /** Sort order */
  sort?: string | Record<string, 1 | -1>;
  /** Whether to return plain JS objects (lean). Defaults to true. */
  lean?: boolean;
  /** Maximum number of documents to return */
  limit?: number;
  /** Number of documents to skip */
  skip?: number;
  /** Active client session for transactions */
  session?: ClientSession;
  /** Whether to include soft-deleted documents */
  includeDeleted?: boolean;
  /** Whether to exclusively return soft-deleted documents */
  onlyDeleted?: boolean;
}

/**
 * Options for offset-based pagination.
 */
export interface PaginationOptions extends BaseFindOptions {
  /** Page number, 1-indexed */
  page?: number;
  /** Number of items per page */
  limit?: number;
}

/**
 * Options for cursor-based pagination.
 */
export interface CursorPaginationOptions extends BaseFindOptions {
  limit?: number;
  cursor?: string;
  cursorField?: string;
  direction?: 'asc' | 'desc';
}

/**
 * Result structure for offset-based pagination.
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Result structure for cursor-based pagination.
 */
export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
  limit: number;
}

/**
 * Options for document creation.
 */
export interface CreateOptions {
  /** Active client session for transactions */
  session?: ClientSession;
  /** Whether to automatically set createdBy/updatedBy fields from CLS */
  audit?: boolean;
}

/**
 * Options for document updates.
 */
export interface UpdateOptions extends BaseFindOptions {
  /** Return the modified document rather than the original */
  new?: boolean;
  /** Create the document if it doesn't exist */
  upsert?: boolean;
  /** Run schema validators on the update operation */
  runValidators?: boolean;
  /** Whether to automatically set updatedBy field from CLS */
  audit?: boolean;
  /** Optimistic locking version number */
  version?: number;
}

/**
 * Options for text-based search.
 */
export interface SearchOptions extends BaseFindOptions {
  fields?: string[];
  minScore?: number;
}

/* -------------------------------------------------------------------------- */
/*                         Ultimate Base Repository                           */
/* -------------------------------------------------------------------------- */

/**
 * Abstract generic Base Repository enforcing CQRS and Clean Architecture principles.
 * 
 * Responsibilities:
 * - Encapsulate all database infrastructure logic (Mongoose/MongoDB).
 * - Enforce neverthrow `Result` returns to prevent throwing errors in application code.
 * - Require domain mapping via `toDomain()` so commands and queries only interact with Domain Entities.
 * - Seamlessly integrate with `nestjs-cls` for auditing and transactions.
 * 
 * @template TEntity The pure Domain Entity returned to the application layer.
 * @template TDocument The Mongoose Document interface defining the database schema.
 */
export abstract class BaseRepository<TEntity, TDocument> {
  constructor(
    protected readonly model: Model<TDocument>,
    protected readonly cls?: ClsService,
  ) {}

  /**
   * Maps a raw database document or lean object to a pure Domain Entity.
   * This MUST be implemented by subclasses to enforce boundary separation.
   * 
   * @param doc Raw database document or lean object
   * @returns Pure Domain Entity
   */
  protected abstract toDomain(doc: any): TEntity;

  /* ============================== CREATE ============================== */

  /**
   * Creates a new document and returns the corresponding domain entity.
   * 
   * @param data The data to insert
   * @param options Creation options (session, auditing)
   * @returns Result containing the created Domain Entity
   */
  async create(data: Record<string, any>, options: CreateOptions = {}): Promise<Result<TEntity, never>> {
    const payload = this.applyAuditOnCreate(data, options.audit !== false);

    const docs: any = await this.model.create([payload as any], {
      session: options.session ?? this.getSession(),
    });
    const doc = Array.isArray(docs) ? docs[0] : docs;
    return ok(this.toDomain(doc));
  }

  /**
   * Creates multiple documents in a single operation.
   * 
   * @param data Array of data to insert
   * @param options Creation options (session, auditing)
   * @returns Result containing an array of the created Domain Entities
   */
  async createMany(
    data: Record<string, any>[],
    options: CreateOptions = {},
  ): Promise<Result<TEntity[], never>> {
    const payloads = data.map((item) =>
      this.applyAuditOnCreate(item, options.audit !== false),
    );

    const docs = await this.model.insertMany(payloads, {
      session: options.session ?? this.getSession(),
      ordered: true,
    });
    return ok(docs.map((doc) => this.toDomain(doc)));
  }

  /* =============================== READ =============================== */

  /**
   * Finds a single document by its ObjectId.
   * 
   * @param id The ObjectId string to search for
   * @param options Query and projection options
   * @returns Result containing the Domain Entity, or null if not found
   */
  async findById(id: Id, options: BaseFindOptions = {}): Promise<Result<TEntity | null, never>> {
    let query = this.model.findById(id);
    query = this.applyOptions(query, options);
    const doc = await query.exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  /**
   * Finds a single document matching the given filter criteria.
   * 
   * @param filter Filter criteria
   * @param options Query and projection options
   * @returns Result containing the Domain Entity, or null if not found
   */
  async findOne(
    filter: Record<string, any>,
    options: BaseFindOptions = {},
  ): Promise<Result<TEntity | null, never>> {
    let query = this.model.findOne(this.applySoftDelete(filter, options));
    query = this.applyOptions(query, options);
    const doc = await query.exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  /**
   * Finds all documents matching the given filter criteria.
   * 
   * @param filter Filter criteria
   * @param options Query and projection options
   * @returns Result containing an array of Domain Entities
   */
  async find(
    filter: Record<string, any> = {},
    options: BaseFindOptions = {},
  ): Promise<Result<TEntity[], never>> {
    let query = this.model.find(this.applySoftDelete(filter, options));
    query = this.applyOptions(query, options);
    const docs = await query.exec();
    return ok(docs.map((doc) => this.toDomain(doc)));
  }

  /**
   * Finds all documents in the collection (subject to soft deletes).
   * 
   * @param options Query and projection options
   * @returns Result containing an array of Domain Entities
   */
  async findAll(options: BaseFindOptions = {}): Promise<Result<TEntity[], never>> {
    return this.find({}, options);
  }

  /**
   * Checks if at least one document matches the criteria.
   * 
   * @param filter Filter criteria
   * @param options Query options
   * @returns Result containing a boolean indicating existence
   */
  async exists(
    filter: Record<string, any>,
    options: Pick<BaseFindOptions, 'includeDeleted' | 'onlyDeleted' | 'session'> = {},
  ): Promise<Result<boolean, never>> {
    const result = await this.model
      .exists(this.applySoftDelete(filter, options))
      .session(options.session ?? this.getSession() ?? null);
    return ok(!!result);
  }

  /**
   * Counts the number of documents matching the criteria.
   * 
   * @param filter Filter criteria
   * @param options Query options
   * @returns Result containing the count
   */
  async count(
    filter: Record<string, any> = {},
    options: Pick<BaseFindOptions, 'includeDeleted' | 'onlyDeleted' | 'session'> = {},
  ): Promise<Result<number, never>> {
    const total = await this.model
      .countDocuments(this.applySoftDelete(filter, options))
      .session(options.session ?? this.getSession() ?? null)
      .exec();
    return ok(total);
  }

  /* ============================ PAGINATION ============================ */

  /**
   * Retrieves a paginated list of documents with metadata.
   * 
   * @param filter Filter criteria
   * @param options Offset-based pagination options
   * @returns Result containing the paginated response with Domain Entities
   */
  async paginate(
    filter: Record<string, any> = {},
    options: PaginationOptions = {},
  ): Promise<Result<PaginatedResult<TEntity>, never>> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const skip = (page - 1) * limit;

    const softFilter = this.applySoftDelete(filter, options);

    const [dataResult, total] = await Promise.all([
      this.find(softFilter, { ...options, skip, limit }),
      this.model
        .countDocuments(softFilter)
        .session(options.session ?? this.getSession() ?? null)
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return ok({
      items: dataResult._unsafeUnwrap(),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  }

  /* ============================== UPDATE ============================== */

  /**
   * Updates a single document by its ObjectId.
   * Supports optimistic locking via the `version` option.
   * 
   * @param id The ObjectId string
   * @param update The update payload
   * @param options Update options (auditing, versioning)
   * @returns Result containing the updated Domain Entity, null if not found, or CONFLICT error if version mismatched
   */
  async updateById(
    id: Id,
    update: Record<string, any>,
    options: UpdateOptions = {},
  ): Promise<Result<TEntity | null, { type: 'CONFLICT' }>> {
    const {
      new: returnNew = true,
      upsert = false,
      runValidators = true,
      session,
      version,
      audit = true,
      ...rest
    } = options;

    const finalUpdate = this.applyAuditOnUpdate(update, audit);
    const filter: any = { _id: id };
    if (typeof version === 'number') {
      filter.__v = version;
    }

    let query = this.model.findOneAndUpdate(filter, finalUpdate, {
      new: returnNew,
      upsert,
      runValidators,
      session: session ?? this.getSession(),
    });

    query = this.applyOptions(query, rest);
    const result = await query.exec();

    // Optimistic lock failure check
    if (typeof version === 'number' && !result) {
      return err({ type: 'CONFLICT' });
    }

    if (!result) return ok(null);
    return ok(this.toDomain(result));
  }

  /**
   * Updates a single document matching the filter criteria.
   * Supports optimistic locking via the `version` option.
   * 
   * @param filter Filter criteria
   * @param update The update payload
   * @param options Update options
   * @returns Result containing the updated Domain Entity, null if not found, or CONFLICT error if version mismatched
   */
  async updateOne(
    filter: Record<string, any>,
    update: Record<string, any>,
    options: UpdateOptions = {},
  ): Promise<Result<TEntity | null, { type: 'CONFLICT' }>> {
    const {
      new: returnNew = true,
      upsert = false,
      runValidators = true,
      session,
      version,
      audit = true,
      ...rest
    } = options;

    const finalFilter = this.applySoftDelete(filter, options) as any;
    if (typeof version === 'number') {
      finalFilter.__v = version;
    }

    const finalUpdate = this.applyAuditOnUpdate(update, audit);

    let query = this.model.findOneAndUpdate(finalFilter, finalUpdate, {
      new: returnNew,
      upsert,
      runValidators,
      session: session ?? this.getSession(),
    });

    query = this.applyOptions(query, rest);
    const result = await query.exec();

    if (typeof version === 'number' && !result) {
      return err({ type: 'CONFLICT' });
    }

    if (!result) return ok(null);
    return ok(this.toDomain(result));
  }

  /* ============================== DELETE ============================== */

  /**
   * Soft-deletes a document by its ObjectId, populating `deletedAt`.
   * 
   * @param id The ObjectId string
   * @param options Update options for the soft delete
   * @returns Result containing the soft-deleted Domain Entity
   */
  async softDeleteById(
    id: Id,
    options: { session?: ClientSession; audit?: boolean } = {},
  ): Promise<Result<TEntity | null, never>> {
    const result = await this.updateById(
      id,
      { deletedAt: new Date() },
      { session: options.session, audit: options.audit },
    );
    // Discard optimistic lock conflicts on soft-deletes
    if (result.isErr()) return ok(null);
    return ok(result.value);
  }

  /**
   * Permanently deletes a document from the collection by its ObjectId.
   * Use with caution. Prefer `softDeleteById` for most entities.
   * 
   * @param id The ObjectId string
   * @param options Query options
   * @returns Result containing a boolean indicating if deletion was successful
   */
  async deleteById(
    id: Id,
    options: { session?: ClientSession } = {},
  ): Promise<Result<boolean, never>> {
    const result = await this.model
      .findByIdAndDelete(id, {
        session: options.session ?? this.getSession(),
      })
      .exec();
    return ok(!!result);
  }

  /* ============================== HELPERS ============================= */

  /**
   * Applies soft-delete filters based on query options.
   */
  protected applySoftDelete(
    filter: Record<string, any>,
    options: Pick<BaseFindOptions, 'includeDeleted' | 'onlyDeleted'> = {},
  ): Record<string, any> {
    if (options.onlyDeleted) {
      return {
        ...filter,
        deletedAt: { $exists: true, $ne: null },
      };
    }

    if (options.includeDeleted) return filter;

    return {
      ...filter,
      deletedAt: { $exists: false },
    };
  }

  /**
   * Applies projection, population, sorting, and pagination logic to a query.
   */
  protected applyOptions(query: any, options: BaseFindOptions) {
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate);
    if (options.sort) query = query.sort(options.sort);
    if (options.lean !== false) query = query.lean(); // Default to lean for performance
    if (typeof options.limit === 'number') query = query.limit(options.limit);
    if (typeof options.skip === 'number') query = query.skip(options.skip);
    if (options.session) query = query.session(options.session);
    else if (this.getSession()) query = query.session(this.getSession());

    return query;
  }

  /**
   * Automatically sets `createdBy` and `updatedBy` properties from the CLS context.
   */
  protected applyAuditOnCreate(data: Record<string, any>, enabled: boolean): Record<string, any> {
    if (!enabled || !this.cls) return data;

    const userId = this.cls.get('userId');
    if (!userId) return data;

    return {
      ...data,
      createdBy: userId,
      updatedBy: userId,
    };
  }

  /**
   * Automatically sets `updatedBy` property from the CLS context on updates.
   */
  protected applyAuditOnUpdate(
    update: Record<string, any>,
    enabled: boolean,
  ): Record<string, any> {
    if (!enabled || !this.cls) return update;

    const userId = this.cls.get('userId');
    if (!userId) return update;

    if (update.$set) {
      update.$set.updatedBy = userId;
    } else {
      update.updatedBy = userId;
    }

    return update;
  }

  /**
   * Extracts the current MongoDB session from the CLS context for global transaction boundaries.
   */
  protected getSession(): ClientSession | undefined {
    return this.cls?.get('mongoSession') ?? undefined;
  }
}
