import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { LAYER_COLORS, type FlowLayer } from "./flow/flow-types";
import { FlowDiagram } from "./flow/flow-diagram";
import { getFlowNodes, getFlowEdges } from "./flow/flow-get-data";
import { postFlowNodes, postFlowEdges } from "./flow/flow-post-data";

const LAYERS: FlowLayer[] = [
  "Presentation",
  "Application",
  "Domain",
  "Infrastructure",
  "Background",
];

export function ArchitectureFlowSection() {
  const { t } = useTranslation();
  const [activeFlow, setActiveFlow] = useState<"get" | "post">("get");

  return (
    <section id="lifecycle" className="scroll-mt-24 w-full space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          {t("architecture.lifecycle.tag")}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t("architecture.lifecycle.title")}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          {t("architecture.lifecycle.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("architecture.flow.legend")}
        </span>
        {LAYERS.map((layer) => {
          const colors = LAYER_COLORS[layer];
          return (
            <div key={layer} className="flex items-center gap-1.5">
              <div className={`size-2.5 rounded-full ${colors.dot}`} />
              <span className="text-xs font-medium text-muted-foreground">{layer}</span>
            </div>
          );
        })}
      </div>

      <Tabs
        value={activeFlow}
        onValueChange={(v) => setActiveFlow(v as "get" | "post")}
        className="w-full space-y-4"
      >
        <TabsList className="p-1 bg-muted/40 border border-muted/80 rounded-xl h-auto">
          <TabsTrigger
            value="get"
            className="gap-2 py-2 px-4 text-xs sm:text-sm font-semibold cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-xs"
          >
            <ArrowDownRight className="size-4 text-blue-500" />
            <span>{t("architecture.lifecycle.getTab")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="post"
            className="gap-2 py-2 px-4 text-xs sm:text-sm font-semibold cursor-pointer data-[state=active]:bg-background data-[state=active]:shadow-xs"
          >
            <ArrowUpRight className="size-4 text-emerald-500" />
            <span>{t("architecture.lifecycle.postTab")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="get" className="outline-none animate-in fade-in-50 duration-200">
          <FlowDiagram nodes={getFlowNodes} edges={getFlowEdges} />
        </TabsContent>
        <TabsContent value="post" className="outline-none animate-in fade-in-50 duration-200">
          <FlowDiagram nodes={postFlowNodes} edges={postFlowEdges} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
