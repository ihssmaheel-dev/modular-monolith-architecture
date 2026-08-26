# File Placement Rules

Where to create new files in this codebase. Every file must land in the correct location on first creation. Moving files later is waste.

---

## Decision Tree

Before creating any file, answer these questions in order:

1. **Is it shared across apps?** → `packages/`
2. **Is it a UI component?** → `packages/ui/src/components/`
3. **Is it a Zod schema, type, or contract?** → `packages/contracts/src/`
4. **Is it authorization rules, permissions, or evaluator?** → `packages/authorization/src/`
5. **Is it translations or locale definitions?** → `packages/i18n/src/`
6. **Is it visual design tokens?** → `packages/design-tokens/src/`
7. **Is it backend infrastructure?** → `apps/api/src/infrastructure/`
8. **Is it a backend module?** → `apps/api/src/modules/[domain]/`
9. **Is it web frontend?** → `apps/web/src/`
10. **Is it mobile?** → `apps/mobile/`
11. **Is it config or docs?** → Root level

---

## Root Level Files

| File | When to Create |
|------|---------------|
| `AGENTS.md` | AI agent entry point. Already exists. |
| `turbo.json` | Turborepo pipeline config. Already exists. |
| `pnpm-workspace.yaml` | Workspace definition. Already exists. |
| `tsconfig.base.json` | Shared TypeScript config. Already exists. |
| `docker-compose.yml` | Local dev services. Already in `docker/`. |
| `.gitignore` | Git rules. Already exists. |
| `.npmrc` | pnpm config. Already exists. |
| `README.md` | Project overview. Create only if missing. |

**Never create random config files at root.** They belong in specific packages or apps.

---

## Capability Packages (`packages/*`)

Focused capability packages: `@repo/contracts`, `@repo/authorization`, `@repo/i18n`, `@repo/design-tokens`.

### 1. `@repo/contracts` (`packages/contracts/src/`)
- Schemas (`schemas/*.schema.ts`): Zod 4 schemas & DTOs
- Contracts (`contracts/*.contract.ts`): oRPC route definitions
- Types (`types/*.types.ts`): Request/Response type interfaces
- Constants (`constants/*.ts`): Shared error codes & pagination defaults

### 2. `@repo/authorization` (`packages/authorization/src/`)
- Types (`types.ts`): Principal, ResourceDescriptor, Policy, Decision
- Permissions (`permissions.ts`): Action vocabulary & wildcard resolver
- Evaluator (`evaluator.ts`): Pure FGA engine (RBAC + ReBAC + ABAC)

### 3. `@repo/i18n` (`packages/i18n/src/`)
- Locales (`locales/*.json`): en.json, es.json, fr.json
- Config (`index.ts`): Locale definitions & keys

### 4. `@repo/design-tokens` (`packages/design-tokens/src/`)
- Colors (`colors.ts`): Color tokens, typography, spacing, radius scales

---

## packages/ui/

Web-only UI components built with headless Radix UI primitives and styled with Tailwind CSS v4. Never used by mobile.

```
packages/ui/src/
├── components/
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── badge.tsx
│   ├── separator.tsx
│   ├── avatar.tsx
│   ├── skeleton.tsx
│   ├── spinner.tsx
│   ├── checkbox.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── popover.tsx
│   ├── tooltip.tsx
│   ├── tabs.tsx
│   ├── accordion.tsx
│   ├── calendar.tsx
│   ├── date-picker.tsx
│   ├── combobox.tsx
│   ├── multi-select.tsx
│   ├── table.tsx
│   ├── data-table.tsx
│   ├── data-table-column-header.tsx
│   ├── data-table-pagination.tsx
│   └── data-table-view-options.tsx
├── lib/
│   └── utils.ts              ← cn() helper, etc.
└── index.ts                  ← Main barrel export
```

### Rules
- One component per file. Flat structure (no folders per component).
- File name is kebab-case matching the component.
- Export through `packages/ui/src/index.ts`.
- No business logic, no API calls, no state management.
- No upload utilities, hooks, or stores — those belong in `apps/web/src/`.

---

## packages/api-client/

API client factory and helpers.

```
packages/api-client/src/
├── index.ts                   ← createApiClient() factory
└── types.ts                   ← Client-specific types
```

### Rules
- Client uses `createApiClient(baseUrl)` pattern.
- No `process.env` at import time.
- Uses oRPC contracts (`oc.router`) from `@repo/contracts` via `RPCLink` + `createORPCClient`.

---

## apps/api/src/

### Config Files

```
apps/api/src/config/
├── env.ts                     ← Environment loader (uses Zod schema from contracts)
```

