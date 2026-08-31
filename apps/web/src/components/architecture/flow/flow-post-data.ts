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
import { MarkerType, type Node, type Edge } from "@xyflow/react";
import type { FlowNodeData } from "./flow-types";

const Y = 140;

export const postFlowNodes: Node<FlowNodeData>[] = [
  {
    id: "p1",
    type: "flowStep",
    position: { x: 0, y: 0 },
    data: {
      step: 1,
      title: "Client Form Submit",
      layer: "Presentation",
      icon: Globe,
      description:
        "React Hook Form submits with auto-generated x-idempotency-key for safe retries.",
      file: "apps/web/src/routes/_app.notes.new.tsx",
    },
  },
  {
    id: "p2",
    type: "flowStep",
    position: { x: 0, y: Y },
    data: {
      step: 2,
      title: "Idempotency Lock + Auth",
      layer: "Presentation",
      icon: Zap,
      description:
        "IdempotencyInterceptor acquires Redis SETNX lock. AuthGuard + TenantContext bind CLS.",
      file: "apps/api/src/common/interceptors/idempotency.interceptor.ts",
    },
  },
  {
    id: "p3",
    type: "flowStep",
    position: { x: 0, y: Y * 2 },
    data: {
      step: 3,
      title: "FGA Permission Guard",
      layer: "Presentation",
      icon: ShieldAlert,
      description:
        "PermissionsGuard evaluates @RequirePermission('notes:create') via @repo/authorization.",
      file: "apps/api/src/common/guards/permissions.guard.ts",
    },
  },
  {
    id: "p4",
    type: "flowStep",
    position: { x: 0, y: Y * 3 },
    data: {
      step: 4,
      title: "Controller + Zod Validation",
      layer: "Presentation",
      icon: FileCheck2,
      description:
        "ZodValidationPipe validates body against CreateNoteSchema from @repo/contracts.",
      file: "packages/contracts/src/schemas/note.schema.ts",
    },
  },
  {
    id: "p5",
    type: "flowStep",
    position: { x: 0, y: Y * 4 },
    data: {
      step: 5,
      title: "Domain Entity Invariants",
      layer: "Domain",
      icon: FileText,
      description:
        "Note.create() factory validates business rules. 100% pure TypeScript, zero framework deps.",
      file: "apps/api/src/modules/notes/domain/entities/note.entity.ts",
    },
  },
  {
    id: "p6",
    type: "flowStep",
    position: { x: 0, y: Y * 5 },
    data: {
      step: 6,
      title: "DB Transaction + Outbox",
      layer: "Infrastructure",
      icon: Database,
      description:
        "Single SQL transaction: INSERT note row + INSERT outbox event. Zero dual-write failures.",
      file: "apps/api/src/infrastructure/outbox/outbox.service.ts",
    },
  },
  {
    id: "p9",
    type: "flowStep",
    position: { x: -200, y: Y * 6 + 40 },
    data: {
      step: 9,
      title: "HTTP 201 Created",
      layer: "Presentation",
      icon: CheckCircle,
      description:
        "Controller returns created entity as NoteResponse DTO with cache invalidation headers.",
      file: "apps/api/src/common/utils/presentation.utils.ts",
    },
  },
  {
    id: "p7",
    type: "flowStep",
    position: { x: 200, y: Y * 6 + 40 },
    data: {
      step: 7,
      title: "Outbox Relay Worker",
      layer: "Background",
      icon: Workflow,
      description:
        "OutboxRelayWorker polls with SELECT ... FOR UPDATE SKIP LOCKED for parallel relay.",
      file: "apps/api/src/infrastructure/outbox/outbox-relay.worker.ts",
    },
  },
  {
    id: "p8",
    type: "flowStep",
    position: { x: 200, y: Y * 7 + 40 },
    data: {
      step: 8,
      title: "WebSocket Broadcast",
      layer: "Background",
      icon: Radio,
      description: "RealtimeWebSocketGateway pushes event to all tenant WebSocket subscribers.",
      file: "apps/api/src/infrastructure/realtime/transports/realtime-websocket.gateway.ts",
    },
  },
];

const S = { stroke: "hsl(var(--muted-foreground) / 0.3)", strokeWidth: 1.5 };
const M = {
  type: MarkerType.ArrowClosed,
  width: 14,
  height: 14,
  color: "hsl(var(--muted-foreground) / 0.4)",
};

export const postFlowEdges: Edge[] = [
  { id: "pe1", source: "p1", target: "p2", animated: true, style: S, markerEnd: M },
  { id: "pe2", source: "p2", target: "p3", animated: true, style: S, markerEnd: M },
  { id: "pe3", source: "p3", target: "p4", animated: true, style: S, markerEnd: M },
  { id: "pe4", source: "p4", target: "p5", animated: true, style: S, markerEnd: M },
  { id: "pe5", source: "p5", target: "p6", animated: true, style: S, markerEnd: M },
  {
    id: "pe6",
    source: "p6",
    target: "p9",
    animated: true,
    style: S,
    markerEnd: M,
    label: "Response",
  },
  { id: "pe7", source: "p6", target: "p7", animated: true, style: S, markerEnd: M, label: "Async" },
  { id: "pe8", source: "p7", target: "p8", animated: true, style: S, markerEnd: M },
];
