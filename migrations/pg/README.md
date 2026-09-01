# Postgres Migrations

Generated via `drizzle-kit` from `drizzle.config.ts`.

- Schemas: `apps/api/src/infrastructure/*/schemas/*.schema.ts` + `apps/api/src/modules/*/infrastructure/schemas/*.schema.ts`
- Generate: `pnpm --filter api db:generate` -> `migrations/pg/<timestamp>_<name>.sql`
- Apply: `pnpm --filter api db:migrate` (uses the API migrator with a PostgreSQL advisory lock)
- Verify clean and upgrade paths: `pnpm --filter api db:migrate:check` (requires a PostgreSQL
  role with permission to create and drop temporary databases; CI runs this against PostgreSQL 16)
- Dev push: `pnpm --filter api db:migrate:dev` (drizzle-kit push — no history)
- Check status: `pnpm --filter api db:migrate:status` (uses `drizzle-kit check`; run it in CI and before releases)

The migration check creates isolated databases, applies the complete chain to one, and upgrades
another from every migration except the latest. It also verifies the enum ownership, migration
history, hardening RLS policies, and audit-retention function.

Production migrations are append-only. Review generated SQL before applying it, never edit an
already-applied migration, and keep the journal entry in `migrations/pg/meta/_journal.json` in sync.
The duplicate enum statement that was present in the pre-release hardening migration was removed
before production rollout; subsequent migrations must remain immutable.
Environments that already applied the pre-release 0003 should keep their existing migration
history and must not replay that migration manually.
Operational or security SQL that is not represented in the Drizzle schema belongs in a reviewed,
journaled migration like `0003_production_hardening.sql`.
