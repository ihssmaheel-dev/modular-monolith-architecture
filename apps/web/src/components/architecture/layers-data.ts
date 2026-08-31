import { Server, Cpu, Shield, Database, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { layerCodeSnippets } from "./layer-code-snippets";

export interface LayerItem {
  id: string;
  key: string;
  icon: LucideIcon;
  color: string;
  path: string;
  defaultTitle: string;
  defaultBadge: string;
  defaultDescription: string;
  defaultResponsibilities: string[];
  codeSnippet: string;
}

export const layersData: LayerItem[] = [
  {
    id: "presentation",
    key: "presentation",
    icon: Server,
    color: "text-blue-500",
    path: "apps/api/src/modules/[domain]/presentation/",
    defaultTitle: "1. Presentation Layer",
    defaultBadge: "Fastify 5 Controllers",
    defaultDescription:
      "The HTTP gateway. Controllers remain thin, performing 0 business logic. They authenticate requests, enforce FGA permissions, validate input DTOs, invoke CQRS commands/queries, and map Result<T, E> to HTTP responses.",
    defaultResponsibilities: [
      "Controller routes: Maps HTTP methods to application use cases.",
      "FGA Guards: @RequirePermission() enforces RBAC/ReBAC.",
      "Idempotency: @Idempotent() prevents duplicate mutations.",
      "Tenant Context: @TenantAgnostic() declares scope.",
      "Validation: ZodValidationPipe parses against @repo/contracts.",
      "Error Mapping: Localized JSON error payloads.",
    ],
    codeSnippet: layerCodeSnippets.presentation,
  },
  {
    id: "application",
    key: "application",
    icon: Cpu,
    color: "text-emerald-500",
    path: "apps/api/src/modules/[domain]/application/",
    defaultTitle: "2. Application Layer",
    defaultBadge: "CQRS Lite Use Cases",
    defaultDescription:
      "Orchestrates business use cases. Divided into atomic Command handlers (mutations) and Query handlers (reads). Commands coordinate domain entities, repositories, and transactional outbox events, returning neverthrow Result<T, E>.",
    defaultResponsibilities: [
      "Single-Responsibility: One command/query per file (<150 lines).",
      "Neverthrow Result: Handlers return Result<T, DomainError>.",
      "Transactional Orchestration: Saves entity and emits outbox event in 1 tx.",
      "Domain Event Listeners: Listens to internal domain events.",
      "Policy Evaluation: Evaluates domain authorization rules.",
    ],
    codeSnippet: layerCodeSnippets.application,
  },
  {
    id: "domain",
    key: "domain",
    icon: Shield,
    color: "text-amber-500",
    path: "apps/api/src/modules/[domain]/domain/",
    defaultTitle: "3. Domain Layer",
    defaultBadge: "Pure Business Models",
    defaultDescription:
      "The core heart of the enterprise logic. Contains pure TypeScript entities, value objects, domain events, and domain errors with ZERO external framework, NestJS, or ORM dependencies.",
    defaultResponsibilities: [
      "Entity Invariants: Factory methods enforce business rules.",
      "Value Objects: Immutable structures with validation.",
      "Domain Events: Strongly-typed state change records.",
      "Domain Errors: Specific failure error codes.",
      "Zero Framework Coupling: 100% pure TypeScript.",
    ],
    codeSnippet: layerCodeSnippets.domain,
  },
  {
    id: "infrastructure",
    key: "infrastructure",
    icon: Database,
    color: "text-purple-500",
    path: "apps/api/src/infrastructure/",
    defaultTitle: "4. Infrastructure Layer",
    defaultBadge: "Drizzle & Technical Drivers",
    defaultDescription:
      "Adapts technical providers and data persistence. Contains Drizzle ORM schemas, TenantScopedRepositories, Redis caching & rate limiters, BullMQ background queues, Piscina worker pools, and OpenTelemetry exporters.",
    defaultResponsibilities: [
      "Drizzle ORM: PostgreSQL relational persistence.",
      "TenantScopedRepository: Auto multi-tenant isolation.",
      "Redis Caching & Rate Limiting with TTL.",
      "Piscina Worker Threads: Offloads heavy CPU work.",
      "Transactional Outbox Relay: Relays rows to Redis/BullMQ.",
    ],
    codeSnippet: layerCodeSnippets.infrastructure,
  },
  {
    id: "packages",
    key: "packages",
    icon: Package,
    color: "text-pink-500",
    path: "packages/*",
    defaultTitle: "5. Capability Packages",
    defaultBadge: "Shared Core Monorepo",
    defaultDescription:
      "Reusable, focused monorepo capability packages consumed by API, Web, and background jobs, ensuring absolute DRY alignment across the codebase.",
    defaultResponsibilities: [
      "@repo/contracts: Zod 4 schemas & oRPC routes.",
      "@repo/authorization: Pure FGA RBAC+ReBAC+ABAC.",
      "@repo/i18n: Locale dictionaries & key resolvers.",
      "@repo/api-client: Type-safe client with auto-refresh.",
      "@repo/email: React Email transactional templates.",
      "@repo/ui: Accessible Base UI + Tailwind 4 design system.",
    ],
    codeSnippet: layerCodeSnippets.packages,
  },
];
