import {
  Globe,
  ShieldAlert,
  FileCheck2,
  Cpu,
  Database,
  Radio,
  CheckCircle,
  Zap,
} from "lucide-react";
import type { LifecycleStep } from "./lifecycle-flow-types";

export const getFlowSteps: LifecycleStep[] = [
  {
    stepNumber: 1,
    stageName: "Client HTTP Request Dispatch",
    layer: "Presentation",
    layerColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: Globe,
    description:
      "The React UI / external client invokes the type-safe API client SDK with pagination parameters (page=1&limit=20).",
    filesTouched: [
      {
        path: "packages/api-client/src/subclients/notes.ts",
        role: "getApiClient().notes.list({ query })",
      },
      {
        path: "apps/web/src/features/notes/notes.queries.ts",
        role: "TanStack Query queryFn wrapper",
      },
    ],
    output: "GET /api/notes?page=1&limit=20",
  },
  {
    stepNumber: 2,
    stageName: "Fastify Gateway, Guards & CLS Context",
    layer: "Presentation",
    layerColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: ShieldAlert,
    description:
      "Fastify parses headers. AuthGuard validates Bearer JWT. TenantContextGuard extracts tenant ID and sets AsyncLocalStorage CLS.",
    filesTouched: [
      {
        path: "apps/api/src/common/guards/auth.guard.ts",
        role: "Validates JWT & populates req.user",
      },
      {
        path: "apps/api/src/common/guards/tenant-context.guard.ts",
        role: "Binds tenant to AsyncLocalStorage",
      },
    ],
    output: "Authenticated Execution Context (Tenant + User)",
  },
  {
    stepNumber: 3,
    stageName: "Controller Route & Zod Query Validation",
    layer: "Presentation",
    layerColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: FileCheck2,
    description:
      "NotesController receives request. ZodValidationPipe validates query params against shared schema from @repo/contracts.",
    filesTouched: [
      {
        path: "apps/api/src/modules/notes/presentation/notes.controller.ts",
        role: "@Get() list() endpoint",
      },
      {
        path: "packages/contracts/src/schemas/pagination.schema.ts",
        role: "PaginationQuerySchema parsing",
      },
    ],
    output: "Validated PaginationQuery DTO",
  },
  {
    stepNumber: 4,
    stageName: "CQRS Lite Query Handler Execution",
    layer: "Application",
    layerColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    icon: Cpu,
    description:
      "GetNotesQuery coordinates read logic. Single responsibility class returning neverthrow Result<PaginatedNotes, NoteError>.",
    filesTouched: [
      {
        path: "apps/api/src/modules/notes/application/queries/get-notes.query.ts",
        role: "execute(queryDto) handler",
      },
    ],
    output: "Dispatched Query Handler Execution",
  },
  {
    stepNumber: 5,
    stageName: "Redis Cache-Aside Layer Check",
    layer: "Infrastructure",
    layerColor: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    icon: Zap,
    description:
      "Checks Redis for key 'notes:tenant:<id>:page:1'. On cache hit, deserializes instantly. On cache miss, falls through to PostgreSQL.",
    filesTouched: [
      {
        path: "apps/api/src/infrastructure/cache/cache.service.ts",
        role: "Redis GET with TTL strategy",
      },
    ],
    output: "Cache Miss / Fallthrough to DB",
  },
  {
    stepNumber: 6,
    stageName: "TenantScopedRepository & Drizzle SQL",
    layer: "Infrastructure",
    layerColor: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    icon: Database,
    description:
      "TenantScopedRepository injects 'WHERE tenant_id = ?' automatically into Drizzle ORM SQL query for zero-leak multi-tenancy.",
    filesTouched: [
      {
        path: "apps/api/src/modules/notes/infrastructure/repositories/notes.repository.ts",
        role: "findManyScoped(page, limit)",
      },
      {
        path: "apps/api/src/infrastructure/database/schema/notes.schema.ts",
        role: "Drizzle notesTable definition",
      },
    ],
    output: "Filtered PostgreSQL Result Rows",
  },
  {
    stepNumber: 7,
    stageName: "Domain Mapping, Tracing & Metrics",
    layer: "Infrastructure",
    layerColor: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    icon: Radio,
    description:
      "NoteMapper converts rows into Note entity instances. MetricsService records Prometheus request duration histogram.",
    filesTouched: [
      {
        path: "apps/api/src/modules/notes/domain/mappers/note.mapper.ts",
        role: "toDomain(row) & toResponse(note)",
      },
      {
        path: "apps/api/src/infrastructure/metrics/metrics.service.ts",
        role: "Prometheus & OpenTelemetry spans",
      },
    ],
    output: "Result.ok({ items, total, page, totalPages })",
  },
  {
    stepNumber: 8,
    stageName: "HTTP 200 JSON Response Serialization",
    layer: "Presentation",
    layerColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: CheckCircle,
    description:
      "handleResult() maps ok(data) to Fastify HTTP 200 with localized response headers and type-safe payload matching @repo/contracts.",
    filesTouched: [
      {
        path: "apps/api/src/common/utils/presentation.utils.ts",
        role: "handleResult(result, mapper, i18n)",
      },
    ],
    output: "HTTP 200 OK Response (JSON)",
  },
];
