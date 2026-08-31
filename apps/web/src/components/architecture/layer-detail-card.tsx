import { Code, CheckCircle2 } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import type { LayerItem } from "./layers-data";

export function LayerDetailCard({ layer }: { layer: LayerItem }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
      <Card className="border-muted/60 bg-background/50 backdrop-blur-sm shadow-sm flex flex-col justify-between">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="font-mono text-xs">
              {layer.badge}
            </Badge>
            <span className="text-[11px] font-mono text-muted-foreground/80">{layer.path}</span>
          </div>
          <CardTitle className="text-2xl font-bold">{layer.label.split(". ")[1]}</CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {layer.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground/90">
            Key Responsibilities:
          </p>
          <div className="space-y-2">
            {layer.responsibilities.map((resp, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-snug">{resp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-muted/60 bg-zinc-950 font-mono text-xs shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-zinc-800 bg-zinc-900 flex flex-row items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-2">
            <Code className="size-3.5 text-emerald-400" />
            Implementation Blueprint
          </span>
          <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">
            TypeScript
          </Badge>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <pre className="text-xs leading-relaxed text-zinc-300">
            <code>{layer.codeSnippet}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