### Rules
- Only `env.ts` goes here.
- Uses `envSchema.safeParse(process.env)` from `@repo/contracts`.
- Exports validated `env` object.
- Never add `process.env` anywhere else.

---

### Common Files

```
apps/api/src/common/
├── filters/
│   ├── exception.filter.ts    ← Global exception filter
│   └── index.ts
├── guards/
│   ├── auth.guard.ts          ← Authentication guard
│   └── index.ts
├── interceptors/
│   ├── logging.interceptor.ts ← Request/response logging
│   └── index.ts
├── pipes/
│   ├── validation.pipe.ts     ← Zod validation pipe
│   └── index.ts
├── decorators/
│   ├── public.decorator.ts    ← @Public() decorator
│   └── index.ts
├── exceptions/
│   ├── zod-validation.exception.ts ← Zod validation exception
│   └── index.ts
└── utils/
    ├── presentation.utils.ts  ← Result-to-HTTP mapper
    ├── circuit-breaker.ts     ← Circuit breaker pattern
    ├── bulkhead.ts            ← Bulkhead pattern
    └── index.ts
```

### Rules
- Cross-cutting concerns only.
- Must be registered in `app.module.ts` or `main.ts`.
- One concern per file.
- Index files for clean imports.

---

### Infrastructure (Cross-Cutting)

```
apps/api/src/infrastructure/
├── database/
│   ├── database.module.ts     ← Postgres pool & Drizzle client
│   └── database.service.ts
├── logger/
│   ├── logger.module.ts       ← Pino logger
│   ├── logger.service.ts
│   └── logger.module.ts
├── redis/
│   ├── redis.module.ts        ← ioredis connection
│   ├── redis.service.ts
│   └── redis.module.ts
├── queue/
│   ├── queue.module.ts        ← BullMQ root config
│   ├── queue.service.ts
│   └── queue.module.ts
└── workers/
    ├── workers.module.ts      ← Piscina worker pools
    ├── piscina.service.ts
    └── tasks/
        ├── csv-parser.ts      ← Worker task functions
        └── hash.ts
```

### Rules
- Cross-cutting only. Used by multiple modules.
- Must be `@Global()` if used across modules.
- Must use `env` from `config/env.ts`.
- Must implement `OnModuleDestroy` for cleanup.
- No business logic. Pure technical concern.
- Worker tasks are pure functions. No NestJS imports.
- Interactive API Reference setup goes in `infrastructure/api-docs/`.
- Fine-Grained Authorization setup goes in `infrastructure/authorization/`.

---

### Modules

```
apps/api/src/modules/
└── [domain]/
    ├── [domain].module.ts     ← NestJS module definition
    ├── presentation/
    │   ├── [domain].controller.ts
    │   └── index.ts
    ├── application/
    │   ├── commands/           ← Optional: split when 6+ operations
    │   │   ├── create-[domain].ts
    │   │   └── index.ts
    │   ├── queries/            ← Optional: split when 6+ operations
    │   │   ├── get-[domain].ts
    │   │   └── index.ts
    │   └── listeners/          ← Optional: domain event handlers
    │       ├── [domain]-created.listener.ts
    │       └── index.ts
    ├── domain/
    │   ├── entities/
    │   │   ├── [domain].entity.ts
    │   │   ├── [domain].entity.test.ts
    │   │   └── index.ts
    │   ├── value-objects/
    │   │   ├── email.value-object.ts
    │   │   └── index.ts
    │   ├── events/
    │   │   ├── [domain]-created.event.ts
    │   │   └── index.ts
    │   └── errors/
    │       ├── [domain].errors.ts
    │       └── index.ts
    └── infrastructure/
        ├── schemas/
        │   ├── [domain].schema.ts
        │   └── index.ts
        └── [domain].repository.ts
```

### Rules
- Start flat (no commands/queries/ folders) until 6+ operations.
- Test files co-locate with source: `create-user.command.test.ts` next to `create-user.command.ts`.
- Sub-folders by layer are mandatory (presentation, application, domain, infrastructure).
- Controller is thin: validate → call command/query → map Result to HTTP.
- One module per domain. Don't mix concerns.

---

## apps/web/src/

