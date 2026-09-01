# Frontend Architecture — Web and Shared Packages

The repository currently ships one browser client (`apps/web`) backed by the modular-monolith API. Additional client platforms can be introduced later after the API, contracts, web application, and shared packages are hardened.

## System map

- `apps/web` — TanStack Start, TanStack Router, TanStack Query, Zustand, i18n, and the shared UI system.
- `packages/contracts` — Zod schemas, DTOs, oRPC contracts, pagination, and error constants.
- `packages/api-client` — typed REST compatibility clients and oRPC/TanStack Query utilities with auth refresh, tenant, locale, and idempotency headers.
- `packages/i18n` — locale dictionaries and shared locale configuration.
- `packages/ui` — Base UI/shadcn primitives, Tailwind tokens, and composed components.

## Web — `apps/web`

**Stack:** Vite 8 + TanStack Start 1 + TanStack Router 1 (file-based SSR) + TanStack Query 5 + Zustand 5 + react-i18next + Tailwind 4 + `@repo/ui` + react-hook-form + Zod 4.

### Commands

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start
pnpm --filter web typecheck
```

`start` runs the built SSR handler with the static client bundle on port `3000` (`PORT` can override it).
It is independent of the API process, but requires a valid `VITE_API_URL` at build time and runtime so it can
reach the separately deployed API.

### Structure

```
apps/web/
  vite.config.ts
  components.json
  src/
    router.tsx
    routeTree.gen.ts       # generated; never hand-edit
    routes/                # thin file-based routes
    components/            # app-level components/providers
    features/              # query and mutation helpers by domain
    stores/                # auth, locale, and tenant state
    hooks/
    lib/                   # env, API client, i18n, query client
```

### Invariants

- Routes parse params and compose feature helpers; they do not contain API calls or business rules.
- Forms use Zod schemas imported from `@repo/contracts` through `zodResolver`.
- API access goes through `getApiClient()`; direct `fetch` is prohibited.
- Tenant-scoped query keys include the active tenant ID. Logout and tenant switches clear affected cached data.
- Error displays use stable error codes and i18n keys; raw response bodies and exception text never reach users.
- Authentication prefers httpOnly cookies, with short-lived Bearer tokens as a fallback.
- `VITE_API_URL` is validated in `src/lib/env.ts`.

### Public links and authentication handoff

Public browser destinations are defined once in `@repo/contracts` as
`FRONTEND_ROUTES`. The API uses `buildFrontendUrl` for password-reset, welcome,
and organization-invitation emails, so links remain valid when route structure
changes. The invitation destination is `/accept-invitation`; it validates the
token, asks the recipient to sign in when necessary, and returns to the
invitation after login or registration. Email listener tests assert the emitted
paths and encoded token query values as link smoke tests.

## Shared UI

Use primitives from `@repo/ui/components/ui/*` and composed components from `@repo/ui/components/composed/*`. Keep tokens in `packages/ui/src/styles/globals.css`; import that stylesheet once from the web root. Add new primitives through the shadcn CLI configured by `apps/web/components.json`.

## Adding a web feature

1. Add or update schemas/contracts in `packages/contracts`.
2. Add the typed API client subclient in `packages/api-client`.
3. Add query/mutation helpers under `apps/web/src/features/[domain]`.
4. Add a thin route under `apps/web/src/routes`.
5. Add locale keys to `packages/i18n/src/locales/en.json`, `es.json`, and `fr.json`.
6. Run `pnpm rules:check`, `pnpm lint`, `pnpm typecheck`, and `pnpm --filter web build`.
