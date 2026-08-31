import { useTranslation } from "react-i18next";
import { FolderTree, Layers, Package, Server, Monitor, HardDrive, Shield } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";

export function ArchitectureFolderTree() {
  const { t } = useTranslation();

  const treeSections = [
    {
      icon: Server,
      name: "apps/api/src/",
      badge: "Modular Monolith Backend",
      color: "text-blue-500",
      items: [
        { path: "├── common/", desc: "Global filters, guards, pipes, and presentation utils" },
        { path: "├── config/", desc: "Zod runtime environment validation (env.ts)" },
        {
          path: "├── infrastructure/",
          desc: "Redis, Drizzle DB, BullMQ queues, Piscina workers, OTel",
        },
        {
          path: "└── modules/[domain]/",
          desc: "Bounded domain slices (auth, users, tenancy, notes, files)",
          children: [
            {
              path: "├── presentation/",
              desc: "Fastify controllers, guards & localized handlers",
              color: "text-blue-400",
            },
            {
              path: "├── application/",
              desc: "CQRS commands, queries, listeners (<150 lines)",
              color: "text-emerald-400",
            },
            {
              path: "├── domain/",
              desc: "Pure TypeScript entities, events & business rules",
              color: "text-amber-400",
            },
            {
              path: "└── infrastructure/",
              desc: "Drizzle tenant-scoped repositories & row mappers",
              color: "text-purple-400",
            },
          ],
        },
      ],
    },
    {
      icon: Monitor,
      name: "apps/web/src/",
      badge: "TanStack Start SSR Client",
      color: "text-emerald-500",
      items: [
        { path: "├── routes/", desc: "File-based TanStack Router pages and layouts" },
        { path: "├── features/", desc: "Domain query/mutation hooks via @repo/api-client" },
        { path: "└── stores/", desc: "Zustand persistent auth, locale, and tenant state" },
      ],
    },
    {
      icon: Package,
      name: "packages/*",
      badge: "Shared Core Capabilities",
      color: "text-purple-500",
      items: [
        { path: "├── @repo/contracts", desc: "Zod 4 schemas, DTOs, and oRPC route blueprints" },
        {
          path: "├── @repo/authorization",
          desc: "Pure Fine-Grained Authorization (FGA) evaluator",
        },
        {
          path: "├── @repo/api-client",
          desc: "Type-safe SDK client with token & tenant interceptors",
        },
        { path: "├── @repo/i18n", desc: "Universal locale dictionaries (en, es, fr)" },
        { path: "├── @repo/ui", desc: "Base UI primitives styled with Tailwind CSS v4" },
        { path: "└── @repo/email", desc: "React Email transactional email templates" },
      ],
    },
    {
      icon: HardDrive,
      name: "docker/ & ai_instructions/",
      badge: "Infrastructure & AI Rules",
      color: "text-amber-500",
      items: [
        {
          path: "├── docker-compose.yml",
          desc: "Local PostgreSQL 16, Redis 7, MinIO, Mailpit, Observability",
        },
        {
          path: "└── ai_instructions/",
          desc: "Enforced coding rules & single-responsibility constraints",
        },
      ],
    },
  ];

  return (
    <section id="structure" className="scroll-mt-24 w-full space-y-6">
      <div className="flex flex-col items-center text-center space-y-2 max-w-3xl mx-auto">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5"
        >
          {t("architecture.tree.tag", "Monorepo Organization")}
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("architecture.tree.title", "Unified Monorepo Architecture Directory Tree")}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t(
            "architecture.tree.subtitle",
            "Single comprehensive architectural view of all workspaces.",
          )}
        </p>
      </div>

      <Card className="w-full max-w-5xl mx-auto rounded-2xl border border-muted/70 bg-background/50 backdrop-blur-xs font-mono text-xs shadow-xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b border-muted/50 bg-muted/20 flex flex-row items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-foreground text-xs sm:text-sm">
            <FolderTree className="size-4 text-primary" />
            <span>monorepo/</span>
          </span>
          <Badge variant="outline" className="text-[10px] font-mono">
            Zero-Leak Clean Boundaries
          </Badge>
        </CardHeader>

        <CardContent className="p-5 space-y-6">
          {treeSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div key={sec.name} className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-muted/30">
                  <span
                    className={`font-bold flex items-center gap-2 text-xs sm:text-sm ${sec.color}`}
                  >
                    <Icon className="size-4" />
                    {sec.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-sans font-medium">
                    {sec.badge}
                  </span>
                </div>

                <div className="pl-2 sm:pl-4 space-y-1.5 leading-relaxed text-[11px]">
                  {sec.items.map((item) => (
                    <div key={item.path} className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                        <span className="text-foreground font-semibold">{item.path}</span>
                        <span className="text-muted-foreground font-sans text-[11px]">
                          — {item.desc}
                        </span>
                      </div>
                      {item.children?.map((child) => (
                        <div
                          key={child.path}
                          className="pl-6 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2"
                        >
                          <span className={`font-semibold ${child.color}`}>{child.path}</span>
                          <span className="text-muted-foreground font-sans text-[10px]">
                            — {child.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
