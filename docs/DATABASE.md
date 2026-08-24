# Database infrastructure

The API has one database boundary at `apps/api/src/infrastructure/database`. Feature modules use
its public `index.ts` barrel and do not import its internal files.

## Responsibilities

```text
database/
├── context/                  tenant context backed by CLS
├── repositories/             shared repository primitives and query helpers
├── database.module.ts        connection and provider ownership
├── database.service.ts       transactions and connection lifecycle
├── database.types.ts
└── index.ts                  supported public API
```

`DatabaseModule` is global and owns the Postgres `pg.Pool` and Drizzle client. `AppModule` imports it
but does not configure Postgres directly. Connection pool and timeout values come from the validated
environment configuration (`DATABASE_URL`, `DB_MAX_POOL_SIZE`).

## Repository usage

Use `BaseRepository` for global tables and `BaseRepository` with `tenantScoped=true` for tenant-owned
tables:

```ts
import { BaseRepository } from "../../../infrastructure/database";
```

Repository reads paginate with a bounded page size, inherit the active Postgres transaction from CLS,
and exclude soft-deleted records unless explicitly requested. Updates and physical deletes follow the
same soft-delete policy.

Tenant-scoped repositories derive `tenantId` from trusted CLS context in multi-tenant mode. They
overwrite caller-provided tenant filters and fail closed when no tenant is active.

Indexes belong in schema definitions and migrations (`migrations/pg/`); schema files declare Drizzle
indexes using `pgTable(..., (t) => [...])`.

## Transactions

Use `DatabaseService.withResultTransaction` when application operations already return `Result`:

```ts
const result = await database.withResultTransaction(async () => {
  const created = await repository.create(input);
  if (created.isErr()) return err(created.error);
  return ok(created.value);
});
```

The service creates a Postgres transaction via Drizzle, places it in CLS (`databaseTx`) for all
repository calls, commits successful results, aborts errors, and automatically handles rollback.
Transactions return `{ type: "TRANSACTION_FAILED" }` for infrastructure failures.

## Adding database capabilities

1. Put reusable technical code in the appropriate database subdirectory.
2. Keep internal helpers private; export only stable developer-facing capabilities from `index.ts`.
3. Import the public database barrel from feature modules.
4. Add unit tests for pure helpers and integration tests for real repository behavior.
5. Add or change indexes only through a migration.
6. Run `pnpm rules:check`, API tests, lint, and build.
