import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@repo/ui/components/ui/badge";
import { layersData } from "./layers-data";
import { LayerDetailCard } from "./layer-detail-card";

export function ArchitectureLayerExplorer() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("presentation");

  const currentLayer = layersData.find((l) => l.id === activeTab) ?? layersData[0];

  return (
    <section id="layers" className="scroll-mt-24 w-full space-y-6">
      <div className="flex flex-col items-center text-center space-y-2 max-w-3xl mx-auto">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5"
        >
          {t("architecture.layers.tag")}
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("architecture.layers.title")}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t("architecture.layers.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-muted/40 border border-muted/80 rounded-2xl max-w-4xl mx-auto">
        {layersData.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeTab === layer.id;
          const titleKey = `architecture.layers.items.${layer.key}.title`;
          const title = t(titleKey, layer.defaultTitle);
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveTab(layer.id)}
              className={`flex items-center gap-2 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer outline-none ${
                isActive
                  ? "bg-background text-foreground shadow-xs border border-muted/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
            >
              <Icon className={`size-4 ${layer.color}`} />
              <span>{title}</span>
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-6xl mx-auto pt-2">
        <LayerDetailCard layer={currentLayer} />
      </div>
    </section>
  );
}
