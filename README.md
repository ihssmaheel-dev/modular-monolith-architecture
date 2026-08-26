# Modular Monolith Architecture

A production-grade, highly scalable TypeScript modular monolith architecture designed for enterprise-ready applications. Built with NestJS, Fastify, PostgreSQL, Drizzle ORM, TanStack Router & Query, Radix UI & Tailwind CSS v4, Fine-Grained Authorization (FGA), and full local observability.

---

## Tech Stack

- **Backend:** NestJS 11 + Fastify 5 + PostgreSQL 16 + Drizzle ORM + Redis 7 + BullMQ + oRPC
- **Frontend:** React 19 + Vite + TanStack Router + TanStack Query v5 + Radix UI + Tailwind CSS v4
- **Mobile:** React Native + Expo + NativeWind
- **Capability Packages:**
  - `@repo/contracts`: Zod 4 schemas, oRPC type-safe API contracts, DTO types, pagination & error constants
  - `@repo/authorization`: Fine-Grained Authorization engine (RBAC + ReBAC + ABAC) & action vocabulary
  - `@repo/i18n`: Multi-language JSON locale dictionaries (en, es, fr) & locale resolver
  - `@repo/design-tokens`: Theme color palettes, spacing, typography, and radius scales
  - `@repo/ui`: Headless accessible Radix UI component kit styled with Tailwind CSS v4
  - `@repo/api-client`: Type-safe client factory with oRPC and RPCLink
  - `@repo/email`: React Email templates with isolated HTML renderer
- **Observability:** Grafana + Prometheus + Loki + Promtail + Jaeger + Postgres & Redis Exporters
- **Documentation:** Interactive Scalar API Reference (`@scalar/fastify-api-reference`) & OpenAPI 3.1
- **Tooling & Monorepo:** Turborepo + pnpm workspaces + TypeScript 7 + Vitest 4

---

## Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Docker**: Docker Engine with Docker Compose v2.17+

---

## Quick Start

```bash
# 1. Install dependencies, configure env, start core services, migrate & seed DB, and build
pnpm bootstrap

# 2. Start all applications in development mode
pnpm dev
```

---

## Project Structure

```text
├── apps/
│   ├── api/             # NestJS Fastify backend (Modular Monolith + CQRS + FGA + Drizzle)
│   ├── web/             # React 19 frontend (TanStack Router + Query + Optimistic UI + Radix)
│   └── mobile/          # React Native Expo app (NativeWind + Expo Router)
├── packages/
│   ├── contracts/       # Zod 4 Schemas, oRPC API contracts, DTO types, and constants
│   ├── authorization/   # Pure FGA Evaluator (RBAC + ReBAC + ABAC) & Action Vocabulary
│   ├── i18n/            # Multi-language locale dictionaries (en, es, fr) & config
│   ├── design-tokens/   # Visual design tokens (colors, radius, typography, spacing)
│   ├── ui/              # Radix UI + Tailwind CSS v4 component kit (web)
│   ├── api-client/      # Type-safe API client (oRPC + TanStack Query)
│   ├── email/           # Email templates (React Email)
│   └── typescript-config/ # Base TypeScript configurations
├── scripts/             # Full-Stack Vertical Slice Generator (pnpm generate:feature)
├── docker/              # Docker Compose services & Observability configuration
└── ai_instructions/     # Architectural laws & guidelines
```

---

## Available Scripts

### Development & Apps
```bash
pnpm dev              # Start all apps concurrently
pnpm dev:api          # Build dependencies and start API (http://localhost:3000)
pnpm dev:web          # Build dependencies and start Web (http://localhost:5173)
pnpm dev:mobile       # Start Expo mobile app
```

### Full-Stack Vertical Slice Generator
```bash
# Automatically scaffolds all 7 layers (Contracts, Backend, Frontend, UI, Tests)
pnpm generate:feature <module> <feature>
```

### Build & Verification
```bash
pnpm build            # Build all packages & apps with Turborepo
pnpm lint             # Lint all workspaces
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm rules:check      # Enforce strict architectural boundaries and dependency-cruiser rules
```

### Testing
```bash
pnpm test             # Run test suite
pnpm test:unit        # Run unit tests across all packages
pnpm test:integration # Run repository & database integration tests
pnpm test:e2e         # Run end-to-end tests
```

### Database & Migrations (PostgreSQL + Drizzle ORM)
```bash
pnpm db:generate      # Generate SQL migrations from Drizzle schemas
pnpm db:migrate       # Apply pending migrations to PostgreSQL
pnpm db:migrate:status# Inspect migration status
pnpm db:seed          # Seed database with initial development data
pnpm db:studio        # Open Drizzle Studio database viewer
```

