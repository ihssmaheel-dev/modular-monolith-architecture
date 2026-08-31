import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownRight, ArrowUpRight, GitFork } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { FlowStepNode } from "./flow-step-node";
import { LAYER_THEMES, type FlowLayer } from "./flow-pipeline-types";
import { getPipelineSteps } from "./flow-pipeline-get";
import {
  postPipelineStepsSync,
  postPipelineStepResponse,
  postPipelineStepsAsync,
} from "./flow-pipeline-post";

const LAYERS: FlowLayer[] = [
  "Presentation",
  "Application",
  "Domain",
  "Infrastructure",
  "Background",
];

export function ArchitectureFlowPipeline() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"get" | "post">("get");

  return (
    <section id="lifecycle" className="scroll-mt-24 w-full space-y-6">
      <div className="flex flex-col items-center text-center space-y-2 max-w-3xl mx-auto">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5"
        >
          {t("architecture.flows.tag", "End-to-End Execution Lifecycles")}
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("architecture.flows.title", "API Request Lifecycle & Pipeline Traces")}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t(
            "architecture.flows.subtitle",
            "Chronological step-by-step pipeline showing exact execution order.",
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 max-w-6xl mx-auto py-1">
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-muted/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("get")}
            className={`flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "get"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <ArrowDownRight className="size-3.5 text-blue-500" />
            <span>{t("architecture.flows.getTab", "HTTP GET (Query)")}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("post")}
            className={`flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "post"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            <ArrowUpRight className="size-3.5 text-emerald-500" />
            <span>{t("architecture.flows.postTab", "HTTP POST (Mutation)")}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {LAYERS.map((layer) => (
            <div
              key={layer}
              className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"
            >
              <span
                className={`size-2 rounded-full ${LAYER_THEMES[layer].bg} border border-current`}
              />
              <span>{layer}</span>
            </div>
          ))}
        </div>
      </div>

      {activeTab === "get" ? (
        <div className="w-full max-w-6xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-2">
            {getPipelineSteps.slice(0, 4).map((step, idx) => (
              <FlowStepNode key={step.stepNumber} step={step} showArrow={idx < 3} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-2">
            {getPipelineSteps.slice(4, 8).map((step, idx) => (
              <FlowStepNode key={step.stepNumber} step={step} showArrow={idx < 3} />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {postPipelineStepsSync.slice(0, 3).map((step, idx) => (
              <FlowStepNode key={step.stepNumber} step={step} showArrow={idx < 2} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {postPipelineStepsSync.slice(3, 6).map((step, idx) => (
              <FlowStepNode key={step.stepNumber} step={step} showArrow={idx < 2} />
            ))}
          </div>

          <div className="p-4 rounded-2xl border border-muted/70 bg-muted/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <GitFork className="size-4 text-purple-500" />
              <span>{t("architecture.flows.asyncBranch", "Post-Transaction Execution Fork")}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider font-mono">
                  {t("architecture.flows.responseBranch", "Direct Client Return")}
                </span>
                <FlowStepNode step={postPipelineStepResponse} showArrow={false} />
              </div>

              <div className="lg:col-span-2 space-y-1.5">
                <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider font-mono">
                  {t("architecture.flows.asyncBranch", "Transactional Outbox Relay")}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {postPipelineStepsAsync.map((step, idx) => (
                    <FlowStepNode key={step.stepNumber} step={step} showArrow={idx < 1} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
