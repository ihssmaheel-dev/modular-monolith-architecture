import {
  Globe,
  ShieldAlert,
  FileCheck2,
  Cpu,
  Zap,
  Database,
  Radio,
  CheckCircle,
} from "lucide-react";
import { MarkerType, type Node, type Edge } from "@xyflow/react";
import type { FlowNodeData } from "./flow-types";

const Y_GAP = 140;

export const getFlowNodes: Node<FlowNodeData>[] = [
  {
    id: "g1",
    type: "flowStep",
    position: { x: 0, y: 0 },
    data: {
      step: 1,
      title: "Client HTTP Request",
      layer: "Presentation",
      icon: Globe,
      description:
        "React UI dispatches typed API call via @repo/api-client with pagination params.",
      file: "packages/api-client/src/subclients/notes.ts",
    },
  },
  {
    id: "g2",
    type: "flowStep",
    position: { x: 0, y: Y_GAP },
    data: {
      step: 2,
      title: "Gateway & Auth Guards",
      layer: "Presentation",
      icon: ShieldAlert,
      description:
        "AuthGuard validates Bearer JWT. TenantContextGuard binds tenant to AsyncLocalStorage CLS.",
      file: "apps/api/src/common/guards/auth.guard.ts",
    },
  },
  {
    id: "g3",
    type: "flowStep",
    position: { x: 0, y: Y_GAP * 2 },
    data: {
      step: 3,
      title: "Controller + Zod Validation",
      layer: "Presentation",
      icon: FileCheck2,
      description:
        "NotesController receives request. ZodValidationPipe parses query against @repo/contracts schema.",
      file: "apps/api/src/modules/notes/presentation/notes.controller.ts",
    },
  },
  {
    id: "g4",
    type: "flowStep",
    position: { x: 0, y: Y_GAP * 3 },
    data: {
      step: 4,
      title: "CQRS Query Handler",
      layer: "Application",
      icon: Cpu,
      description:
        "GetNotesQuery single-responsibility handler returns neverthrow Result<PaginatedNotes, NoteError>.",
      file: "apps/api/src/modules/notes/application/queries/get-notes.query.ts",
    },
  },
  {
    id: "g5",
    type: "flowStep",
    position: { x: 0, y: Y_GAP * 4 },
    data: {
      step: 5,
      title: "Redis Cache-Aside Check",
      layer: "Infrastructure",
      icon: Zap,
      description:
        "CacheService checks Redis for tenant-scoped key. On hit, returns instantly. On miss, falls through to DB.",
      file: "apps/api/src/infrastructure/cache/cache.service.ts",
    },
  },
  {
    id: "g6",
    type: "flowStep",
    position: { x: 0, y: Y_GAP * 5 },
    data: {
      step: 6,
      title: "Repository + Drizzle SQL",
      layer: "Infrastructure",
      icon: Database,
      description:
        "TenantScopedRepository auto-injects WHERE tenant_id filter into Drizzle ORM query.",
      file: "apps/api/src/modules/notes/infrastructure/repositories/notes.repository.ts",
    },
  },
  {
    id: "g7",
    type: "flowStep",
    position: { x: 0, y: Y_GAP * 6 },
    data: {
      step: 7,
      title: "Domain Mapper + Metrics",
      layer: "Infrastructure",
      icon: Radio,
      description:
        "NoteMapper converts DB rows to domain entities. MetricsService records Prometheus histogram.",
      file: "apps/api/src/infrastructure/metrics/metrics.service.ts",
    },
  },
  {
    id: "g8",
    type: "flowStep",
    position: { x: 0, y: Y_GAP * 7 },
    data: {
      step: 8,
      title: "HTTP 200 JSON Response",
      layer: "Presentation",
      icon: CheckCircle,
      description:
        "handleResult() maps ok(data) to Fastify HTTP 200 with localized headers and typed payload.",
      file: "apps/api/src/common/utils/presentation.utils.ts",
    },
  },
];

const EDGE_STYLE = { stroke: "hsl(var(--muted-foreground) / 0.3)", strokeWidth: 1.5 };
const MARKER = {
  type: MarkerType.ArrowClosed,
  width: 14,
  height: 14,
  color: "hsl(var(--muted-foreground) / 0.4)",
};

export const getFlowEdges: Edge[] = [
  { id: "ge1", source: "g1", target: "g2", animated: true, style: EDGE_STYLE, markerEnd: MARKER },
  { id: "ge2", source: "g2", target: "g3", animated: true, style: EDGE_STYLE, markerEnd: MARKER },
  { id: "ge3", source: "g3", target: "g4", animated: true, style: EDGE_STYLE, markerEnd: MARKER },
  { id: "ge4", source: "g4", target: "g5", animated: true, style: EDGE_STYLE, markerEnd: MARKER },
  { id: "ge5", source: "g5", target: "g6", animated: true, style: EDGE_STYLE, markerEnd: MARKER },
  { id: "ge6", source: "g6", target: "g7", animated: true, style: EDGE_STYLE, markerEnd: MARKER },
  { id: "ge7", source: "g7", target: "g8", animated: true, style: EDGE_STYLE, markerEnd: MARKER },
];
