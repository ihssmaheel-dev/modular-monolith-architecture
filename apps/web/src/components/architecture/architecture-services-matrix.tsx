import { useTranslation } from "react-i18next";
import { Badge } from "@repo/ui/components/ui/badge";
import { servicesData } from "./services-data";
import { ServiceCard } from "./service-card";

export function ArchitectureServicesMatrix() {
  const { t } = useTranslation();
  return (
    <section id="services" className="scroll-mt-24 w-full space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          {t("architecture.services.tag")}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t("architecture.services.title")}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          {t("architecture.services.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {servicesData.map((svc) => (
          <ServiceCard key={svc.name} service={svc} />
        ))}
      </div>
    </section>
  );
}
