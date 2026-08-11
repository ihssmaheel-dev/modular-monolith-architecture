# Database infrastructure

The API has one database boundary at `apps/api/src/infrastructure/database`. Feature modules use
its public `index.ts` barrel and do not import its internal files.

## Responsibilities

```text
database/
├── context/                  tenant context backed by CLS
├── plugins/                  global Mongoose audit and metrics plugins
├── repositories/             shared repository primitives and query helpers
├── database-connection.factory.ts
├── database.module.ts        connection and provider ownership
├── database.service.ts       transactions and connection lifecycle
├── database.types.ts
└── index.ts                  supported public API
```

`DatabaseModule` is global and owns the Mongoose root connection. `AppModule` imports it but does
not configure MongoDB directly. Connection pool and timeout values come from the validated
environment configuration.

The connection factory installs audit and database metrics plugins once for every schema. Plugins
are internal implementation details and must not be imported by feature modules.

## Repository usage

Use `BaseRepository` for global collections and `TenantScopedRepository` for tenant-owned
collections:

```ts
import { BaseRepository, TenantScopedRepository } from "../../../infrastructure/database";
```

Repository reads are lean by default, paginate with a bounded page size, inherit the active Mongo
session, and exclude soft-deleted documents unless explicitly requested. Updates and physical
deletes follow the same soft-delete policy.

Tenant-scoped repositories derive `tenantId` from trusted CLS context in multi-tenant mode. They
overwrite caller-provided tenant filters and fail closed when no tenant is active. Feature
repositories must not use `this.model` directly because that bypasses repository scoping.

Indexes belong only in `migrations/`; never declare `index: true`, `unique: true`, or
`Schema.index()` in a Mongoose schema.

## Transactions

Use `DatabaseService.withResultTransaction` when application operations already return `Result`:

```ts
const result = await database.withResultTransaction(async () => {
  const created = await repository.create(input);
  if (created.isErr()) return err(created.error);
  return ok(created.value);
});
```

The service creates a session, places it in CLS for all repository calls, commits successful
results, aborts errors, and always closes the session. Transactions return
`{ type: "TRANSACTION_FAILED" }` for infrastructure failures.

MongoDB transactions require a replica set or managed cluster. The optional local replica set is
documented in `docs/TENANCY.md`.

## Adding database capabilities

1. Put reusable technical code in the appropriate database subdirectory.
2. Keep internal helpers private; export only stable developer-facing capabilities from `index.ts`.
3. Import the public database barrel from feature modules.
4. Add unit tests for pure helpers and integration tests for real repository behavior.
5. Add or change indexes only through a migration.
6. Run `pnpm rules:check`, API tests, lint, and build.
