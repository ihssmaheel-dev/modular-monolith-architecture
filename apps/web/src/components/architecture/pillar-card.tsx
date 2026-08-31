import { Check } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import type { PillarItem } from "./pillars-data";

export function PillarCard({ pillar }: { pillar: PillarItem }) {
  const Icon = pillar.icon;
  return (
    <Card
      className={`flex flex-col border-muted/60 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 border-l-[3px] ${pillar.color.replace("text-", "border-l-")}`}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${pillar.bgColor} ${pillar.color}`}
          >
            <Icon className="size-5" />
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium font-mono">
            {pillar.badge}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-snug font-bold text-foreground">
          {pillar.title}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed text-muted-foreground">
          {pillar.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-2 pb-4">
        <div className="rounded-lg border border-muted/60 bg-muted/20 p-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/80">
            Key Architectural Guarantees:
          </p>
          <ul className="space-y-1.5">
            {pillar.reasons.map((reason, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground leading-tight"
              >
                <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
