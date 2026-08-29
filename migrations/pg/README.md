# Postgres Migrations

Generated via `drizzle-kit` from `drizzle.config.ts`.

- Schemas: `apps/api/src/infrastructure/*/schemas/*.schema.ts` + `apps/api/src/modules/*/infrastructure/schemas/*.schema.ts`
- Generate: `pnpm --filter api db:generate` -> `migrations/pg/<timestamp>_<name>.sql`
- Apply: `pnpm --filter api db:migrate` (uses the API migrator with a PostgreSQL advisory lock)
- Dev push: `pnpm --filter api db:migrate:dev` (drizzle-kit push — no history)
- Check status: `pnpm --filter api db:migrate:status` (uses `drizzle-kit check`; run it in CI and before releases)

Production migrations are append-only. Review generated SQL before applying it, never edit an
already-applied migration, and keep the journal entry in `migrations/pg/meta/_journal.json` in sync.
Operational or security SQL that is not represented in the Drizzle schema belongs in a reviewed,
journaled migration like `0003_production_hardening.sql`.
