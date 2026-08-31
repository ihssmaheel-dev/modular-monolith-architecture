import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArchitectureBackground } from "@/components/architecture/architecture-background";
import { ArchitectureNav } from "@/components/architecture/architecture-nav";
import { ArchitectureHero } from "@/components/architecture/architecture-hero";
import { ArchitectureTechStack } from "@/components/architecture/architecture-tech-stack";
import { ArchitectureDecisionPillars } from "@/components/architecture/architecture-decision-pillars";
import { ArchitectureLayerExplorer } from "@/components/architecture/architecture-layer-explorer";
import { ArchitectureFlowPipeline } from "@/components/architecture/architecture-flow-pipeline";
import { ArchitectureServicesMatrix } from "@/components/architecture/architecture-services-matrix";
import { ArchitectureFolderTree } from "@/components/architecture/architecture-folder-tree";

export const Route = createFileRoute("/")({ component: IndexPage });

function IndexPage() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen w-full bg-background font-sans overflow-x-hidden">
      <ArchitectureBackground />
      <ArchitectureNav />

      <main className="w-full space-y-20 px-4 py-6 sm:px-8 sm:py-12 lg:px-12 xl:px-16 pb-28">
        <ArchitectureHero />
        <ArchitectureTechStack />
        <ArchitectureDecisionPillars />
        <ArchitectureLayerExplorer />
        <ArchitectureFlowPipeline />
        <ArchitectureServicesMatrix />
        <ArchitectureFolderTree />
      </main>

      <footer className="w-full border-t bg-background/80 py-8 px-4 sm:px-8 lg:px-12 xl:px-16 text-center text-xs text-muted-foreground font-mono">
        {t(
          "architecture.footer",
          "Enterprise Modular Monolith · Built with Fastify 5, NestJS 11, React 19 & TanStack Start",
        )}
      </footer>
    </div>
  );
}
