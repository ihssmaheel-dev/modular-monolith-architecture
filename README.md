# Modular Monolith Architecture

A production-ready modular monolith built with NestJS, featuring clean architecture, CQRS pattern, and type-safe APIs.

## Tech Stack

- **Backend:** NestJS 11 + Fastify 5 + Postgres 16 + Drizzle ORM + Redis/BullMQ + oRPC
- **Frontend:** React 19 + Vite + TanStack Router + TanStack Query + Tailwind CSS 4
- **Mobile:** React Native + Expo + NativeWind
- **Shared:** TypeScript 5.5 + Zod 4 Standard Schemas + oRPC Contracts + Unified FGA Engine
- **Documentation:** Interactive Scalar API Reference (@scalar/fastify-api-reference)
- **Infrastructure:** Docker + Turborepo + pnpm workspaces

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker with Compose v2.17+

## Quick Start

```bash
# Install, configure, start infrastructure, migrate, and build
pnpm bootstrap

# Start the applications
pnpm dev
```

See the [developer bootstrap guide](./docs/DEVELOPMENT.md) for focused app commands and local service URLs.

## Project Structure

```
├── apps/
│   ├── api/          # NestJS backend (Modular Monolith + CQRS + FGA)
│   ├── web/          # React frontend (TanStack Router + Query + <Can>)
│   └── mobile/       # React Native Expo app
├── packages/
│   ├── shared/       # Shared schemas, types, contracts, authorization evaluator
│   ├── ui/           # Shared UI components (web)
│   ├── api-client/   # Type-safe API client (oRPC + TanStack Query)
│   ├── email/        # Email templates (React Email)
│   └── eslint-config/ # Shared ESLint config
├── scripts/          # Full-Stack Vertical Slice Generator (pnpm generate:feature)
├── docker/           # Docker Compose files
└── ai_instructions/  # Mandatory Architecture rules
```

## Available Scripts

```bash
# Development
pnpm dev              # Start all apps
pnpm dev:api          # Start API only (port 4000)
pnpm dev:web          # Start web only (port 5173)

# Full-Stack Vertical Slice Generator
pnpm generate:feature <module> <feature>  # Scaffolds all 7 layers automatically

# Build
pnpm build            # Build all packages

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests only
pnpm test:e2e         # E2E tests only

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database

# Code Quality & Architecture
pnpm lint             # Lint all packages
pnpm format:check     # Verify formatting
pnpm rules:check      # Enforce strict architecture rules

# Docker
pnpm docker:up        # Start infrastructure
pnpm docker:down      # Stop infrastructure
```

## Interactive API Documentation (Scalar)

When running the API in development mode, the interactive **Scalar API Reference** is available at:

```
http://localhost:4000/api/docs
```

- Live interactive request testing ("Try It Out").
- Multi-language SDK code generation (TypeScript, Python, cURL, Go, Ruby, Java, Swift).
- Raw OpenAPI 3.1 specifications available at `/api/docs/openapi.json` and `/api/docs/openapi.yaml`.

## Fine-Grained Authorization (FGA)

The architecture includes a unified hybrid authorization engine:
- **RBAC**: Action vocabulary strings (`notes:create`, `team:invite`, `billing:manage`) with role bundling.
- **ReBAC**: Relationship & ownership checks (`user → owner → resource`).
- **ABAC**: Declarative policy predicates (tenant boundaries, department matching, amount limits).
- **Backend Guard**: `@RequirePermission('notes:create')` and `AuthorizationService.check({ principal, action, resource, context })`.
- **Frontend Gating**: `<Can do="notes:update" resource={note}><EditButton /></Can>`.

## Health Checks

- **Liveness:** `GET /api/health/live`
- **Readiness:** `GET /api/health/ready`

## Architecture

This project follows **Clean Architecture** with **CQRS pattern**:

- **Presentation:** Controllers, resolvers, mappers, `@RequirePermission` guards
- **Application:** Commands, queries, handlers, domain policies, event listeners
- **Domain:** Entities, value objects, domain events, domain errors
- **Infrastructure:** Repositories, database service, external adapters

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## License

MIT

