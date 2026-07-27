# Core Rules

Supreme laws of this codebase. These are never negotiable.

---

## Locked Stack

The following technologies are locked. Do not add, replace, or suggest alternatives without explicit approval.

| Layer | Locked Choice |
|-------|---------------|
| Monorepo | Turborepo + pnpm |
| Backend | NestJS + Fastify |
| Validation | Zod + nestjs-zod |
| API Contract | ts-rest |
| Database | MongoDB + Mongoose |
| Migrations | migrate-mongo |
| Cache & Queues | Redis + BullMQ |
| Result Type | neverthrow |
| Web Frontend | React 19 + Vite + TanStack Router + TanStack Query + Zustand + shadcn/ui + Tailwind |
| Mobile | Expo + Expo Router + NativeWind + Zustand |
| Testing | Vitest + Supertest + Playwright + Maestro |
| CI | GitHub Actions |

**No paid services. No proprietary dependencies. No exceptions.**

---

## Never Do These

1. **Never** use microservices. We are a modular monolith. Extraction happens only when pain is measured and documented.
2. **Never** add a package without checking `PACKAGE_POLICY.md` first.
3. **Never** import another module's Mongoose model or repository directly.
4. **Never** put business logic in `infrastructure/` folders (root or module-level).
5. **Never** throw in application or domain layers for expected failures. Use `Result` from neverthrow.
6. **Never** duplicate a Zod schema, type, or constant. If it exists in `packages/shared`, use it.
7. **Never** use `any` type. Use `unknown` if the type is genuinely unclear.
8. **Never** skip Zod validation on API inputs.
9. **Never** create circular dependencies between modules or packages.
10. **Never** import `packages/ui` from mobile. It is web-only.
11. **Never** skip migrations for schema changes that affect existing data.
12. **Never** hand-maintain API client types. Use ts-rest contracts.

---

## Always Do These

1. **Always** define Zod schemas in `packages/shared` before implementing.
2. **Always** use the mandatory module folder structure (see `MODULE_RULES.md`).
3. **Always** return `Result<T, E>` or `ResultAsync<T, E>` from application and domain layers.
4. **Always** validate environment variables with Zod at startup.
5. **Always** write thin controllers — they delegate, they don't decide.
6. **Always** place cross-cutting infrastructure in `src/infrastructure/`, domain-specific persistence in `modules/[domain]/infrastructure/`.
7. **Always** prefer fewer, higher-value tests over noisy ones.
8. **Always** ask: "Is this the simplest structure that could work?"

---

## Single Source of Truth

`packages/shared` is the heart of the system. Every Zod schema, type, constant, permission, and contract lives there.

**Rule:** If a type or validation exists in more than one place → it belongs in `packages/shared`.

---

## Module Boundaries

- Modules communicate only through application services or domain events.
- No cross-module model imports.
- No shared database state between modules.
- Modules are independent as much as realistically possible.

---

## The North Star

**Under-engineered but never messy.**

Enforced by asking in every PR: "Is this the simplest structure that could work? Does it belong where I'm putting it?"
