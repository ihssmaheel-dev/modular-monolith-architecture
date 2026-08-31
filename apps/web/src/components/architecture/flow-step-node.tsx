import { ArrowRight, FileCode } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { LAYER_THEMES, type PipelineStep } from "./flow-pipeline-types";

interface FlowStepNodeProps {
  step: PipelineStep;
  isLast?: boolean;
  showArrow?: boolean;
}

export function FlowStepNode({ step, showArrow = true }: FlowStepNodeProps) {
  const Icon = step.icon;
  const theme = LAYER_THEMES[step.layer];

  return (
    <div className="relative flex flex-col md:flex-row items-center gap-2 group">
      <Card
        className={`w-full sm:w-[260px] min-h-[170px] flex flex-col justify-between rounded-2xl border border-muted/70 bg-background/60 backdrop-blur-xs p-3.5 shadow-xs transition-all duration-200 ${theme.border} hover:shadow-md`}
      >
        <CardHeader className="p-0 space-y-2">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`flex size-6 items-center justify-center rounded-lg text-xs font-bold ${theme.bg} ${theme.text}`}
              >
                {step.stepNumber}
              </span>
              <Icon className={`size-4 ${theme.text}`} />
            </div>
            <Badge
              variant="outline"
              className={`text-[9px] font-mono font-medium py-0 px-1.5 ${theme.badge}`}
            >
              {step.layer}
            </Badge>
          </div>

          <CardTitle className="text-xs font-bold text-foreground leading-snug truncate">
            {step.title}
          </CardTitle>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
            {step.description}
          </p>
        </CardHeader>

        <CardContent className="p-0 pt-2.5 space-y-1.5 border-t border-muted/40">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 font-mono truncate">
            <FileCode className="size-3 shrink-0 text-primary/70" />
            <span className="truncate">{step.file.split("/").slice(-2).join("/")}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground text-[9px]">Out:</span>
            <span className="font-semibold text-foreground/90 truncate max-w-[190px]">
              {step.output}
            </span>
          </div>
        </CardContent>
      </Card>

      {showArrow && (
        <div className="hidden lg:flex shrink-0 items-center justify-center text-muted-foreground/50 group-hover:text-primary transition-colors">
          <ArrowRight className="size-4 animate-pulse" />
        </div>
      )}
    </div>
  );
}