### Docker & Infrastructure
```bash
pnpm docker:up        # Start PostgreSQL, Redis, MinIO, Mailpit, pgAdmin
pnpm docker:down      # Stop core infrastructure
pnpm docker:logs      # View infrastructure logs
```

### Local Observability Stack (One-Command)
```bash
pnpm observability:up   # Start Grafana, Prometheus, Loki, Promtail, Jaeger, Exporters
pnpm observability:down # Stop observability stack
pnpm observability:logs # Tail telemetry logs
```

---

## Local Service Directory

| Service | Local URL / Port | Credentials / Purpose |
| :--- | :--- | :--- |
| **Web Application** | `http://localhost:5173` | React 19 Client |
| **API Backend** | `http://localhost:3000` | Fastify API Server |
| **Scalar API Reference** | `http://localhost:3000/api/docs` | Interactive OpenAPI 3.1 Docs |
| **Grafana Dashboard** | `http://localhost:3001` | `admin / admin` (API, DB, Redis metrics) |
| **Jaeger Trace Viewer** | `http://localhost:16686` | OpenTelemetry Distributed Traces |
| **Prometheus Metrics** | `http://localhost:9090` | Time-series Metrics Server |
| **Loki Log Engine** | `http://localhost:3100` | High-performance Log Aggregator |
| **Mailpit Web UI** | `http://localhost:8025` | Local SMTP Email Inbox (`:1025`) |
| **MinIO Console** | `http://localhost:9001` | `minioadmin / minioadmin` (S3: `:9000`) |
| **pgAdmin 4** | `http://localhost:5050` | `admin@example.com / admin` |

---

## Key Architectural Patterns

### 1. Clean Architecture & CQRS
Every domain module in `apps/api/src/modules/[domain]/` adheres to CQRS:
- **`presentation/`**: Thin Fastify controllers mapping input/output via `@repo/contracts`.
- **`application/`**: Single-responsibility `commands/`, `queries/`, and domain event `listeners/`. All return `neverthrow` `Result<T, E>`.
- **`domain/`**: Pure `entities/`, `value-objects/`, `events/`, and domain `errors/`.
- **`infrastructure/`**: Drizzle table schemas and repositories.

### 2. Fine-Grained Authorization (FGA)
Unified **RBAC + ReBAC + ABAC** engine:
- **Action Vocabulary**: Granular permissions (e.g., `notes:create`, `team:invite`, `billing:manage`).
- **Relationship-Based Access Control**: Resource ownership (`resource.ownerId === principal.id`).
- **Attribute-Based Access Control**: Dynamic policy predicates (tenant scoping, department matching).
- **Backend Protection**: Controller `@RequirePermission('notes:create')` and application `AuthorizationService.check(...)`.
- **Frontend Gating**: Declarative `<Can do="notes:update" resource={note}><EditButton /></Can>` and `useAuthorization()` hooks.

### 3. Optimistic UI & Offline Persistence
- **0ms Immediate UI**: `useOptimisticMutation` provides instant mutation feedback with automatic cache snapshotting and rollback on network failure.
- **24-Hour Offline Cache**: Persists query cache to `localStorage` using `@tanstack/react-query-persist-client`.
- **Tenant-Safe Cache Purging**: Automatically purges in-memory and persisted query caches on `logout()` and `selectTenant()` to prevent cross-session and cross-tenant data leaks.

### 4. Headless Component Kit (`@repo/ui`)
Accessible, composable UI primitives powered by Radix UI and Tailwind CSS v4:
- Modal Dialogs, Dropdown Menus, Popovers, Tooltips, Tabs, Accordions, Date/DateRange Pickers, Comboboxes, Multi-Select Tagged Dropdowns, and TanStack Data Tables.

### 5. Dynamic shadcn Theming & Precision Typography
- **1-Click Theme Re-skinning**: 100% compatible with presets generated at [ui.shadcn.com/create](https://ui.shadcn.com/create) and [ui.shadcn.com/themes](https://ui.shadcn.com/themes) via modern Tailwind v4 `@theme inline`.
- **Proportional Radius Engine**: Single master `--radius` CSS variable dynamically scales `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` across all 27+ UI components.
- **Zero-Latency Typography**: Self-hosted **Geist & Geist Mono** via `@fontsource-variable/*` (0 external CDN requests, 100% offline & air-gapped compliant).
- **Cross-Platform Parity**: Unified tokens synchronized across Web (`apps/web/src/index.css`) and Mobile (`apps/mobile/global.css`).

---

## Health Checks

- **Liveness:** `GET /api/health/live`
- **Readiness:** `GET /api/health/ready`
- **Prometheus Metrics:** `GET /metrics`

---

## License

MIT
