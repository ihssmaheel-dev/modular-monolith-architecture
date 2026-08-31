import {
  Globe,
  ShieldAlert,
  FileCheck2,
  Zap,
  FileText,
  Database,
  Workflow,
  Radio,
  CheckCircle,
} from "lucide-react";
import type { PipelineStep } from "./flow-pipeline-types";

export const postPipelineStepsSync: PipelineStep[] = [
  {
    stepNumber: 1,
    title: "Client Form Mutation",
    layer: "Presentation",
    icon: Globe,
    description: "React Hook Form submits mutation with x-idempotency-key.",
    file: "apps/web/src/routes/_app.notes.new.tsx",
    output: "POST /api/notes",
  },
  {
    stepNumber: 2,
    title: "Idempotency Lock & Auth",
    layer: "Presentation",
    icon: Zap,
    description: "IdempotencyInterceptor acquires atomic Redis SETNX key lock.",
    file: "apps/api/src/common/interceptors/idempotency.interceptor.ts",
    output: "Lock Acquired & CLS Bound",
  },
  {
    stepNumber: 3,
    title: "FGA Authorization Guard",
    layer: "Presentation",
    icon: ShieldAlert,
    description: "PermissionsGuard evaluates @RequirePermission('notes:create').",
    file: "apps/api/src/common/guards/permissions.guard.ts",
    output: "Access Granted",
  },
  {
    stepNumber: 4,
    title: "Zod Payload Validation",
    layer: "Presentation",
    icon: FileCheck2,
    description: "ZodValidationPipe verifies body against CreateNoteSchema.",
    file: "packages/contracts/src/schemas/note.schema.ts",
    output: "Validated CreateNoteDto",
  },
  {
    stepNumber: 5,
    title: "Pure Entity Invariants",
    layer: "Domain",
    icon: FileText,
    description: "Note.create() factory verifies invariants with pure TypeScript.",
    file: "apps/api/src/modules/notes/domain/entities/note.entity.ts",
    output: "Result.ok(Note Entity)",
  },
  {
    stepNumber: 6,
    title: "SQL Transaction + Outbox",
    layer: "Infrastructure",
    icon: Database,
    description: "Single SQL Tx inserts Note row and Outbox event row simultaneously.",
    file: "apps/api/src/infrastructure/outbox/outbox.service.ts",
    output: "Committed Transaction",
  },
];

export const postPipelineStepResponse: PipelineStep = {
  stepNumber: 7,
  title: "HTTP 201 Created",
  layer: "Presentation",
  icon: CheckCircle,
  description: "Fastify returns created NoteResponse DTO directly to client.",
  file: "apps/api/src/common/utils/presentation.utils.ts",
  output: "HTTP 201 Created (JSON)",
};

export const postPipelineStepsAsync: PipelineStep[] = [
  {
    stepNumber: 8,
    title: "Outbox Relay Worker",
    layer: "Background",
    icon: Workflow,
    description: "OutboxRelayWorker polls with SELECT ... FOR UPDATE SKIP LOCKED.",
    file: "apps/api/src/infrastructure/outbox/outbox-relay.worker.ts",
    output: "Relayed to Redis Stream",
  },
  {
    stepNumber: 9,
    title: "Realtime WebSocket Push",
    layer: "Background",
    icon: Radio,
    description: "RealtimeWebSocketGateway broadcasts event to tenant subscribers.",
    file: "apps/api/src/infrastructure/realtime/transports/realtime-websocket.gateway.ts",
    output: "WebSocket Broadcast Complete",
  },
];
