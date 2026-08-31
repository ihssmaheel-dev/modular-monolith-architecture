import { Server, Zap, BarChart3, Activity, Radio, HardDrive, Mail, Database } from "lucide-react";
export interface ServiceItem {
  name: string;
  port: string;
  url: string;
  protocol: string;
  icon: typeof Server;
  badge: string;
  description: string;
  credentials: string;
  healthEndpoint: string;
}
export const servicesData: ServiceItem[] = [
  {
    name: "API Backend Service",
    port: "3000",
    url: "http://localhost:3000",
    protocol: "HTTP / Fastify 5",
    icon: Server,
    badge: "Core Runtime",
    description:
      "High-performance modular monolith API serving REST endpoints, health probes, and WebSocket gateways.",
    credentials: "N/A (Public Gateway)",
    healthEndpoint: "http://localhost:3000/api/health",
  },
  {
    name: "Scalar Interactive Docs",
    port: "3000",
    url: "http://localhost:3000/api/docs",
    protocol: "OpenAPI 3.1 / Scalar",
    icon: Zap,
    badge: "API Reference",
    description:
      "Interactive documentation with live request runner, schema inspectors, and code snippet generators.",
    credentials: "N/A (Public Reference)",
    healthEndpoint: "http://localhost:3000/api/docs",
  },
  {
    name: "Grafana Dashboards",
    port: "3001",
    url: "http://localhost:3001",
    protocol: "Web UI / Grafana 11",
    icon: BarChart3,
    badge: "Observability",
    description:
      "Pre-configured dashboards for API throughput, latency p95/p99, database pools, and Redis cache metrics.",
    credentials: "admin / admin",
    healthEndpoint: "http://localhost:3001/api/health",
  },
  {
    name: "Jaeger Distributed Tracing",
    port: "16686",
    url: "http://localhost:16686",
    protocol: "OpenTelemetry / UI",
    icon: Activity,
    badge: "Tracing",
    description:
      "Full distributed trace visualizer showing exact execution spans across Fastify, Drizzle, Redis, and workers.",
    credentials: "No auth required",
    healthEndpoint: "http://localhost:16686",
  },
  {
    name: "Prometheus Metrics Engine",
    port: "9090",
    url: "http://localhost:9090",
    protocol: "Prometheus 2.50",
    icon: Radio,
    badge: "Metrics",
    description:
      "Scrapes API metrics from GET /metrics on port 3000 every 5 seconds for alert evaluation and dashboard queries.",
    credentials: "No auth required",
    healthEndpoint: "http://localhost:9090/-/healthy",
  },
  {
    name: "Loki Log Aggregator",
    port: "3100",
    url: "http://localhost:3100",
    protocol: "Grafana Loki 3.0",
    icon: HardDrive,
    badge: "Log Engine",
    description:
      "High-throughput structured log aggregator capturing Pino application logs streamed via Promtail.",
    credentials: "No auth required",
    healthEndpoint: "http://localhost:3100/ready",
  },
  {
    name: "Mailpit Local SMTP & UI",
    port: "8025 / 1025",
    url: "http://localhost:8025",
    protocol: "SMTP (1025) / HTTP (8025)",
    icon: Mail,
    badge: "Email Sandbox",
    description:
      "Zero-configuration local email inbox catching all transactional React Emails sent by the API without external credentials.",
    credentials: "No auth required",
    healthEndpoint: "http://localhost:8025",
  },
  {
    name: "MinIO S3 Object Storage",
    port: "9001 / 9000",
    url: "http://localhost:9001",
    protocol: "S3 API (9000) / Console (9001)",
    icon: Database,
    badge: "Storage Engine",
    description:
      "AWS S3-compatible local bucket system supporting presigned upload URLs and file management.",
    credentials: "minioadmin / minioadmin",
    healthEndpoint: "http://localhost:9000/minio/health/live",
  },
  {
    name: "pgAdmin 4 Database Studio",
    port: "5050",
    url: "http://localhost:5050",
    protocol: "Web UI / pgAdmin",
    icon: Database,
    badge: "DB Studio",
    description:
      "Visual PostgreSQL administration suite pre-connected to the modular monolith database container.",
    credentials: "admin@example.com / admin",
    healthEndpoint: "http://localhost:5050",
  },
  {
    name: "PostgreSQL 16 Database",
    port: "5432",
    url: "localhost:5432",
    protocol: "PostgreSQL Driver",
    icon: Database,
    badge: "Primary DB",
    description:
      "Primary relational database supporting Drizzle ORM schemas, relational constraints, and transactional outbox tables.",
    credentials: "postgres / postgres (db: monolith)",
    healthEndpoint: "pg_isready",
  },
  {
    name: "Redis 7 In-Memory Engine",
    port: "6379",
    url: "localhost:6379",
    protocol: "Redis / ioredis",
    icon: Zap,
    badge: "Cache & Queue",
    description:
      "Powers distributed caching, token-bucket rate limiting, BullMQ background queues, and WebSocket pub/sub streams.",
    credentials: "No password (port: 6379)",
    healthEndpoint: "redis-cli PING",
  },
];
