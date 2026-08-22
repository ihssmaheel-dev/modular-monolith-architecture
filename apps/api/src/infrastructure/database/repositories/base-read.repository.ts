import { eq, and, isNull, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { ok, type Result } from "neverthrow";
import { DatabaseService } from "../database.service";
import { TenantContextService } from "../context/tenant-context.service";
import type { BaseFindOptions, Id } from "./repository.types";

export abstract class BaseReadRepository<TEntity, TRow> {
  constructor(
    protected readonly table: PgTable,
    protected readonly database: DatabaseService,
    protected readonly tenantContext: TenantContextService,
    protected readonly tenantScoped: boolean = false,
  ) {}

  protected abstract toDomain(row: TRow): TEntity;

  protected getDb() {
    return this.database.getTx() ?? this.database.getDb();
  }

  protected tenantFilter(): Record<string, unknown> | undefined {
    if (!this.tenantScoped) return undefined;
    const ctx = this.tenantContext.get();
    return ctx.tenantId ? { tenantId: ctx.tenantId } : undefined;
  }

  async findById(id: Id, _options: BaseFindOptions = {}): Promise<Result<TEntity | null, never>> {
    const db = this.getDb();
    const idCol = (this.table as unknown as Record<string, { name: string }>)["id"];
    const rows = await (db as unknown as { select: () => { from: (t: unknown) => { where: (c: unknown) => Promise<TRow[]> } } })
      .select()
      .from(this.table)
      .where(eq(idCol as unknown as Parameters<typeof eq>[0], id as string));
    const row = rows[0] ?? null;
    if (!row) return ok(null);
    if ((row as unknown as Record<string, unknown>)["deletedAt"]) return ok(null);
    return ok(this.toDomain(row));
  }

  async findOne(filter: Record<string, unknown>): Promise<Result<TEntity | null, never>> {
    const db = this.getDb();
    const conditions = this.buildConditions({ ...filter, ...this.tenantFilter() });
    const rows = await (db as unknown as { select: () => { from: (t: unknown) => { where: (c: unknown) => { limit: (n: number) => Promise<TRow[]> } } } })
      .select()
      .from(this.table)
      .where(conditions)
      .limit(1);
    const row = rows[0] ?? null;
    return ok(row ? this.toDomain(row) : null);
  }

  async find(filter: Record<string, unknown> = {}): Promise<Result<TEntity[], never>> {
    const db = this.getDb();
    const conditions = this.buildConditions({ ...filter, ...this.tenantFilter() });
    const query = (db as unknown as { select: () => { from: (t: unknown) => { where: (c: unknown) => Promise<TRow[]> } } }).select().from(this.table);
    const rows = conditions
      ? await (query as unknown as { where: (c: unknown) => Promise<TRow[]> }).where(conditions)
      : await (query as unknown as Promise<TRow[]>);
    return ok(rows.map((r) => this.toDomain(r)));
  }

  async count(filter: Record<string, unknown> = {}): Promise<Result<number, never>> {
    const db = this.getDb();
    const conditions = this.buildConditions({ ...filter, ...this.tenantFilter() });
    const result = await (db as unknown as { select: (v: unknown) => { from: (t: unknown) => { where: (c: unknown) => Promise<{ count: number }[]> } } })
      .select({ count: sql<number>`count(*)` })
      .from(this.table)
      .where(conditions);
    return ok(Number(result[0]?.count ?? 0));
  }

  protected buildConditions(filter: Record<string, unknown>): unknown {
    const cols = this.table as unknown as Record<string, unknown>;
    const clauses: unknown[] = [];
    for (const [key, value] of Object.entries(filter)) {
      const col = cols[key] as Parameters<typeof eq>[0] | undefined;
      if (col) clauses.push(eq(col, value as string));
    }
    const deletedAt = cols["deletedAt"] as unknown;
    if (deletedAt) clauses.push(isNull(deletedAt as Parameters<typeof isNull>[0]));
    if (clauses.length === 0) return undefined;
    if (clauses.length === 1) return clauses[0];
    return and(...(clauses as Parameters<typeof and>));
  }
}
