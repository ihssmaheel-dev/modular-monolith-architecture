# Frontend Rules

Rules for `apps/web`, `apps/mobile`, and `packages/ui`.

---

## Web (`apps/web`)

### Stack
- React 19 + Vite
- TanStack Router (type-safe routing)
- TanStack Query (server state)
- Zustand (client state)
- React Hook Form + Zod (forms)
- Tailwind + shadcn/ui via `packages/ui`

### Rules

1. **All server state** goes through TanStack Query. No exceptions.
2. **Client state** goes through Zustand. No Redux, no MobX, no Jotai.
3. **Forms** use React Hook Form with Zod validation schemas from `packages/shared`.
4. **Routing** uses TanStack Router. No React Router.
5. **Components** are imported from `packages/ui` when available. Extend there, not here.
6. **API calls** go through `packages/api-client`. Never call fetch/axios directly.
7. **Styling** uses Tailwind. No inline styles, no CSS modules, no styled-components.
8. **No `any` types.** Use `unknown` if the type is unclear.
9. **Environment variables** use `import.meta.env.VITE_*` (Vite convention). Never `process.env`.
10. **All user-facing text** must use i18n via `useTranslation()` hook. Never hardcode strings.
11. **Translation keys** follow the structure in `I18N_RULES.md`. Import from `@repo/shared`.
12. **UI Access Gating** uses `<Can do="..." resource={...}>` from `@/components/shared/Can` and `useAuthorization()` / `usePermissions()` hooks.

### File Locations

| What | Where |
|------|-------|
| API client instance | `apps/web/src/lib/api.ts` |
| S3 presigned upload utility | `apps/web/src/lib/upload.ts` |
| TanStack Query client | `apps/web/src/lib/query-client.ts` |
| i18n initialization | `apps/web/src/lib/i18n/index.ts` |
| File upload hook | `apps/web/src/hooks/use-file-upload.ts` |
| Authorization hooks | `apps/web/src/hooks/use-authorization.ts`, `use-permissions.ts` |
| TanStack Query hooks | `apps/web/src/hooks/use-*.ts` |
| Auth store | `apps/web/src/stores/auth.store.ts` |
| Tenant store | `apps/web/src/stores/tenant.store.ts` |
| UI store | `apps/web/src/stores/ui.store.ts` |
| UI Permission Gate | `apps/web/src/components/shared/Can.tsx` |
| Upload components | `apps/web/src/components/features/` (not `packages/ui`) |

### Performance

- **Lazy-load routes** with `React.lazy()` + Suspense:
  ```typescript
  const Dashboard = lazy(() => import("./routes/dashboard"));
  ```
- **Memoize** expensive computations with `useMemo()`.
- **Stabilize callbacks** passed to memoized children with `useCallback()`.
- **Avoid unnecessary re-renders** — profile with React DevTools.
- **Don't put large objects in Zustand** if only one component needs them.
- **Configure TanStack Query caching:**
  ```typescript
  useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes
  });
  ```
- **Virtualize long lists** if rendering 100+ items.

---

## Mobile (`apps/mobile`)

### Stack
- Expo + Expo Router
- NativeWind
- TanStack Query
- Zustand
- Same Zod schemas from `packages/shared`

### Rules

1. **Never import `packages/ui`.** It is web-only. Mobile has different primitives.
2. **API calls** go through `packages/api-client`. Same client as web.
3. **Forms** use the same Zod schemas from `packages/shared`.
4. **Styling** uses NativeWind (Tailwind for React Native).
5. **Navigation** uses Expo Router. No React Navigation directly.
6. **State management** follows the same pattern: TanStack Query for server state, Zustand for client state.
7. **Environment variables** use Expo Constants, not `process.env`.
8. **All user-facing text** must use i18n via `useTranslation()` hook. Never hardcode strings.
9. **i18n initialization** must happen in root `_layout.tsx` before rendering any screens.

### Performance

- **Use `FlatList`** instead of `ScrollView` for long lists.
- **Set `getItemLayout`** for fixed-height items (skips measurement):
  ```typescript
  <FlatList
    getItemLayout={(_, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    })}
  />
  ```
- **Memoize list items** with `React.memo()`.
- **Avoid anonymous functions** in `renderItem`:
  ```typescript
  // Bad
  renderItem={({ item }) => <Item name={item.name} />}

  // Good
  const renderItem = useCallback(({ item }: { item: User }) => (
    <Item name={item.name} />
  ), []);
  ```
- **Lazy-load heavy screens** with dynamic imports.

---

## packages/ui (Web-Only)

### Purpose
- Shared web UI components built on shadcn/ui.
- Design tokens (colors, spacing, radius, typography).
- Web-only. Do not use in mobile.

### Rules

1. **Every component** must be generic and composable.
2. **No business logic** in UI components. Pure presentational.
3. **No API calls.** Components receive data via props.
4. **No state management.** Components are controlled.
5. **All components** use Tailwind for styling.
6. **Extend shadcn/ui.** Do not replace it.
7. **Exports** go through `packages/ui/src/index.ts`.
8. **Flat file structure** — one component per file in `components/`, no sub-folders.
9. **No upload utilities, hooks, or stores** — those belong in `apps/web/src/`.

---

## packages/email (Backend/Email-Only)

### Purpose
- Dedicated React Email component library used to generate HTML strings for the backend.
- Not a frontend application. It is exclusively for sending emails.

### Rules
1. **Never import UI components** from `packages/ui`. Email clients do not support standard web CSS.
2. **Use `react-email`** primitives (Html, Head, Body, Container, Tailwind).
3. **Use the `npm run dev` server** within `packages/email` to preview templates locally.
4. **Export templates** and a `render` function wrapper so the backend can consume them securely.

---

## Shared Visual Language

- Colors, spacing, radius, typography can be shared via `packages/shared` or `tailwind-config`.
- Mobile and web should look consistent but are not required to share component code.
- Design tokens are the bridge between platforms.

---

## API Consumption

Both web and mobile consume the backend through `packages/api-client`:

```typescript
import { createApiClient } from "@repo/api-client";

const api = createApiClient("http://localhost:3000");

// Type-safe API call
const result = await api.users.list({ query: { page: 1, limit: 10 } });
```

- Never use `fetch` or `axios` directly.
- Never hardcode API URLs in component files. Configure via environment or app config.
- Handle errors at the component level using TanStack Query error handling.

---

## Component Rules

- One component per file.
- File name matches component name.
- Co-locate styles, tests, and types with the component.
- Prefer composition over configuration props.
- Use TypeScript interfaces for component props.
- Export components as named exports.

```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
├── Card/
│   ├── Card.tsx
│   ├── Card.test.tsx
│   └── index.ts
└── index.ts
```