```
apps/web/src/
├── main.tsx                   ← App entry point
├── index.css                  ← Global styles + Tailwind
├── lib/
│   ├── api.ts                 ← createApiClient() instance
│   ├── upload.ts              ← S3 presigned upload utility
│   ├── query-client.ts        ← TanStack Query client
│   └── i18n/
│       └── index.ts           ← i18n initialization
├── routes/
│   ├── __root.tsx             ← Root layout (TanStack Router)
│   ├── index.tsx              ← Home page
│   ├── _auth.login.tsx        ← Login page
│   ├── _auth.register.tsx     ← Register page
│   ├── _auth.forgot-password.tsx
│   ├── _dashboard.tsx         ← Dashboard layout wrapper
│   ├── _dashboard.index.tsx   ← Dashboard home
│   ├── _dashboard.users.tsx   ← Users list page
│   ├── _dashboard.notes.tsx   ← Notes list page
│   └── _dashboard.settings.tsx
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── page-container.tsx
│   ├── features/
│   │   ├── notes/
│   │   │   ├── CreateNoteForm.tsx
│   │   │   └── NotesList.tsx
│   │   └── users/
│   │       └── UserCard.tsx
│   └── shared/
│       ├── theme-toggle.tsx
│       └── error-boundary.tsx
├── hooks/
│   ├── use-file-upload.ts     ← File upload hook
│   ├── use-theme.ts           ← Theme hook
│   ├── use-authorization.ts   ← FGA permission hooks
│   ├── use-permissions.ts
│   ├── use-optimistic-mutation.ts ← Reusable 0ms optimistic mutation hook
│   └── use-notes.ts           ← Optimistic entity query hook
└── stores/
    ├── auth.store.ts          ← Auth Zustand store (purges query cache on logout)
    ├── tenant.store.ts        ← Tenant Zustand store (purges query cache on tenant switch)
    └── ui.store.ts            ← UI Zustand store
```

### Rules
- Routes follow TanStack Router file conventions.
- Components are presentational or container (thin).
- `lib/` contains framework utilities (api client, upload, query client, i18n init).
- `hooks/` contains React hooks (TanStack Query wrappers, optimistic mutation hooks, custom hooks).
- `stores/` contains Zustand stores for client state.
- Upload utilities (`upload.ts`) and hooks (`use-file-upload.ts`) live in `apps/web/src/`, not `packages/ui`.
- No direct `fetch`/`axios` — use `packages/api-client`.

---

## apps/mobile/

```
apps/mobile/
├── app/
│   ├── _layout.tsx            ← Root layout (Expo Router)
│   ├── index.tsx              ← Home screen
│   ├── users/
│   │   ├── index.tsx          ← Users list screen
│   │   └── [userId].tsx       ← User detail screen
│   └── (+tabs)/               ← Tab layout
├── components/
│   ├── UserCard.tsx
│   └── index.ts
├── hooks/
│   ├── useUsers.ts
│   └── index.ts
├── stores/
│   ├── auth.store.ts
│   └── index.ts
└── types/
    └── index.ts
```

### Rules
- Expo Router file conventions.
- Never import `packages/ui`.
- Same Zod schemas from `@repo/contracts`.
- Same API client as web.

---

## Testing Files

### Backend Tests

Co-locate with source:

```
users/
├── commands/
│   ├── create-user.command.ts
│   ├── create-user.command.test.ts        ← Unit test
│   └── create-user.command.integration.test.ts  ← Integration test
├── users.controller.ts
├── users.controller.e2e.test.ts ← E2E test
```

### Frontend Tests

Co-locate with component:

```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
```

### Test Naming
- Unit: `[source-file].test.ts`
- Integration: `[source-file].integration.test.ts`
- E2E: `[source-file].e2e.test.ts`

---

## Migration Files

```
migrations/
└── pg/
    ├── 0000_orange_deadpool.sql
    ├── 0001_audit_immutable.sql
    ├── README.md
    └── meta/
```

### Rules
- Managed via `drizzle-kit` from `drizzle.config.ts`.
- Generate: `pnpm --filter api db:generate`.
- Apply: `pnpm --filter api db:migrate`.
- Check status: `pnpm --filter api db:migrate:status`.

---

## Docs

```
docs/
├── ARCHITECTURE.md             ← Architecture overview
├── ARCHITECTURE_EXPLAINED.md   ← Plain-English guide
└── API.md                      ← API documentation (if needed)
```

### Rules
- Docs are living. Update when architecture changes.
- No auto-generated docs in this folder.

---

## Common Mistakes

