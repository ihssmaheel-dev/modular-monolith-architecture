# Modular Monolith Architecture

A production-ready modular monolith built with NestJS, featuring clean architecture, CQRS pattern, and type-safe APIs.

## Tech Stack

- **Backend:** NestJS 11 + Fastify 5 + MongoDB/Mongoose 9 + Redis/BullMQ
- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Mobile:** React Native + Expo + NativeWind
- **Shared:** TypeScript 5.5 + Zod 4 + ts-rest v3
- **Infrastructure:** Docker + Turborepo + pnpm workspaces

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose

## Quick Start

```bash
# Install dependencies
pnpm install

# Start infrastructure (MongoDB, Redis, MinIO)
pnpm docker:up

# Build shared packages
pnpm --filter @repo/shared build
pnpm --filter @repo/email build

# Start API in development mode
pnpm dev:api

# Start web app
pnpm dev:web
```

## Project Structure

```
├── apps/
│   ├── api/          # NestJS backend
│   ├── web/          # React frontend
│   └── mobile/       # React Native app
├── packages/
│   ├── shared/       # Shared schemas, types, contracts
│   ├── ui/           # Shared UI components (web)
│   ├── api-client/   # Type-safe API client
│   ├── email/        # Email templates
│   └── eslint-config/ # Shared ESLint config
├── docker/           # Docker Compose files
└── ai_instructions/  # Architecture rules
```

## Available Scripts

```bash
# Development
pnpm dev              # Start all apps
pnpm dev:api          # Start API only
pnpm dev:web          # Start web only

# Build
pnpm build            # Build all packages
pnpm build:api        # Build API only

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests only
pnpm test:e2e         # E2E tests only

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database

# Code Quality
pnpm lint             # Lint all packages
pnpm format:check     # Verify formatting
pnpm rules:check      # Enforce architecture rules

# Docker
pnpm docker:up        # Start infrastructure
pnpm docker:down      # Stop infrastructure
```

## API Documentation

Optional single-/multi-tenant setup is documented in [docs/TENANCY.md](./docs/TENANCY.md).
Database boundaries, repositories, and transactions are documented in
[docs/DATABASE.md](./docs/DATABASE.md).

When running in development mode, Swagger UI is available at:

```
http://localhost:3000/api/docs
```

## Health Checks

- **Liveness:** `GET /api/health/live`
- **Readiness:** `GET /api/health/ready`

## Environment Variables

Copy `.env.example` to `.env` in the respective app directories and configure:

```bash
# Required
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:5173

# Optional
CDN_ENABLED=false
CDN_DOMAIN=
```

## Architecture

This project follows **Clean Architecture** with **CQRS pattern**:

- **Presentation:** Controllers, resolvers, mappers
- **Application:** Commands, queries, handlers
- **Domain:** Entities, value objects, domain services
- **Infrastructure:** Repositories, external services

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the architecture rules
3. Run tests and linting
4. Submit a pull request

## License

MIT
