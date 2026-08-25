# Core Rules

Supreme laws of this codebase. These are never negotiable.

**VIOLATIONS WILL BE REJECTED.**

---

## Locked Stack

| Layer | Locked Choice |
|-------|---------------|
| Monorepo | Turborepo + pnpm |
| Backend | NestJS 11 + Fastify 5 |
| Validation | Zod 4 |
| API Contract | oRPC + Scalar API Reference (@scalar/fastify-api-reference) |
| Authorization | Fine-Grained Authorization (RBAC + ReBAC + ABAC) |
| Database | PostgreSQL 16 + Drizzle ORM |
| Cache & Queues | Redis (ioredis) + BullMQ |
| Email Templating | React Email (react-email) |
| Worker Threads | Piscina 5 |
| Result Type | neverthrow 8 |
| Web | React 19 + Vite + TanStack Router + TanStack Query + Zustand + shadcn/ui + Tailwind 4 |
| Mobile | Expo + Expo Router + NativeWind + Zustand |
| Testing | Vitest 5 |
| Icons | Lucide React (web) |

**No paid services. No proprietary dependencies. No exceptions.**

---

## Never (Violation = Rejected)

1. Use microservices — we are a modular monolith.
2. Add packages without checking `PACKAGE_POLICY.md`.
3. Import another module's Drizzle schema or repository.
4. Put business logic in `infrastructure/`.
5. Throw in application/domain layers — use `Result`.
6. Duplicate schemas/types — use `@repo/contracts`, `@repo/authorization`, `@repo/i18n`, `@repo/design-tokens`.
7. Use `any` in production code.
8. Skip Zod validation on API inputs.
9. Import `packages/ui` from mobile.
10. Use `console.log` in production — use Pino.
11. Hardcode user-facing strings — use i18n.
12. Hardcode error messages — use `I18nService`.
13. Use magic numbers — extract to named constants.
14. Create files in wrong locations — see `FILE_PLACEMENT_RULES.md`.

---

## Always (Violation = Rejected)

1. Use `Result<T, E>` from neverthrow in application/domain layers.
2. Validate env vars with Zod at startup.
3. Write thin controllers — delegate, don't decide.
4. Use `I18nService` for backend error messages.
5. Use `useTranslation()` for frontend text.
6. Index database columns used in queries.
7. Paginate list endpoints — never return unbounded arrays.
8. Keep files under 150 lines, functions under 30 lines.
9. Use Pino logger with structured context.
10. Place files in correct locations per `FILE_PLACEMENT_RULES.md`.

---

## Single Source of Truth

- **`@repo/contracts`**: Zod 4 schemas, DTO types, oRPC contracts, and error constants.
- **`@repo/authorization`**: FGA types, action permissions vocabulary, and pure evaluator.
- **`@repo/i18n`**: Multi-language locale dictionaries (JSON) and locale config.
- **`@repo/design-tokens`**: Visual theme design tokens (colors, typography, spacing, radius).

---

## Enforcement

Run `pnpm rules:check` to verify compliance before committing.