| Mistake | Correct Location |
|---------|-----------------|
| Zod schema in module folder | `packages/contracts/src/schemas/` |
| Type definition in component file | `packages/contracts/src/types/` or nearest `types/` folder |
| API call with `fetch()` | `packages/api-client` |
| `process.env` outside `config/env.ts` | `config/env.ts` only |
| Business logic in controller | `application/` command/query layer |
| Business logic in repository | `domain/` entity or value object |
| ORM/DB driver in domain layer | `infrastructure/` layer only |
| Test file far from source | Co-locate with source file |
| Utility in random location | `packages/contracts/src/` or nearest `lib/` |
| Component in routes folder | `components/` folder |
| Store in components folder | `stores/` folder |
| Hook in components folder | `hooks/` folder |
| API Docs in config folder | `infrastructure/api-docs/` |

---

## Quick Reference

| What You're Creating | Where It Goes |
|---------------------|---------------|
| Zod schema | `packages/contracts/src/schemas/[domain].schema.ts` |
| TypeScript type | `packages/contracts/src/types/[domain].types.ts` |
| oRPC contract | `packages/contracts/src/contracts/[domain].contract.ts` |
| Shared constant | `packages/contracts/src/constants/[category].ts` |
| Action permission | `packages/authorization/src/permissions/[domain].permissions.ts` |
| Pure FGA evaluator | `packages/authorization/src/evaluator.ts` |
| i18n translations | `packages/i18n/src/locales/[locale].json` |
| Theme design tokens | `packages/design-tokens/src/` |
| UI component | `packages/ui/src/components/[name].tsx` |
| API client helper | `packages/api-client/src/` |
| Env config | `apps/api/src/config/env.ts` |
| API Docs setup | `apps/api/src/infrastructure/api-docs/` |
| Authorization service | `apps/api/src/infrastructure/authorization/` |
| Domain policies | `apps/api/src/modules/[domain]/application/[domain].policies.ts` |
| Exception filter | `apps/api/src/common/filters/` |
| Auth guard | `apps/api/src/common/guards/` |
| Permissions guard | `apps/api/src/common/guards/permissions.guard.ts` |
| Validation pipe | `apps/api/src/common/pipes/` |
| Database connection | `apps/api/src/infrastructure/database/` |
| Logger | `apps/api/src/infrastructure/logger/` |
| Redis connection | `apps/api/src/infrastructure/redis/` |
| Queue config | `apps/api/src/infrastructure/queue/` |
| Worker pool | `apps/api/src/infrastructure/workers/` |
| Cache service | `apps/api/src/infrastructure/cache/` |
| Storage service | `apps/api/src/infrastructure/storage/` |
| Email service | `apps/api/src/infrastructure/email/` |
| Realtime service | `apps/api/src/infrastructure/realtime/` |
| Session service | `apps/api/src/infrastructure/session/` |
| Health probes | `apps/api/src/infrastructure/health/` |
| Rate limiting | `apps/api/src/infrastructure/rate-limit/` |
| WAF middleware | `apps/api/src/infrastructure/waf/` |
| i18n service | `apps/api/src/infrastructure/i18n/` |
| Backend module | `apps/api/src/modules/[domain]/` |
| Module controller | `apps/api/src/modules/[domain]/presentation/` |
| Module Command/Query | `apps/api/src/modules/[domain]/application/` |
| Domain entity | `apps/api/src/modules/[domain]/domain/entities/` |
| Value object | `apps/api/src/modules/[domain]/domain/value-objects/` |
| Domain event | `apps/api/src/modules/[domain]/domain/events/` |
| Domain error | `apps/api/src/modules/[domain]/domain/errors/` |
| Drizzle schema | `apps/api/src/modules/[domain]/infrastructure/schemas/` |
| Repository | `apps/api/src/modules/[domain]/infrastructure/` |
| Backend unit test | Co-locate with source: `[name].test.ts` |
| Backend integration test | Co-locate with source: `[name].integration.test.ts` |
| Backend E2E test | Co-locate with source: `[name].e2e.test.ts` |
| Web route | `apps/web/src/routes/` |
| Web component | `apps/web/src/components/` |
| Web hook | `apps/web/src/hooks/` |
| Web Zustand store | `apps/web/src/stores/` |
| Web test | Co-locate with component: `[Name].test.tsx` |
| Mobile screen | `apps/mobile/app/` |
| Mobile component | `apps/mobile/components/` |
| Mobile hook | `apps/mobile/hooks/` |
| Mobile store | `apps/mobile/stores/` |
| DB migration | `migrations/pg/` |
| Docker config | `docker/` |
| Documentation | `docs/` |

---

## The Rule

**If you're unsure where a file belongs, it probably doesn't belong there.**

Ask:
1. Who uses this file? (One app? Multiple apps? One module?)
2. Does it depend on frameworks or infrastructure?
3. Is it pure data definition or business logic?
4. Does it cross module boundaries?

Then consult this guide. If still unsure, ask before creating.
