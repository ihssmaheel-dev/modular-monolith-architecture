# Postgres Migrations

Generated via `drizzle-kit` from `drizzle.config.ts`.

- Schemas: `apps/api/src/infrastructure/database/schemas/*.ts` + `apps/api/src/modules/*/infrastructure/schemas/*.pg.schema.ts`
- Generate: `pnpm --filter api db:generate` -> `migrations/pg/<timestamp>_<name>.sql`
- Apply: `pnpm --filter api db:migrate` (uses `drizzle-kit migrate`)
- Dev push: `pnpm --filter api db:migrate:dev` (drizzle-kit push — no history)

Legacy Mongo migrations archived to `C:\Users\ihssm\AppData\Local\Temp\opencode\mongo-backup\`.
