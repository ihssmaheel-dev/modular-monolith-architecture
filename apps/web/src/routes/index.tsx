import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArchitectureBackground } from "@/components/architecture/architecture-background";
import { ArchitectureNav } from "@/components/architecture/architecture-nav";
import { ArchitectureHero } from "@/components/architecture/architecture-hero";
import { ArchitectureTechStack } from "@/components/architecture/architecture-tech-stack";
import { ArchitectureDecisionPillars } from "@/components/architecture/architecture-decision-pillars";
import { ArchitectureLayerExplorer } from "@/components/architecture/architecture-layer-explorer";
import { ArchitectureFlowSection } from "@/components/architecture/architecture-flow-section";
import { ArchitectureServicesMatrix } from "@/components/architecture/architecture-services-matrix";
import { ArchitectureFolderTree } from "@/components/architecture/architecture-folder-tree";
import { ArchitectureDevExperience } from "@/components/architecture/architecture-dev-experience";

export const Route = createFileRoute("/")({ component: IndexPage });

function IndexPage() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen w-full bg-background font-sans overflow-x-hidden">
      <ArchitectureBackground />
      <ArchitectureNav />

      <main className="w-full space-y-24 px-4 py-8 sm:px-8 sm:py-16 lg:px-12 xl:px-16 pb-28">
        <ArchitectureHero />
        <ArchitectureTechStack />
        <ArchitectureDecisionPillars />
        <ArchitectureLayerExplorer />
        <ArchitectureFlowSection />
        <ArchitectureServicesMatrix />
        <ArchitectureFolderTree />
        <ArchitectureDevExperience />
      </main>

      <footer className="w-full border-t bg-background/80 py-8 px-4 sm:px-8 lg:px-12 xl:px-16 text-center text-xs text-muted-foreground font-mono">
        {t("architecture.footer")}
      </footer>
    </div>
  );
}
