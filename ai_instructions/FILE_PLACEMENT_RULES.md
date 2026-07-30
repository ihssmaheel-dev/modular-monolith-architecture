# File Placement Rules

Where to create new files in this codebase. Every file must land in the correct location on first creation. Moving files later is waste.

---

## Decision Tree

Before creating any file, answer these questions in order:

1. **Is it shared across apps?** → `packages/`
2. **Is it a UI component?** → `packages/ui/src/components/`
3. **Is it a Zod schema, type, or contract?** → `packages/shared/src/`
4. **Is it backend infrastructure?** → `apps/api/src/infrastructure/`
5. **Is it a backend module?** → `apps/api/src/modules/[domain]/`
6. **Is it web frontend?** → `apps/web/src/`
7. **Is it mobile?** → `apps/mobile/`
8. **Is it config or docs?** → Root level

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

## packages/shared/

Single source of truth for schemas, types, contracts, constants, permissions, utils, and i18n translations.

```
packages/shared/src/
├── schemas/
│   ├── env.schema.ts          ← Environment variable schema
│   ├── users.schema.ts        ← User-related Zod schemas
│   └── index.ts               ← Re-exports all schemas
├── contracts/
│   ├── users.contract.ts      ← ts-rest contract for users API
│   └── index.ts
├── types/
│   ├── user.types.ts          ← Shared TypeScript types
│   └── index.ts
├── constants/
│   ├── errors.ts              ← Error code constants
│   └── index.ts
├── permissions/
│   ├── users.permissions.ts   ← Permission definitions
│   └── index.ts
├── utils/
│   ├── date.ts                ← Pure utility functions
│   └── index.ts
├── i18n/
│   ├── locales/
│   │   ├── en.json            ← English translations
│   │   ├── es.json            ← Spanish translations
│   │   └── fr.json            ← French translations
│   └── index.ts               ← i18n config and exports
└── index.ts                   ← Main barrel export
```

### Rules
- Every subfolder must have an `index.ts` barrel export.
- Schema file name matches domain: `users.schema.ts` for user schemas.
- Contract file name matches domain: `users.contract.ts` for user API contract.
- Types file name matches domain: `user.types.ts` for user types.
- No business logic. Pure data definitions only.
- If a type or schema is used by only one module, it still belongs here if it crosses module boundaries.

---

## packages/ui/

Web-only UI components. Never used by mobile.

```
packages/ui/src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Card/
│   │   ├── Card.tsx
│   │   └── index.ts
│   └── index.ts              ← Main barrel export
├── lib/
│   └── utils.ts              ← cn() helper, etc.
└── index.ts
```

### Rules
- One component per folder.
- Component file matches folder name: `Button/Button.tsx`.
- Co-locate tests with component.
- Export through `packages/ui/src/index.ts`.
- No business logic, no API calls, no state management.

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
- Uses ts-rest contracts from `packages/shared`.

---

## apps/api/src/

### Config Files

```
apps/api/src/config/
├── env.ts                     ← Environment loader (uses Zod schema from shared)
```

### Rules
- Only `env.ts` goes here.
- Uses `envSchema.safeParse(process.env)` from `@repo/shared`.
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
└── pipes/
    ├── validation.pipe.ts     ← Zod validation pipe
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
│   ├── database.module.ts     ← Mongoose connection
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
        │   ├── [domain].mongoose-schema.ts
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
│   └── utils.ts               ← cn() helper, etc.
├── routes/
│   ├── __root.tsx             ← Root layout (TanStack Router)
│   ├── index.tsx              ← Home page
│   ├── users/
│   │   ├── index.tsx          ← Users list page
│   │   └── $userId.tsx        ← User detail page
│   └── _authenticated.tsx     ← Layout wrapper for auth
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   └── features/
│       ├── users/
│       │   ├── UserCard.tsx
│       │   └── index.ts
│       └── index.ts
├── hooks/
│   ├── useUsers.ts            ← TanStack Query hooks
│   └── index.ts
├── stores/
│   ├── auth.store.ts          ← Zustand stores
│   └── index.ts
└── types/
    └── index.ts
```

### Rules
- Routes follow TanStack Router file conventions.
- Components are presentational or container (thin).
- Hooks wrap TanStack Query for server state.
- Zustand stores for client state only.
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
- Same Zod schemas from `packages/shared`.
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
├── 20240101000000-create-users.ts
├── 20240102000000-add-email-index.ts
└── migrate-mongo-config.ts
```

### Rules
- Timestamp prefix: `YYYYMMDDHHMMSS-`.
- Descriptive name: `create-[table]`, `add-[field]-index`.
- One migration per schema change.
- Every index must be in a migration.

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
| Zod schema in module folder | `packages/shared/src/schemas/` |
| Type definition in component file | `packages/shared/src/types/` or nearest `types/` folder |
| API call with `fetch()` | `packages/api-client` |
| `process.env` outside `config/env.ts` | `config/env.ts` only |
| Business logic in controller | `application/` command/query layer |
| Business logic in repository | `domain/` entity or value object |
| Mongoose import in domain layer | `infrastructure/` layer only |
| Test file far from source | Co-locate with source file |
| Utility in random location | `packages/shared/src/utils/` or nearest `lib/` |
| Component in routes folder | `components/` folder |
| Store in components folder | `stores/` folder |
| Hook in components folder | `hooks/` folder |

---

## Quick Reference

| What You're Creating | Where It Goes |
|---------------------|---------------|
| Zod schema | `packages/shared/src/schemas/[domain].schema.ts` |
| TypeScript type | `packages/shared/src/types/[domain].types.ts` |
| ts-rest contract | `packages/shared/src/contracts/[domain].contract.ts` |
| Shared constant | `packages/shared/src/constants/[category].ts` |
| Permission | `packages/shared/src/permissions/[domain].permissions.ts` |
| Pure utility | `packages/shared/src/utils/[name].ts` |
| i18n translations | `packages/shared/src/i18n/locales/[locale].json` |
| UI component | `packages/ui/src/components/[Name]/[Name].tsx` |
| API client helper | `packages/api-client/src/` |
| Env config | `apps/api/src/config/env.ts` |
| Exception filter | `apps/api/src/common/filters/` |
| Auth guard | `apps/api/src/common/guards/` |
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
| Mongoose schema | `apps/api/src/modules/[domain]/infrastructure/schemas/` |
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
| DB migration | `migrations/YYYYMMDDHHMMSS-[name].ts` |
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
