import { Badge } from "@repo/ui/components/ui/badge";
import { pillarsData } from "./pillars-data";
import { PillarCard } from "./pillar-card";

export function ArchitectureDecisionPillars() {
  return (
    <section id="decisions" className="scroll-mt-24 space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          Core Architectural Principles
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Why We Built It This Way: Technical Decision Matrix
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          Every layer and pattern in this codebase was deliberately selected to balance maximum
          developer velocity, strict operational safety, and effortless maintainability for both
          humans and AI agents.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pillarsData.map((pillar) => (
          <PillarCard key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </section>
  );
}
