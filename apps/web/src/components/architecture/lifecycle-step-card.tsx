import { FileCode, ArrowDown } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import type { LifecycleStep } from "./lifecycle-flow-types";

export function LifecycleStepCard({ step, isLast }: { step: LifecycleStep; isLast: boolean }) {
  return (
    <div className="relative flex flex-col items-center w-full">
      <Card className="w-full border-muted/80 bg-background/70 backdrop-blur-xs hover:border-primary/50 transition-all shadow-xs">
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold">
                {step.stepNumber}
              </span>
              <CardTitle className="text-base font-bold text-foreground">
                {step.stageName}
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold uppercase tracking-wider ${step.layerColor}`}
            >
              {step.layer} Layer
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
        </CardHeader>

        <CardContent className="p-4 pt-1 space-y-2.5">
          <div className="rounded-md border bg-muted/30 p-2.5 space-y-1.5 font-mono text-[11px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileCode className="size-3 text-primary" />
              Source Files & Roles Touched:
            </p>
            <div className="space-y-1">
              {step.filesTouched.map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                >
                  <span className="text-primary font-medium truncate">{f.path}</span>
                  <span className="text-muted-foreground text-[10px] sm:text-right shrink-0">
                    {f.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-0.5">
            <span>Result:</span>
            <span className="text-foreground font-semibold">{step.output}</span>
          </div>
        </CardContent>
      </Card>

      {!isLast && (
        <div className="flex flex-col items-center my-2 text-primary">
          <div className="w-0.5 h-3 bg-primary/40" />
          <ArrowDown className="size-4 -mt-1 text-primary animate-bounce" />
        </div>
      )}
    </div>
  );
}
