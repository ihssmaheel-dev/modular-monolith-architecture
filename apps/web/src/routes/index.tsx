import { createFileRoute } from "@tanstack/react-router";
import { ArchitectureNav } from "@/components/architecture/architecture-nav";
import { ArchitectureHero } from "@/components/architecture/architecture-hero";
import { ArchitectureDecisionPillars } from "@/components/architecture/architecture-decision-pillars";
import { ArchitectureLayerExplorer } from "@/components/architecture/architecture-layer-explorer";
import { ArchitectureLifecycleFlow } from "@/components/architecture/architecture-lifecycle-flow";
import { ArchitectureServicesMatrix } from "@/components/architecture/architecture-services-matrix";
import { ArchitectureFolderTree } from "@/components/architecture/architecture-folder-tree";
import { ArchitectureDevExperience } from "@/components/architecture/architecture-dev-experience";
import { ArchitectureTechStack } from "@/components/architecture/architecture-tech-stack";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="min-h-svh bg-muted/20 text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <ArchitectureNav />
      <main className="mx-auto max-w-7xl space-y-24 px-4 py-10 sm:px-6 sm:py-16">
        <ArchitectureHero />
        <ArchitectureDecisionPillars />
        <ArchitectureLayerExplorer />
        <ArchitectureLifecycleFlow />
        <ArchitectureServicesMatrix />
        <ArchitectureFolderTree />
        <ArchitectureDevExperience />
        <ArchitectureTechStack />
      </main>

      <footer className="border-t bg-background py-10 text-center text-xs text-muted-foreground mt-20">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Enterprise Modular Monolith Architecture. Clean Architecture + CQRS Lite.</p>
          <div className="flex items-center gap-4">
            <a
              href="http://localhost:3000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Scalar API Docs
            </a>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Grafana
            </a>
            <a
              href="http://localhost:16686"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Jaeger
            </a>
            <a
              href="http://localhost:8025"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Mailpit
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
