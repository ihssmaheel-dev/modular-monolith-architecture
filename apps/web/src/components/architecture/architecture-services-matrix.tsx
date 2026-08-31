import { Badge } from "@repo/ui/components/ui/badge";
import { servicesData } from "./services-data";
import { ServiceCard } from "./service-card";

export function ArchitectureServicesMatrix() {
  return (
    <section id="services" className="scroll-mt-24 space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          Complete Local Infrastructure
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Local Services, Ports & Observability Matrix
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          Everything the developer needs is wired out-of-the-box via Docker Compose. Click any card
          to open the local service dashboard directly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {servicesData.map((svc) => (
          <ServiceCard key={svc.name} service={svc} />
        ))}
      </div>
    </section>
  );
}
