import { ClientSession } from 'mongoose';
import { ClsService } from 'nestjs-cls';
import { BaseFindOptions } from './base-repository.types';

export function applySoftDelete(
  filter: Record<string, any>,
  options: Pick<BaseFindOptions, 'includeDeleted' | 'onlyDeleted'> = {},
): Record<string, any> {
  if (options.onlyDeleted) {
    return { ...filter, deletedAt: { $exists: true, $ne: null } };
  }
  if (options.includeDeleted) return filter;
  return { ...filter, deletedAt: { $exists: false } };
}

export function applyOptions(query: any, options: BaseFindOptions, cls?: ClsService) {
  if (options.select) query = query.select(options.select);
  if (options.populate) query = query.populate(options.populate);
  if (options.sort) query = query.sort(options.sort);
  if (options.lean !== false) query = query.lean();
  if (typeof options.limit === 'number') query = query.limit(options.limit);
  if (typeof options.skip === 'number') query = query.skip(options.skip);
  if (options.session) query = query.session(options.session);
  else {
    const session = cls?.get('mongoSession') ?? undefined;
    if (session) query = query.session(session);
  }
  return query;
}

export function applyAuditOnCreate(
  data: Record<string, any>,
  enabled: boolean,
  cls?: ClsService,
): Record<string, any> {
  if (!enabled || !cls) return data;
  const userId = cls.get('userId');
  if (!userId) return data;
  return { ...data, createdBy: userId, updatedBy: userId };
}

export function applyAuditOnUpdate(
  update: Record<string, any>,
  enabled: boolean,
  cls?: ClsService,
): Record<string, any> {
  if (!enabled || !cls) return update;
  const userId = cls.get('userId');
  if (!userId) return update;
  if (update.$set) {
    update.$set.updatedBy = userId;
  } else {
    update.updatedBy = userId;
  }
  return update;
}

export function getSession(cls?: ClsService): ClientSession | undefined {
  return cls?.get('mongoSession') ?? undefined;
}
