import { ClientSession, PopulateOptions, Types } from "mongoose";

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
  direction?: "asc" | "desc";
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
