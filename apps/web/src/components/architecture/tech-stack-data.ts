import type { ComponentType, SVGProps } from "react";
import {
  ReactLogo,
  TypeScriptLogo,
  NestLogo,
  FastifyLogo,
  TailwindLogo,
  PostgreSQLLogo,
  RedisLogo,
  DockerLogo,
} from "./tech-logos";
import {
  ZodLogo,
  TanStackLogo,
  DrizzleLogo,
  PrometheusLogo,
  GrafanaLogo,
  OpenTelemetryLogo,
  MinIOLogo,
  VitestLogo,
} from "./tech-logos-more";

export interface TechItem {
  id: string;
  name: string;
  category: string;
  role: string;
  logo: ComponentType<SVGProps<SVGSVGElement>>;
}

export const techItems: TechItem[] = [
  {
    id: "react",
    name: "React 19",
    category: "Frontend",
    role: "UI Component Library",
    logo: ReactLogo,
  },
  {
    id: "typescript",
    name: "TypeScript 6",
    category: "Language",
    role: "Strict Type System",
    logo: TypeScriptLogo,
  },
  {
    id: "nestjs",
    name: "NestJS 11",
    category: "Backend",
    role: "Dependency Injection & App Framework",
    logo: NestLogo,
  },
  {
    id: "fastify",
    name: "Fastify 5",
    category: "HTTP Gateway",
    role: "High-Throughput HTTP Engine",
    logo: FastifyLogo,
  },
  {
    id: "tailwind",
    name: "Tailwind CSS v4",
    category: "Styling",
    role: "Utility-First CSS Engine",
    logo: TailwindLogo,
  },
  {
    id: "tanstack",
    name: "TanStack Start & Router",
    category: "Frontend",
    role: "Type-Safe SSR & File-Based Router",
    logo: TanStackLogo,
  },
  {
    id: "postgres",
    name: "PostgreSQL 16",
    category: "Database",
    role: "Primary Relational Storage",
    logo: PostgreSQLLogo,
  },
  {
    id: "drizzle",
    name: "Drizzle ORM",
    category: "Database",
    role: "Type-Safe SQL Query Builder",
    logo: DrizzleLogo,
  },
  {
    id: "redis",
    name: "Redis 7",
    category: "Cache & Queue",
    role: "In-Memory Cache, Locks & Streams",
    logo: RedisLogo,
  },
  {
    id: "docker",
    name: "Docker Compose",
    category: "DevOps",
    role: "Zero-Cloud Local Infrastructure",
    logo: DockerLogo,
  },
  {
    id: "zod",
    name: "Zod 4",
    category: "Validation",
    role: "Contract & Input Validation",
    logo: ZodLogo,
  },
  {
    id: "otel",
    name: "OpenTelemetry",
    category: "Observability",
    role: "Distributed Tracing Spans",
    logo: OpenTelemetryLogo,
  },
  {
    id: "prometheus",
    name: "Prometheus 2.50",
    category: "Observability",
    role: "Time-Series Metrics Scraper",
    logo: PrometheusLogo,
  },
  {
    id: "grafana",
    name: "Grafana 11",
    category: "Observability",
    role: "Metrics & Traces Dashboard",
    logo: GrafanaLogo,
  },
  {
    id: "minio",
    name: "MinIO S3",
    category: "Storage",
    role: "S3-Compatible Object Storage",
    logo: MinIOLogo,
  },
  {
    id: "vitest",
    name: "Vitest 4",
    category: "Testing",
    role: "Deterministic Unit & E2E Testing",
    logo: VitestLogo,
  },
];
