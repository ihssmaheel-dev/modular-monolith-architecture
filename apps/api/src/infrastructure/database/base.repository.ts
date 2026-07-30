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

export interface BaseFindOptions {
  select?: string | string[];
  populate?: string | PopulateOptions | Array<string | PopulateOptions>;
  sort?: string | Record<string, 1 | -1>;
  lean?: boolean;
  limit?: number;
  skip?: number;
  session?: ClientSession;
  includeDeleted?: boolean;
  onlyDeleted?: boolean;
}

export interface PaginationOptions extends BaseFindOptions {
  page?: number;
  limit?: number;
}

export interface CursorPaginationOptions extends BaseFindOptions {
  limit?: number;
  cursor?: string;
  cursorField?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
  limit: number;
}

export interface CreateOptions {
  session?: ClientSession;
  audit?: boolean;
}

export interface UpdateOptions extends BaseFindOptions {
  new?: boolean;
  upsert?: boolean;
  runValidators?: boolean;
  audit?: boolean;
  version?: number;
}

export interface SearchOptions extends BaseFindOptions {
  fields?: string[];
  minScore?: number;
}

/* -------------------------------------------------------------------------- */
/*                         Ultimate Base Repository                           */
/* -------------------------------------------------------------------------- */

export abstract class BaseRepository<TEntity, TDocument> {
  constructor(
    protected readonly model: Model<TDocument>,
    protected readonly cls?: ClsService,
  ) {}

  protected abstract toDomain(doc: any): TEntity;

  /* ============================== CREATE ============================== */

  async create(data: Record<string, any>, options: CreateOptions = {}): Promise<Result<TEntity, never>> {
    const payload = this.applyAuditOnCreate(data, options.audit !== false);

    const docs: any = await this.model.create([payload as any], {
      session: options.session ?? this.getSession(),
    });
    const doc = Array.isArray(docs) ? docs[0] : docs;
    return ok(this.toDomain(doc));
  }

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

  async findById(id: Id, options: BaseFindOptions = {}): Promise<Result<TEntity | null, never>> {
    let query = this.model.findById(id);
    query = this.applyOptions(query, options);
    const doc = await query.exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

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

  async find(
    filter: Record<string, any> = {},
    options: BaseFindOptions = {},
  ): Promise<Result<TEntity[], never>> {
    let query = this.model.find(this.applySoftDelete(filter, options));
    query = this.applyOptions(query, options);
    const docs = await query.exec();
    return ok(docs.map((doc) => this.toDomain(doc)));
  }

  async findAll(options: BaseFindOptions = {}): Promise<Result<TEntity[], never>> {
    return this.find({}, options);
  }

  async exists(
    filter: Record<string, any>,
    options: Pick<BaseFindOptions, 'includeDeleted' | 'onlyDeleted' | 'session'> = {},
  ): Promise<Result<boolean, never>> {
    const result = await this.model
      .exists(this.applySoftDelete(filter, options))
      .session(options.session ?? this.getSession() ?? null);
    return ok(!!result);
  }

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

    let finalUpdate = this.applyAuditOnUpdate(update, audit);

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

    if (typeof version === 'number' && !result) {
      return err({ type: 'CONFLICT' });
    }

    if (!result) return ok(null);
    return ok(this.toDomain(result));
  }

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

    let finalFilter = this.applySoftDelete(filter, options) as any;
    if (typeof version === 'number') {
      finalFilter.__v = version;
    }

    let finalUpdate = this.applyAuditOnUpdate(update, audit);

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

  async softDeleteById(
    id: Id,
    options: { session?: ClientSession; audit?: boolean } = {},
  ): Promise<Result<TEntity | null, never>> {
    const result = await this.updateById(
      id,
      { deletedAt: new Date() },
      { session: options.session, audit: options.audit },
    );
    // Ignore conflict error mapping for soft delete here, assume basic flow
    if (result.isErr()) return ok(null);
    return ok(result.value);
  }

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

  protected applyOptions(query: any, options: BaseFindOptions) {
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate);
    if (options.sort) query = query.sort(options.sort);
    if (options.lean !== false) query = query.lean(); // Default to lean for domains
    if (typeof options.limit === 'number') query = query.limit(options.limit);
    if (typeof options.skip === 'number') query = query.skip(options.skip);
    if (options.session) query = query.session(options.session);
    else if (this.getSession()) query = query.session(this.getSession());

    return query;
  }

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

  protected getSession(): ClientSession | undefined {
    return this.cls?.get('mongoSession') ?? undefined;
  }
}
