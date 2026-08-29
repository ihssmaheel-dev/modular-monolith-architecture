# Frontend Rules

Stack, file placement, and patterns for `apps/web` (TanStack Start) and `apps/mobile` (Expo).

---

## Locked Frontend Stack

| Layer | Choice |
|-------|--------|
| Web Framework | TanStack Start 1 + Vite 8 (SSR + streaming + server functions) |
| Web Router | TanStack Router 1 file-based (generates `routeTree.gen.ts`) |
| Web State | Zustand 5 (persist) + TanStack Query 5 (server state) |
| Mobile Framework | Expo SDK 53 + expo-router 5 (file-based `app/`) |
| Mobile Styling | NativeWind 4 (Tailwind on RN) + tailwindcss 3.4 |
| Web Styling | Tailwind CSS 4 (`@tailwindcss/vite`) + `@repo/ui/globals.css` |
| UI System | `@repo/ui` — Base UI React 1 + shadcn base-nova + lucide-react + CVA + tw-animate-css |
| Forms | react-hook-form + @hookform/resolvers + Zod 4 schemas from `@repo/contracts` |
| i18n | react-i18next + i18next-browser-languagedetector (web) + expo-secure-store backed Zustand (mobile) |
| API | `@repo/api-client` `createApiClient(baseUrl, { getAccessToken, getLocale, getTenantId, onAuthRefreshed, onAuthFailure })` + `orpc` via `RPCLink` + `createTanstackQueryUtils` if needed |

No alternatives without architecture review (see `PACKAGE_POLICY.md`).

---

## Web (`apps/web`)

### Entry + Router

- `vite.config.ts`: `tanstackStart({ srcDirectory: 'src' }) + viteReact() + tailwindcss() + tsConfigPaths()`
- `src/router.tsx`: `createRouter({ routeTree, context: { queryClient }, defaultPreload: 'intent' })` + `setupRouterSsrQueryIntegration`
- `src/routeTree.gen.ts`: auto-generated — never hand-edit, committed so CI typechecks without Vite run
- `src/routes/__root.tsx`: `<html>` + `HeadContent` + `Scripts` + providers (`QueryProvider`, `I18nProvider`, `ThemeProvider`, `Toaster`). Imports `@repo/ui/globals.css` once.

### Routes

- File-based: every file under `src/routes/*.tsx` = route. Use `createFileRoute('/path')({ component })`
- Keep route files single-purpose (≤400 lines relaxed): parse params, call feature queries/mutations, render composed UI. If route mixes data + form + table logic, split into `src/features/[domain]/` components even when under 400
- Data: prefer `useQuery(notesListQuery(page,limit))` where query helper lives in `src/features/[domain]/*.queries.ts` (see `queryOptions` pattern), or `useMutation` + `queryClient.invalidateQueries`

### Stores (Zustand + persist)

- `src/stores/auth.store.ts`: `{ accessToken, refreshToken, user, setAuth, clearAuth }` persist `localStorage` (`auth-storage`)
- `src/stores/locale.store.ts`: `{ locale, setLocale }` persist `localStorage`
- `src/stores/tenant.store.ts`: `{ tenantId, setTenantId }` persist `localStorage` — `getApiClient` sends `x-tenant-id`
- Never store secrets other than JWTs (short-lived) in localStorage; httpOnly cookies are primary, Zustand is fallback for Bearer + optimistic UI

### Lib

- `src/lib/env.ts`: Zod `VITE_API_URL` from `import.meta.env` (fallback `http://localhost:3000/api`)
- `src/lib/api.ts`: `getApiClient()` singleton wrapping `createApiClient(env.VITE_API_URL, { getAccessToken, getLocale, getTenantId, onAuthRefreshed, onAuthFailure })`
- `src/lib/i18n.tsx`: `resources = { en: { translation: locales.en }, es, fr }` + `i18n.use(LanguageDetector).use(initReactI18next).init(...)` + `I18nProvider`
- `src/lib/query-client.tsx`: `QueryClient` singleton + `QueryProvider`

### Features

- `src/features/[domain]/*.queries.ts` and `*.mutations.ts` export `queryOptions`/`mutationOptions` — pages import them, don't inline fetch
- Validation: `useForm({ resolver: zodResolver(LoginSchema) })` where schema from `@repo/contracts`

### Styling + UI

