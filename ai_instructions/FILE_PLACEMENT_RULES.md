# File Placement Rules

Where to create new files in this codebase. Every file must land in the correct location on first creation. Moving files later is waste.

---

## Decision Tree

Before creating any file, answer these questions in order:

1. **Is it a shared contract, Zod schema, or DTO?** → `packages/contracts/src/`
2. **Is it authorization rules, permissions, or evaluator?** → `packages/authorization/src/`
3. **Is it translations or locale definitions?** → `packages/i18n/src/`
4. **Is it API client factory/methods?** → `packages/api-client/src/`
5. **Is it transactional email templates?** → `packages/email/src/`
6. **Is it a shared UI primitive, component, hook, or Tailwind token?** → `packages/ui/src/`
7. **Is it backend cross-cutting infrastructure?** → `apps/api/src/infrastructure/`
8. **Is it a backend domain module?** → `apps/api/src/modules/[domain]/`
9. **Is it frontend web — route, feature, store, or lib?** → `apps/web/src/`
10. **Is it frontend mobile — screen, navigation, store, or lib?** → `apps/mobile/app/` or `apps/mobile/src/`
11. **Is it config or docs?** → Root level or `docs/`

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

Focused capability packages: `@repo/contracts`, `@repo/authorization`, `@repo/i18n`, `@repo/api-client`, `@repo/email`, `@repo/ui`, `@repo/typescript-config`.

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

### 4. `@repo/email` (`packages/email/src/`)
- Templates (`templates/*.tsx`): React Email transactional templates

### 5. `@repo/ui` (`packages/ui/src/`)
- Components (`components/*.tsx`): Base UI + shadcn primitives (button, dialog, card, etc), one family per file ≤250 lines
- Styles (`styles/globals.css`): Single Tailwind 4 entry with `@import "tailwindcss"` + design tokens + `@source` for `apps/web` + `packages/ui`
- Hooks (`hooks/*.ts`): Headless helpers (use-mobile)
- Lib (`lib/utils.ts`): `cn()` via `clsx` + `tailwind-merge`
- Config (`components.json`): shadcn registry config (style base-nova, icons lucide, Tailwind 4, aliases `@repo/ui/*`)
- **No business logic. No `fetch`, no Zustand, no i18n. Pure presentational primitives.**

### Rules
- UI primitives are unstyled Base UI (`@base-ui/react`) wrapped with CVA + Tailwind. shadcn CLI adds via `pnpm dlx shadcn@latest add <component> -c apps/web`.
- `globals.css` is consumed by web via `import '@repo/ui/globals.css'` in `apps/web/src/routes/__root.tsx` (also imported once per app).
- Mobile does NOT import `packages/ui` directly (React Native). It uses `nativewind` + shared tokens mirrored in `apps/mobile/tailwind.config.js`.

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
└── users.controller.e2e.test.ts           ← E2E test
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

## Frontend Apps

### 6. `apps/web` — TanStack Start (SSR + SPA)

