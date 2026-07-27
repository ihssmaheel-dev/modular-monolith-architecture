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

---

## Shared Visual Language

- Colors, spacing, radius, typography can be shared via `packages/shared` or `tailwind-config`.
- Mobile and web should look consistent but are not required to share component code.
- Design tokens are the bridge between platforms.

---

## API Consumption

Both web and mobile consume the backend through `packages/api-client`:

```typescript
import { apiClient } from '@repo/api-client';
import { contract } from '@repo/shared';

// Type-safe API call
const result = await apiClient.users.list({});
```

- Never use `fetch` or `axios` directly.
- Never hardcode API URLs. Use the client configuration.
- Handle errors at the component level using the `Result` from neverthrow (if using client-side Result handling) or TanStack Query error handling.

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
