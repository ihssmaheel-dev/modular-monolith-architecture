import { Boxes, Workflow, GitBranch, ShieldCheck, Database, LockKeyhole } from "lucide-react";
export interface PillarItem {
  id: string;
  title: string;
  badge: string;
  icon: typeof Boxes;
  color: string;
  bgColor: string;
  description: string;
  reasons: string[];
}
export const pillarsData: PillarItem[] = [
  {
    id: "modular-monolith",
    title: "Modular Monolith vs Microservices",
    badge: "Architecture Paradigm",
    icon: Boxes,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description:
      "Single deployable artifact containing strictly isolated business modules (Auth, Users, Tenancy, Notes, Files). Communicates in-process with 0ms network latency instead of fragile distributed HTTP/gRPC mesh.",
    reasons: [
      "Eliminates distributed transaction headaches (Sagas, 2PC) and serialization tax.",
      "Strict boundaries enforced by automated dependency-cruiser rules.",
      "Single Docker container deployment with shared connection pooling.",
      "Easy transition path to standalone services in the future if needed.",
    ],
  },
  {
    id: "cqrs-lite",
    title: "Why CQRS Lite instead of Heavy CQRS / Event Sourcing?",
    badge: "Application Layer Pattern",
    icon: Workflow,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description:
      "We separate read queries from mutating commands into single-responsibility handlers under 150 lines, returning functional neverthrow Result<T, E> types without mediator or event sourcing bloat.",
    reasons: [
      "Avoids MediatR indirection that obscures execution call stacks.",
      "Prevents dual read/write DB synchronization delays (eventual consistency lag).",
      "Eliminates event replay schema migration complexity.",
      "Every Command and Query is a deterministic class with atomic unit tests.",
    ],
  },
  {
    id: "orpc-contracts",
    title: "Why oRPC for Contracts + Type-Safe REST?",
    badge: "API & Contract Design",
    icon: GitBranch,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description:
      "@repo/contracts defines contract blueprints with oc.route() and Zod 4 schemas as Single Source of Truth. The Fastify API exposes standard REST, while @repo/api-client provides full end-to-end type safety.",
    reasons: [
      "100% Compile-Time Type Safety: Auto-completion and compile errors on schema drift.",
      "Standard OpenAPI 3.1 & REST: Public consumers, webhooks, and curl work with standard HTTP.",
      "Automatic Interceptors: @repo/api-client attaches Bearer tokens, tenant, idempotency, and locale.",
      "Interactive Scalar Docs: Live OpenAPI 3.1 reference served at /api/docs.",
    ],
  },
  {
    id: "fga-security",
    title: "Fine-Grained Authorization (FGA): RBAC + ReBAC + ABAC",
    badge: "Zero-Trust Security",
    icon: ShieldCheck,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    description:
      "Pure functional authorization engine in @repo/authorization combining Role-Based, Relationship-Based (Resource Ownership), and Attribute-Based evaluation.",
    reasons: [
      "Action Vocabulary: Standardized domain action strings with wildcard matching (e.g. notes:*).",
      "ReBAC Ownership Checks: Evaluates relationships dynamically (e.g. note.authorId === principal.id).",
      "Dual Layer Enforcement: Enforced at Controller gates and Application Services.",
      "Decoupled from Frameworks: Pure TypeScript logic testable in milliseconds.",
    ],
  },
  {
    id: "transactional-outbox",
    title: "Transactional Outbox & Reliable Messaging",
    badge: "Data Consistency",
    icon: Database,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    description:
      "Guarantees at-least-once domain event delivery by writing entity mutations and outbox rows in the exact same PostgreSQL database transaction.",
    reasons: [
      "Eliminates Dual-Write Failures: Entity state and outgoing events never desynchronize.",
      "High-Performance Relay: OutboxRelayWorker polls with FOR UPDATE SKIP LOCKED.",
      "Redis Streams & BullMQ Dispatch: Relays events to workers, emails, and WebSockets.",
      "Dead-Letter Handling: Automatic exponential backoff retries and failure queues.",
    ],
  },
  {
    id: "zero-trust-tenancy",
    title: "Zero-Trust Multi-Tenancy Architecture",
    badge: "Tenant Isolation",
    icon: LockKeyhole,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    description:
      "Supports both single-tenant and multi-tenant deployments through a runtime switch (TENANCY_MODE) with automatic query isolation.",
    reasons: [
      "AsyncLocalStorage (CLS): TenantContextGuard extracts tenant and binds it to context.",
      "TenantScopedRepository: Automatically injects WHERE tenant_id filter into all queries.",
      "Role Hierarchy: Supports Owner, Admin, Member, and Guest with invitation workflows.",
      "Tenant Agnostic: @TenantAgnostic() explicitly marks global administrative endpoints.",
    ],
  },
];