- Primitives: `import { Button } from '@repo/ui/components/ui/button'` (or `@repo/ui/components/button` via backward-compat export) — all 61 primitives live in `packages/ui/src/components/ui/*`
- Composed: `import { DataTable } from '@repo/ui/components/composed/data-table'` — reusable composed components live in `packages/ui/src/components/composed/*` (DataTable, PageHeader, EmptyState, ConfirmDialog). Create new composed there by composing 3-6 primitives
- Tailwind via `globals.css` design tokens; use `cn()` from `@repo/ui/lib/utils` for conditional classes
- Theme via `src/components/theme-provider.tsx` (light/dark/system, localStorage, `matchMedia`, `d` key toggles)

---

## Mobile (`apps/mobile`)

### Entry + Navigation

- `app.json`: expo config `scheme: modular-monolith`, plugins `expo-router`, `expo-secure-store`, `experiments.typedRoutes: true`
- `metro.config.js`: `withNativeWind(config, { input: './global.css' })` + `watchFolders = [workspaceRoot]` + `resolver.nodeModulesPaths` for pnpm workspaces
- `tailwind.config.js`: `preset: nativewind/preset`, `content: ['./app/**/*', './src/**/*']`, colors mirrored from `globals.css` tokens
- `global.css`: single entry `@tailwind base; @tailwind components; @tailwind utilities;`
- `app/_layout.tsx`: `initI18n()` then `Stack` + `QueryClientProvider` + `StatusBar`
- `app/(tabs)/_layout.tsx`: `Tabs` (expo-router), `app/(tabs)/index.tsx` + `settings.tsx`
- Other screens: `app/auth.tsx`, `app/notes.tsx` etc. Navigation via `Link` + `router` from `expo-router`

### Stores

- Same shape as web but persistence via `expo-secure-store` adapter: `createJSONStorage(() => SecureStore adapter)`
- `auth.store.ts`, `locale.store.ts`, `tenant.store.ts` — all with SecureStore

### Lib

- `src/lib/env.ts`: `EXPO_PUBLIC_API_URL` from `process.env` + `expo-constants` extra
- `src/lib/api.ts`: same `getApiClient()` pattern as web but env `EXPO_PUBLIC_API_URL`
- `src/lib/i18n.ts`: `resources` from `@repo/i18n`, `initI18n()` reads `useLocaleStore.getState().locale`

### Styling

- NativeWind `className` (Tailwind). Do NOT import `@repo/ui` DOM components — use View/Text/Pressable + NativeWind
- Mirror tokens: keep `tailwind.config.js` colors in sync with `packages/ui/src/styles/globals.css` CSS variables

---

## Shared Rules

- Never `fetch` directly — use `getApiClient()` (which handles `accept-language`, `x-tenant-id`, `idempotency-key`, 401 refresh). For oRPC type-safe RPC, use `client.orpc` / `client.client` from the same factory via `RPCLink`.
- Pagination: always paginated, `page/limit/total/totalPages`. Default limit 20, max 100 (from `@repo/contracts`).
- Tenant: every authenticated request sends `x-tenant-id` via `useTenantStore`. Backend `TenantContextGuard` + `TenantScopedRepository` enforce isolation.
- Idempotency: `getApiClient` auto-adds `idempotency-key` for POST/PUT/PATCH/DELETE. Server `IdempotencyInterceptor` deduplicates.
- i18n: never hardcode user-facing text — use `const { t } = useTranslation()` and keys in `@repo/i18n` locales. Add keys to `en.json` first, copy to `es.json`/`fr.json`.
- File limits (relaxed, single-responsibility first): `route` ≤400, `store` ≤150, `query/mutation helper` ≤150, `lib` ≤200, `feature component` ≤300, `ui primitive` ≤500, `composed` ≤350. Split when file does 2 jobs, even if under limit.
- Env validation: web `VITE_API_URL` validated in `src/lib/env.ts` Zod, mobile `EXPO_PUBLIC_API_URL` in `src/lib/env.ts`. Api `DATABASE_URL` etc in `packages/contracts/src/schemas/env.schema.ts` + `apps/api/src/config/env.ts`.
- shadcn: add components via `pnpm dlx shadcn@latest add <name> -c apps/web` — it writes to `packages/ui/src/components/ui/<name>.tsx` per `components.json`.
- Composed: add reusable composed components (DataTable, PageHeader, EmptyState, ConfirmDialog) via `packages/ui/src/components/composed/<name>.tsx` by composing 3-6 primitives — never copy-paste primitives across routes.
- Base UI: components are `@base-ui/react` primitives wrapped with CVA. Follow shadcn base-nova preset patterns (see `packages/ui/src/components/ui/button.tsx` and `dialog.tsx`).
