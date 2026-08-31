import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { getFlowSteps } from "./lifecycle-get-flow";
import { postFlowSteps } from "./lifecycle-post-flow";
import { LifecycleStepCard } from "./lifecycle-step-card";

export function ArchitectureLifecycleFlow() {
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

      <Tabs
        value={activeFlow}
        onValueChange={(v) => setActiveFlow(v as "get" | "post")}
        className="w-full space-y-6"
      >
        <TabsList className="p-1 bg-muted/40 border border-muted/80 rounded-xl h-auto flex flex-wrap gap-1">
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

        <TabsContent
          value="get"
          className="w-full space-y-4 outline-none animate-in fade-in-50 duration-200"
        >
          <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20 text-xs text-blue-500 font-mono">
            {t("architecture.lifecycle.getSubtitle")}
          </div>
          <div className="space-y-0 w-full max-w-4xl mx-auto">
            {getFlowSteps.map((step, idx) => (
              <LifecycleStepCard
                key={step.stepNumber}
                step={step}
                isLast={idx === getFlowSteps.length - 1}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="post"
          className="w-full space-y-4 outline-none animate-in fade-in-50 duration-200"
        >
          <div className="p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20 text-xs text-emerald-500 font-mono">
            {t("architecture.lifecycle.postSubtitle")}
          </div>
          <div className="space-y-0 w-full max-w-4xl mx-auto">
            {postFlowSteps.map((step, idx) => (
              <LifecycleStepCard
                key={step.stepNumber}
                step={step}
                isLast={idx === postFlowSteps.length - 1}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
