import { useState } from "react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { layersData } from "./layers-data";
import { LayerDetailCard } from "./layer-detail-card";

export function ArchitectureLayerExplorer() {
  const [activeTab, setActiveTab] = useState("presentation");

  return (
    <section id="layers" className="scroll-mt-24 space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          Clean Architecture & Onion Layers
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Explore the 4 Layers & Monorepo Packages
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          Our architecture adheres strictly to Clean Architecture principles. Dependencies always
          point inward toward the Domain, keeping business rules independent of databases, HTTP
          frameworks, and UI clients.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto p-1 bg-muted/40 border border-muted/80 rounded-xl h-auto flex-wrap">
          {layersData.map((layer) => {
            const Icon = layer.icon;
            return (
              <TabsTrigger
                key={layer.id}
                value={layer.id}
                className="gap-2 py-2 px-3 text-xs sm:text-sm font-semibold cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-xs"
              >
                <Icon className="size-4" />
                <span>{layer.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {layersData.map((layer) => (
          <TabsContent
            key={layer.id}
            value={layer.id}
            className="space-y-6 outline-none animate-in fade-in-50 duration-200"
          >
            <LayerDetailCard layer={layer} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
