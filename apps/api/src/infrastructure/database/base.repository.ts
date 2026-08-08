import { Model, ClientSession } from 'mongoose';
import { ClsService } from 'nestjs-cls';
import { ok, err, Result } from 'neverthrow';
import { Id, BaseFindOptions, PaginationOptions, PaginatedResult, CreateOptions, UpdateOptions } from './base-repository.types';
import { applySoftDelete, applyOptions, applyAuditOnCreate, applyAuditOnUpdate, getSession } from './base-repository.helpers';

export * from './base-repository.types';

export abstract class BaseRepository<TEntity, TDocument> {
  constructor(protected readonly model: Model<TDocument>, protected readonly cls?: ClsService) {}
  protected abstract toDomain(doc: any): TEntity;

  async create(data: Record<string, any>, options: CreateOptions = {}): Promise<Result<TEntity, never>> {
    const payload = applyAuditOnCreate(data, options.audit !== false, this.cls);
    const docs: any = await this.model.create([payload as any], { session: options.session ?? getSession(this.cls) });
    const doc = Array.isArray(docs) ? docs[0] : docs;
    return ok(this.toDomain(doc));
  }

  async createMany(data: Record<string, any>[], options: CreateOptions = {}): Promise<Result<TEntity[], never>> {
    const payloads = data.map((item) => applyAuditOnCreate(item, options.audit !== false, this.cls));
    const docs = await this.model.insertMany(payloads, { session: options.session ?? getSession(this.cls), ordered: true });
    return ok(docs.map((doc) => this.toDomain(doc)));
  }

  async findById(id: Id, options: BaseFindOptions = {}): Promise<Result<TEntity | null, never>> {
    let query = this.model.findById(id);
    query = applyOptions(query, options, this.cls);
    const doc = await query.exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  async findOne(filter: Record<string, any>, options: BaseFindOptions = {}): Promise<Result<TEntity | null, never>> {
    let query = this.model.findOne(applySoftDelete(filter, options));
    query = applyOptions(query, options, this.cls);
    const doc = await query.exec();
    if (!doc) return ok(null);
    return ok(this.toDomain(doc));
  }

  async find(filter: Record<string, any> = {}, options: BaseFindOptions = {}): Promise<Result<TEntity[], never>> {
    let query = this.model.find(applySoftDelete(filter, options));
    query = applyOptions(query, options, this.cls);
    const docs = await query.exec();
    return ok(docs.map((doc) => this.toDomain(doc)));
  }

  async findAll(options: BaseFindOptions = {}): Promise<Result<TEntity[], never>> {
    return this.find({}, options);
  }

  async exists(filter: Record<string, any>, options: Pick<BaseFindOptions, 'includeDeleted' | 'onlyDeleted' | 'session'> = {}): Promise<Result<boolean, never>> {
    const result = await this.model.exists(applySoftDelete(filter, options)).session(options.session ?? getSession(this.cls) ?? null);
    return ok(!!result);
  }

  async count(filter: Record<string, any> = {}, options: Pick<BaseFindOptions, 'includeDeleted' | 'onlyDeleted' | 'session'> = {}): Promise<Result<number, never>> {
    const total = await this.model.countDocuments(applySoftDelete(filter, options)).session(options.session ?? getSession(this.cls) ?? null).exec();
    return ok(total);
  }

  async paginate(filter: Record<string, any> = {}, options: PaginationOptions = {}): Promise<Result<PaginatedResult<TEntity>, never>> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const skip = (page - 1) * limit;
    const softFilter = applySoftDelete(filter, options);
    const [dataResult, total] = await Promise.all([
      this.find(softFilter, { ...options, skip, limit }),
      this.model.countDocuments(softFilter).session(options.session ?? getSession(this.cls) ?? null).exec(),
    ]);
    const totalPages = Math.ceil(total / limit) || 1;
    return ok({ items: dataResult._unsafeUnwrap(), total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 });
  }

  async updateById(id: Id, update: Record<string, any>, options: UpdateOptions = {}): Promise<Result<TEntity | null, { type: 'CONFLICT' }>> {
    const { new: returnNew = true, upsert = false, runValidators = true, session, version, audit = true, ...rest } = options;
    const finalUpdate = applyAuditOnUpdate(update, audit, this.cls);
    const filter: any = { _id: id };
    if (typeof version === 'number') filter.__v = version;
    let query = this.model.findOneAndUpdate(filter, finalUpdate, { new: returnNew, upsert, runValidators, session: session ?? getSession(this.cls) });
    query = applyOptions(query, rest, this.cls);
    const result = await query.exec();
    if (typeof version === 'number' && !result) return err({ type: 'CONFLICT' });
    if (!result) return ok(null);
    return ok(this.toDomain(result));
  }

  async updateOne(filter: Record<string, any>, update: Record<string, any>, options: UpdateOptions = {}): Promise<Result<TEntity | null, { type: 'CONFLICT' }>> {
    const { new: returnNew = true, upsert = false, runValidators = true, session, version, audit = true, ...rest } = options;
    const finalFilter = applySoftDelete(filter, options) as any;
    if (typeof version === 'number') finalFilter.__v = version;
    const finalUpdate = applyAuditOnUpdate(update, audit, this.cls);
    let query = this.model.findOneAndUpdate(finalFilter, finalUpdate, { new: returnNew, upsert, runValidators, session: session ?? getSession(this.cls) });
    query = applyOptions(query, rest, this.cls);
    const result = await query.exec();
    if (typeof version === 'number' && !result) return err({ type: 'CONFLICT' });
    if (!result) return ok(null);
    return ok(this.toDomain(result));
  }

  async softDeleteById(id: Id, options: { session?: ClientSession; audit?: boolean } = {}): Promise<Result<TEntity | null, never>> {
    const result = await this.updateById(id, { deletedAt: new Date() }, { session: options.session, audit: options.audit });
    if (result.isErr()) return ok(null);
    return ok(result.value);
  }

  async deleteById(id: Id, options: { session?: ClientSession } = {}): Promise<Result<boolean, never>> {
    const result = await this.model.findByIdAndDelete(id, { session: options.session ?? getSession(this.cls) }).exec();
    return ok(!!result);
  }
}