```
apps/web/
├── vite.config.ts              ← tanstackStart() + viteReact() + tailwindcss() + tsConfigPaths()
├── components.json             ← shadcn config (RSC true, style base-nova, Tailwind 4, aliases @/* + @repo/ui)
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── src/
│   ├── router.tsx              ← createRouter() + routeTree + SSR Query integration
│   ├── routeTree.gen.ts        ← Generated by @tanstack/router-plugin (do not hand-edit)
│   ├── routes/
│   │   ├── __root.tsx          ← <html>, HeadContent, Scripts, ThemeProvider, QueryProvider, I18nProvider, Toaster
│   │   ├── index.tsx           ← Landing page (shadcn + @repo/ui)
│   │   ├── auth.tsx            ← Auth flow (react-hook-form + zodResolver + TanStack Mutation + @repo/api-client)
│   │   ├── dashboard.tsx       ← Protected dashboard (TanStack Query + Zustand auth)
│   │   └── notes.tsx           ← Notes vertical slice (useQuery + mutation, invalidation)
│   ├── components/
│   │   └── theme-provider.tsx  ← Light/dark/system via localStorage + matchMedia (d press toggles)
│   ├── lib/
│   │   ├── env.ts              ← Zod env for VITE_API_URL (import.meta.env)
│   │   ├── api.ts              ← getApiClient(): createApiClient(VITE_API_URL, { getAccessToken, getLocale, getTenantId, onAuthRefreshed/onAuthFailure })
│   │   ├── i18n.tsx            ← initReactI18next with @repo/i18n resources (en/es/fr) + browserLanguageDetector
│   │   └── query-client.tsx    ← QueryClient + QueryClientProvider
│   ├── stores/
│   │   ├── auth.store.ts       ← zustand + persist (localStorage) { accessToken, refreshToken, user }
│   │   ├── locale.store.ts     ← locale (persist)
│   │   └── tenant.store.ts     ← tenantId (persist, sends x-tenant-id)
│   ├── hooks/
│   │   └── use-auth.ts
│   └── features/
│       ├── auth/auth.mutations.ts   ← login/register mutationOptions
│       └── notes/notes.queries.ts   ← notesListQuery/notesByIdQuery (queryOptions)
```

### Rules
- Routes are **file-based** via TanStack Router. Add via new file in `src/routes/`. `routeTree.gen.ts` is auto-generated.
- Never `fetch` in components directly — use `getApiClient()` or the `orpc` client via `createTanstackQueryUtils` if you need type-safe RPC.
- Forms: `react-hook-form` + `@hookform/resolvers/zod` + `@repo/contracts` schemas (LoginSchema, RegisterSchema, CreateNoteSchema).
- Auth: Zustand stores `accessToken/refreshToken/user` (persist localStorage). `getApiClient` wires refresh via `requestRefresh` + `onAuthFailure` -> redirect `/auth`.
- Tenant: `useTenantStore.tenantId` automatically sent as `x-tenant-id` via api-client.
- i18n: `useTranslation()` via `react-i18next`; keys from `@repo/i18n` (`common.*`, `auth.*`, `dashboard.*`, `notes.*`). See `I18N_RULES.md`.
- Styling: Use `@repo/ui` components (`Button`, `Card`, `Input`, `Tabs`, `Badge`, etc) + `cn()` + Tailwind 4. No custom CSS libraries beyond Tailwind.

### 7. `apps/mobile` — Expo + NativeWind

```
apps/mobile/
├── app.json                    ← Expo config (name, slug, scheme modular-monolith, plugins: expo-router, expo-secure-store)
├── metro.config.js             ← withNativeWind + watchFolders = workspaceRoot + nodeModulesPaths
├── tailwind.config.js          ← NativeWind preset v4, content: app/** + src/**, colors mirrored from globals.css
├── global.css                  ← @tailwind base/components/utilities (single entry)
├── babel.config.js             ← babel-preset-expo + nativewind/babel + expo-router/babel + reanimated
├── tsconfig.json               ← extends expo/tsconfig.base, paths @/* -> src/*
├── app/
│   ├── _layout.tsx             ← Stack + QueryClientProvider + I18nProvider (initI18n)
│   ├── index.tsx               ← Landing (NativeWind + expo-router Link)
│   ├── auth.tsx                ← Auth + SecureStore backed Zustand
│   ├── notes.tsx               ← Notes slice (FlatList + refreshControl)
│   └── (tabs)/
│       ├── _layout.tsx         ← Tabs layout
│       ├── index.tsx           ← Dashboard tab
│       └── settings.tsx        ← Settings + locale switch + logout
└── src/
    ├── lib/
    │   ├── env.ts              ← Zod for EXPO_PUBLIC_API_URL (expo-constants + process.env)
    │   ├── api.ts              ← createApiClient(EXPO_PUBLIC_API_URL, { getAccessToken, getLocale, getTenantId })
    │   └── i18n.ts             ← initI18n with @repo/i18n resources + SecureStore locale
    └── stores/
        ├── auth.store.ts       ← zustand + persist + expo-secure-store { accessToken, refreshToken, user }
        ├── locale.store.ts     ← locale persist SecureStore
        └── tenant.store.ts     ← tenantId persist SecureStore
```

