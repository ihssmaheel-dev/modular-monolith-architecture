import { useTranslation } from "react-i18next";
import { Badge } from "@repo/ui/components/ui/badge";
import { pillarsData } from "./pillars-data";
import { PillarCard } from "./pillar-card";

export function ArchitectureDecisionPillars() {
  const { t } = useTranslation();
  return (
    <section id="decisions" className="scroll-mt-24 w-full space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          {t("architecture.decisions.tag")}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t("architecture.decisions.title")}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          {t("architecture.decisions.subtitle")}
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
