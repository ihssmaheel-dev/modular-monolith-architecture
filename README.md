# Modular Monolith Architecture

A production-grade, highly scalable TypeScript modular monolith architecture designed for enterprise-ready applications. Built with NestJS, Fastify, PostgreSQL, Drizzle ORM, oRPC, Fine-Grained Authorization (FGA), transactional outbox pattern, distributed caching, and full local observability.

---

## Tech Stack

- **Backend:** NestJS 11 + Fastify 5 + PostgreSQL 16 + Drizzle ORM + Redis 7 + BullMQ + oRPC
- **Capability Packages:**
  - `@repo/contracts`: Zod 4 schemas, oRPC type-safe API contracts, DTO types, pagination & error constants
  - `@repo/authorization`: Fine-Grained Authorization engine (RBAC + ReBAC + ABAC) & action vocabulary
  - `@repo/i18n`: Multi-language JSON locale dictionaries (en, es, fr) & locale resolver
  - `@repo/api-client`: Type-safe client factory with oRPC and RPCLink
  - `@repo/email`: React Email templates with isolated HTML renderer
  - `@repo/typescript-config`: Centralized TypeScript configurations
- **Observability:** Grafana + Prometheus + Loki + Promtail + Jaeger + Postgres & Redis Exporters
- **Documentation:** Interactive Scalar API Reference (`@scalar/fastify-api-reference`) & OpenAPI 3.1
- **Tooling & Monorepo:** Turborepo + pnpm workspaces + TypeScript 5.8 + Vitest 4

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

# 2. Start API in development mode
pnpm dev
```

---

## Project Structure

```text
├── apps/
│   └── api/             # NestJS Fastify backend (Modular Monolith + CQRS + FGA + Drizzle)
├── packages/
│   ├── contracts/       # Zod 4 Schemas, oRPC API contracts, DTO types, and constants
│   ├── authorization/   # Pure FGA Evaluator (RBAC + ReBAC + ABAC) & Action Vocabulary
│   ├── i18n/            # Multi-language locale dictionaries (en, es, fr) & config
│   ├── api-client/      # Type-safe API client (oRPC + TanStack Query)
│   ├── email/           # Email templates (React Email)
│   └── typescript-config/ # Base TypeScript configurations
├── scripts/             # Full-Stack Vertical Slice Generator (pnpm generate:feature)
├── docker/              # Docker Compose services & Observability configuration
└── ai_instructions/     # Architectural laws & guidelines
```

---

## Available Scripts

### Development & API

```bash
pnpm dev              # Start all packages in development mode
pnpm dev:api          # Build dependencies and start API (http://localhost:3000)
pnpm dev:api:debug    # Start API with Node inspector on port 9229
```

### Full-Stack Vertical Slice Generator

```bash
# Automatically scaffolds all domain layers (Contracts, CQRS, Drizzle, API Client, Tests)
pnpm generate:feature <module> <feature>
```

### Build & Verification

```bash
pnpm build            # Build all packages & apps with Turborepo
pnpm lint             # Lint all workspaces
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm typecheck        # Run TypeScript type check across all workspaces
pnpm rules:check      # Enforce strict architectural boundaries and dependency rules
```

### Testing

```bash
pnpm test             # Run test suite
pnpm test:unit        # Run unit tests across all packages
pnpm test:integration # Run repository & database integration tests
pnpm test:e2e         # Run end-to-end tests
pnpm test:api:watch   # Run API unit tests in watch mode
```

### Database & Migrations (PostgreSQL + Drizzle ORM)

```bash
pnpm db:generate      # Generate SQL migrations from Drizzle schemas
pnpm db:migrate       # Apply pending migrations to PostgreSQL
pnpm db:migrate:status# Inspect migration status
pnpm db:migrate:dev   # Push schema changes directly during development
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

| Service                  | Local URL / Port                 | Credentials / Purpose                    |
| :----------------------- | :------------------------------- | :--------------------------------------- |
| **API Backend**          | `http://localhost:3000`          | Fastify API Server                       |
| **Scalar API Reference** | `http://localhost:3000/api/docs` | Interactive OpenAPI 3.1 Docs             |
| **Grafana Dashboard**    | `http://localhost:3001`          | `admin / admin` (API, DB, Redis metrics) |
| **Jaeger Trace Viewer**  | `http://localhost:16686`         | OpenTelemetry Distributed Traces         |
| **Prometheus Metrics**   | `http://localhost:9090`          | Time-series Metrics Server               |
| **Loki Log Engine**      | `http://localhost:3100`          | High-performance Log Aggregator          |
| **Mailpit Web UI**       | `http://localhost:8025`          | Local SMTP Email Inbox (`:1025`)         |
| **MinIO Console**        | `http://localhost:9001`          | `minioadmin / minioadmin` (S3: `:9000`)  |
| **pgAdmin 4**            | `http://localhost:5050`          | `admin@example.com / admin`              |

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

### 3. Transactional Outbox & Resilient Async Events

- **Guaranteed Event Publishing**: Changes to domain entities and their outgoing domain events are written in the same PostgreSQL transaction.
- **Background Outbox Relay**: An asynchronous worker polls and processes pending events via Redis Streams and BullMQ queues with automatic retries and dead-letter handling.

### 4. Zero-Trust Multi-Tenancy

- **Dynamic Mode**: Supports both single-tenant and cloud multi-tenant execution modes via `TENANCY_MODE`.
- **Tenant Context Isolation**: `TenantContextGuard` and `TenantScopedRepository` enforce row-level tenant boundary isolation automatically across all database operations.

---

## Health Checks

- **Liveness:** `GET /api/health/live`
- **Readiness:** `GET /api/health/ready`
- **Prometheus Metrics:** `GET /metrics`

---

## License

MIT
