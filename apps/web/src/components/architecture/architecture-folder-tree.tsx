import { useTranslation } from "react-i18next";
import { FolderTree } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";

export function ArchitectureFolderTree() {
  const { t } = useTranslation();
  return (
    <section id="structure" className="scroll-mt-24 w-full space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          {t("architecture.structure.tag")}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t("architecture.structure.title")}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          {t("architecture.structure.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-muted/80 bg-background/60 font-mono text-xs shadow-xs">
          <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-foreground">
              <FolderTree className="size-4 text-primary" />
              apps/api/src/modules/[domain]/
            </span>
            <Badge variant="outline" className="text-[10px]">
              Strict 4-Layer
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-2 leading-relaxed">
            <p className="text-primary font-bold">├── presentation/</p>
            <p className="text-muted-foreground pl-4">
              │ ├── *.controller.ts (Fastify HTTP Routes & Result Handlers)
            </p>
            <p className="text-muted-foreground pl-4">
              │ └── *.guard.ts (Route-Level Permissions & Context)
            </p>
            <p className="text-emerald-500 font-bold">├── application/</p>
            <p className="text-muted-foreground pl-4">
              │ ├── commands/ (Single-Responsibility Mutations)
            </p>
            <p className="text-muted-foreground pl-4">
              │ ├── queries/ (Single-Responsibility Reads)
            </p>
            <p className="text-muted-foreground pl-4">
              │ └── listeners/ (Internal Domain Event Subscriptions)
            </p>
            <p className="text-amber-500 font-bold">├── domain/</p>
            <p className="text-muted-foreground pl-4">
              │ ├── entities/ (Pure TypeScript Business Models)
            </p>
            <p className="text-muted-foreground pl-4">
              │ ├── events/ (Strongly-Typed Domain Events)
            </p>
            <p className="text-muted-foreground pl-4">
              │ └── errors/ (Domain-Specific Business Errors)
            </p>
            <p className="text-purple-500 font-bold">└── infrastructure/</p>
            <p className="text-muted-foreground pl-4">
              {" "}
              ├── repositories/ (Drizzle & Tenant-Scoped Repositories)
            </p>
            <p className="text-muted-foreground pl-4">
              {" "}
              └── mappers/ (Domain Entity &lt;-&gt; Drizzle Row Mappers)
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted/80 bg-background/60 font-mono text-xs shadow-xs">
          <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-foreground">
              <FolderTree className="size-4 text-primary" />
              packages/*
            </span>
            <Badge variant="outline" className="text-[10px]">
              Monorepo Packages
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-2 leading-relaxed">
            <p className="text-blue-500 font-bold">├── @repo/contracts</p>
            <p className="text-muted-foreground pl-4">
              │ (Zod 4 schemas, oRPC contract routes, DTOs & Error Codes)
            </p>
            <p className="text-emerald-500 font-bold">├── @repo/authorization</p>
            <p className="text-muted-foreground pl-4">
              │ (Pure FGA engine: RBAC wildcards + ReBAC ownership predicates)
            </p>
            <p className="text-amber-500 font-bold">├── @repo/api-client</p>
            <p className="text-muted-foreground pl-4">
              │ (Type-safe oRPC client SDK with auto token refresh)
            </p>
            <p className="text-purple-500 font-bold">├── @repo/i18n</p>
            <p className="text-muted-foreground pl-4">
              │ (Universal JSON locale dictionaries: en, es, fr)
            </p>
            <p className="text-pink-500 font-bold">├── @repo/email</p>
            <p className="text-muted-foreground pl-4">
              │ (React Email templates: Welcome, PasswordReset, OrgInvite)
            </p>
            <p className="text-cyan-500 font-bold">└── @repo/ui</p>
            <p className="text-muted-foreground pl-4">
              {" "}
              (Accessible Base UI primitives styled with Tailwind CSS v4)
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
