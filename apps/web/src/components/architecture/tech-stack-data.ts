import { Server, Monitor, Database, Activity, Wrench, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface TechCategory {
  titleKey: string;
  icon: LucideIcon;
  items: string[];
}

export const techStackCategories: TechCategory[] = [
  {
    titleKey: "architecture.techStack.categories.backendCore",
    icon: Server,
    items: ["NestJS 11", "Fastify 5", "Drizzle ORM", "oRPC", "Zod 4", "neverthrow"],
  },
  {
    titleKey: "architecture.techStack.categories.frontendEngine",
    icon: Monitor,
    items: [
      "React 19",
      "TanStack Start",
      "TanStack Query v5",
      "Tailwind CSS v4",
      "Base UI",
      "Zustand 5",
    ],
  },
  {
    titleKey: "architecture.techStack.categories.dataStorage",
    icon: Database,
    items: ["PostgreSQL 16", "Redis 7", "MinIO S3", "BullMQ 5", "Piscina 5", "ioredis"],
  },
  {
    titleKey: "architecture.techStack.categories.observability",
    icon: Activity,
    items: ["OpenTelemetry", "Prometheus 2.50", "Grafana 11", "Jaeger UI", "Grafana Loki", "Pino"],
  },
  {
    titleKey: "architecture.techStack.categories.devops",
    icon: Wrench,
    items: ["Docker Compose", "Turborepo 2.10", "pnpm 10", "Husky", "Changesets", "tsx"],
  },
  {
    titleKey: "architecture.techStack.categories.security",
    icon: ShieldCheck,
    items: [
      "FGA (RBAC+ReBAC)",
      "CSRF Guard",
      "Rate Limiting",
      "Account Lockout",
      "JWT + Refresh",
      "Idempotency",
    ],
  },
];
