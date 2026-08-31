import {
  Globe,
  ShieldAlert,
  FileCheck2,
  Database,
  Radio,
  Workflow,
  CheckCircle,
  FileText,
  Zap,
} from "lucide-react";
import type { LifecycleStep } from "./lifecycle-flow-types";

export const postFlowSteps: LifecycleStep[] = [
  {
    stepNumber: 1,
    stageName: "Client Mutation Dispatch & Idempotency",
    layer: "Presentation",
    layerColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: Globe,
    description:
      "Client submits note creation form with auto-generated x-idempotency-key header to guarantee safe retries.",
    filesTouched: [
      { path: "apps/web/src/routes/_app.notes.new.tsx", role: "React Hook Form + Zod mutation" },
      { path: "packages/api-client/src/client.ts", role: "Attaches idempotency & auth headers" },
    ],
    output: "POST /api/notes { title, content }",
  },
  {
    stepNumber: 2,
    stageName: "Idempotency Lock & Gateway Authentication",
    layer: "Presentation",
    layerColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: Zap,
    description:
      "IdempotencyInterceptor acquires atomic Redis lock. AuthGuard verifies token and TenantContextGuard sets tenant scope in CLS.",
    filesTouched: [
      {
        path: "apps/api/src/common/interceptors/idempotency.interceptor.ts",
        role: "Redis SETNX idempotency key lock",
      },
      {
        path: "apps/api/src/common/guards/tenant-context.guard.ts",
        role: "AsyncLocalStorage tenant context",
      },
    ],
    output: "Idempotency Lock Acquired",
  },
  {
    stepNumber: 3,
    stageName: "Fine-Grained Authorization (FGA) Guard",
    layer: "Presentation",
    layerColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: ShieldAlert,
    description:
      "PermissionsGuard evaluates @RequirePermission('notes:create') against user role, permissions, and tenant memberships via @repo/authorization.",
    filesTouched: [
      {
        path: "apps/api/src/common/guards/permissions.guard.ts",
        role: "@RequirePermission('notes:create')",
      },
      {
        path: "packages/authorization/src/evaluator.ts",
        role: "hasPermission(principal, 'notes:create')",
      },
    ],
    output: "Access Granted (FGA Passed)",
  },
  {
    stepNumber: 4,
    stageName: "Zod DTO Validation & Controller Dispatch",
    layer: "Presentation",
    layerColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: FileCheck2,
    description:
      "ZodValidationPipe validates body against CreateNoteSchema. NotesController invokes CreateNoteCommand with typed payload.",
    filesTouched: [
      {
        path: "packages/contracts/src/schemas/note.schema.ts",
        role: "CreateNoteSchema.parse(body)",
      },
      {
        path: "apps/api/src/modules/notes/presentation/notes.controller.ts",
        role: "createNoteCommand.execute(input)",
      },
    ],
    output: "CreateNoteDto { title, content, userId }",
  },
  {
    stepNumber: 5,
    stageName: "Pure Domain Entity Invariant Verification",
    layer: "Domain",
    layerColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    icon: FileText,
    description:
      "Note.create(...) factory method validates business invariants (title length, tenant isolation). 100% pure TypeScript with 0 framework dependencies.",
    filesTouched: [
      {
        path: "apps/api/src/modules/notes/domain/entities/note.entity.ts",
        role: "Note.create(props) invariant check",
      },
      {
        path: "apps/api/src/modules/notes/domain/events/note-created.event.ts",
        role: "Domain event constructor",
      },
    ],
    output: "Result.ok(Note Entity Instance)",
  },
  {
    stepNumber: 6,
    stageName: "Unit of Work: PostgreSQL Save + Outbox Row",
    layer: "Infrastructure",
    layerColor: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    icon: Database,
    description:
      "DatabaseService executes single SQL transaction: inserts note row and inserts outbox_events row. Guarantees 0 dual-write failure.",
    filesTouched: [
      {
        path: "apps/api/src/modules/notes/application/commands/create-note.command.ts",
        role: "execute() transaction block",
      },
      {
        path: "apps/api/src/infrastructure/outbox/outbox.service.ts",
        role: "outbox.emit(new NoteCreatedEvent(), tx)",
      },
    ],
    output: "Committed PostgreSQL Transaction",
  },
  {
    stepNumber: 7,
    stageName: "Transactional Outbox Relay Worker",
    layer: "Background",
    layerColor: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    icon: Workflow,
    description:
      "OutboxRelayWorker polls outbox table with 'SELECT ... FOR UPDATE SKIP LOCKED', ensuring lock-free parallel execution without collisions.",
    filesTouched: [
      {
        path: "apps/api/src/infrastructure/outbox/outbox-relay.worker.ts",
        role: "SKIP LOCKED polling & dispatch",
      },
    ],
    output: "Dispatched to Redis Streams & BullMQ",
  },
  {
    stepNumber: 8,
    stageName: "Realtime WebSocket Broadcast & Background Tasks",
    layer: "Background",
    layerColor: "bg-rose-500/10 text-rose-500 border-rose-500/30",
    icon: Radio,
    description:
      "RealtimeWebSocketGateway broadcasts note creation to tenant WebSocket subscribers. Email queue sends notifications if configured.",
    filesTouched: [
      {
        path: "apps/api/src/infrastructure/realtime/transports/realtime-websocket.gateway.ts",
        role: "broadcastToTenant(tenantId, event)",
      },
      {
        path: "apps/api/src/modules/notes/application/listeners/notes-realtime.listener.ts",
        role: "OnEvent listener",
      },
    ],
    output: "Realtime WebSocket Push Completed",
  },
  {
    stepNumber: 9,
    stageName: "HTTP 201 Created Response",
    layer: "Presentation",
    layerColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: CheckCircle,
    description:
      "Controller transforms created entity into NoteResponse DTO and returns HTTP 201 with cache invalidation headers.",
    filesTouched: [
      {
        path: "apps/api/src/modules/notes/presentation/notes.controller.ts",
        role: "handleResult(result, mapper, i18n)",
      },
    ],
    output: "HTTP 201 Created (JSON)",
  },
];