### Rules
- Entry is `expo-router/entry`. Routes are file-based via `app/` (Link, Stack, Tabs, router).
- Styling is NativeWind 4 (`className` via nativewind). Do not import `@repo/ui` components (DOM-only). Mirror design tokens from `packages/ui/src/styles/globals.css` into `tailwind.config.js`.
- Auth tokens in `expo-secure-store` via Zustand persist (createJSONStorage -> SecureStore adapter).
- Same `getApiClient()` pattern as web, but env is `EXPO_PUBLIC_API_URL`.
- i18n shares same `locales/*.json` via `@repo/i18n`; mobile uses SecureStore persistence, web uses localStorage.

## Docs

```
docs/
├── ARCHITECTURE.md             ← Architecture overview
├── ARCHITECTURE_DEEP_DIVE.md   ← Plain-English guide
├── DATABASE.md                 ← Database guide
├── DEVELOPMENT.md              ← Dev setup guide
├── ENVIRONMENT.md              ← Environment variables (api + web + mobile)
├── NEW_MODULE.md               ← Module creation guide
├── TENANCY.md                  ← Multi-tenancy architecture
├── FRONTEND.md                 ← Web (TanStack Start) + Mobile (Expo) + UI system guide
└── TENANCY.md                  ← Multi-tenancy architecture
```

### Rules
- Docs are living. Update when architecture changes.
- No auto-generated docs in this folder.

---

## Common Mistakes

| Mistake | Correct Location |
|---------|-----------------|
| Zod schema in module folder | `packages/contracts/src/schemas/` |
| Type definition in controller file | `packages/contracts/src/types/` |
| API call with `fetch()` | `packages/api-client` |
| `process.env` outside `config/env.ts` | `config/env.ts` only |
| Business logic in controller | `application/` command/query layer |
| Business logic in repository | `domain/` entity or value object |
| ORM/DB driver in domain layer | `infrastructure/` layer only |
| Test file far from source | Co-locate with source file |
| Utility in random location | `packages/contracts/src/` or nearest `lib/` |
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
| Email template | `packages/email/src/templates/[name].tsx` |
| UI primitive | `packages/ui/src/components/[name].tsx` |
| UI style | `packages/ui/src/styles/globals.css` |
| UI hook | `packages/ui/src/hooks/[name].ts` |
| UI lib | `packages/ui/src/lib/[name].ts` |
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
| Web route | `apps/web/src/routes/[name].tsx` (TanStack Router file-based) |
| Web feature | `apps/web/src/features/[domain]/*.ts` |
| Web store | `apps/web/src/stores/[name].store.ts` (zustand + persist localStorage) |
| Web lib | `apps/web/src/lib/[name].ts` (api.ts, i18n.tsx, query-client.tsx, env.ts) |
| Web component | `apps/web/src/components/[name].tsx` (theme-provider, etc) |
| Mobile screen | `apps/mobile/app/[name].tsx` (+ (tabs)/ for Tabs) |
| Mobile lib | `apps/mobile/src/lib/[name].ts` (api.ts, i18n.ts, env.ts) |
| Mobile store | `apps/mobile/src/stores/[name].store.ts` (zustand + SecureStore) |
| Mobile component | `apps/mobile/src/components/[name].tsx` (native) |
| DB migration | `migrations/pg/` |
| Docker config | `docker/` |
| Documentation | `docs/` |

---

## The Rule

**If you're unsure where a file belongs, it probably doesn't belong there.**

Ask:
1. Who uses this file? (One app? Multiple packages? One module?)
2. Does it depend on frameworks or infrastructure?
3. Is it pure data definition or business logic?
4. Does it cross module boundaries?

Then consult this guide. If still unsure, ask before creating.
