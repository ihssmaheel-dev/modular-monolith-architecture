import { Boxes, Workflow, GitBranch, ShieldCheck, Database, LockKeyhole } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PillarItem {
  id: string;
  translationKey: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  defaultTitle: string;
  defaultBadge: string;
  defaultDescription: string;
  defaultGuarantees: string[];
}

export const pillarsData: PillarItem[] = [
  {
    id: "modularMonolith",
    translationKey: "modularMonolith",
    icon: Boxes,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    defaultTitle: "Modular Monolith vs Microservices",
    defaultBadge: "Architecture Paradigm",
    defaultDescription:
      "Single deployable artifact containing strictly isolated business modules. Communicates in-process with 0ms network latency instead of a fragile distributed HTTP/gRPC mesh.",
    defaultGuarantees: [
      "Eliminates distributed transaction headaches (Sagas, 2PC) and serialization tax.",
      "Strict boundaries enforced by automated dependency-cruiser rules.",
      "Single Docker container deployment with shared connection pooling.",
      "Easy transition path to standalone services in the future if needed.",
    ],
  },
  {
    id: "cqrsLite",
    translationKey: "cqrsLite",
    icon: Workflow,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    defaultTitle: "Why CQRS Lite instead of Event Sourcing?",
    defaultBadge: "Application Pattern",
    defaultDescription:
      "We separate read queries from mutating commands into single-responsibility handlers under 150 lines, returning functional neverthrow Result<T, E> types.",
    defaultGuarantees: [
      "Avoids MediatR indirection that obscures execution call stacks.",
      "Prevents dual read/write DB synchronization delays and eventual consistency lag.",
      "Eliminates event replay schema migration complexity.",
      "Every Command and Query is a deterministic class with atomic unit tests.",
    ],
  },
  {
    id: "orpcContracts",
    translationKey: "orpcContracts",
    icon: GitBranch,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    defaultTitle: "Why oRPC for Contracts + Type-Safe REST?",
    defaultBadge: "API & Contracts",
    defaultDescription:
      "@repo/contracts defines contract blueprints with oc.route() and Zod 4 schemas as Single Source of Truth, while Fastify exposes standard REST endpoints.",
    defaultGuarantees: [
      "100% Compile-Time Type Safety: Instant compile errors on schema drift.",
      "Standard OpenAPI 3.1 & REST: Public consumers and curl work with standard HTTP.",
      "Automatic Interceptors: @repo/api-client handles tokens, tenant, and idempotency.",
      "Interactive Scalar Docs: Live OpenAPI 3.1 reference served at /api/docs.",
    ],
  },
  {
    id: "fgaSecurity",
    translationKey: "fgaSecurity",
    icon: ShieldCheck,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    defaultTitle: "Fine-Grained Authorization (FGA)",
    defaultBadge: "Zero-Trust Security",
    defaultDescription:
      "Pure functional authorization engine in @repo/authorization combining Role-Based (RBAC), Relationship-Based (ReBAC), and Attribute-Based (ABAC) evaluation.",
    defaultGuarantees: [
      "Action Vocabulary: Standardized domain action strings with wildcard matching.",
      "ReBAC Ownership Checks: Evaluates relationships dynamically in-memory.",
      "Dual Layer Enforcement: Enforced at Controller gates and Application Services.",
      "Decoupled from Frameworks: Pure TypeScript logic testable in milliseconds.",
    ],
  },
  {
    id: "transactionalOutbox",
    translationKey: "transactionalOutbox",
    icon: Database,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    defaultTitle: "Transactional Outbox Pattern",
    defaultBadge: "Data Consistency",
    defaultDescription:
      "Guarantees at-least-once domain event delivery by writing entity mutations and outbox rows in the exact same PostgreSQL database transaction.",
    defaultGuarantees: [
      "Eliminates Dual-Write Failures: Entity state and outgoing events never desync.",
      "High-Performance Relay: OutboxRelayWorker polls with FOR UPDATE SKIP LOCKED.",
      "Redis Streams & BullMQ Dispatch: Relays events to workers, emails, and WebSockets.",
      "Dead-Letter Handling: Automatic exponential backoff retries and failure queues.",
    ],
  },
  {
    id: "zeroTrustTenancy",
    translationKey: "zeroTrustTenancy",
    icon: LockKeyhole,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    defaultTitle: "Zero-Trust Multi-Tenancy",
    defaultBadge: "Tenant Isolation",
    defaultDescription:
      "Supports both single-tenant and multi-tenant deployments through a runtime switch (TENANCY_MODE) with automatic query isolation.",
    defaultGuarantees: [
      "AsyncLocalStorage (CLS): TenantContextGuard extracts and binds tenant context.",
      "TenantScopedRepository: Automatically injects WHERE tenant_id filter into queries.",
      "Role Hierarchy: Supports Owner, Admin, Member, and Guest with invitation workflows.",
      "Tenant Agnostic: @TenantAgnostic() explicitly marks global admin endpoints.",
    ],
  },
];
