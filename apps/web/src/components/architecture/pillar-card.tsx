import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const Icon = pillar.icon;

  const titleKey = `architecture.decisions.items.${pillar.translationKey}.title`;
  const badgeKey = `architecture.decisions.items.${pillar.translationKey}.badge`;
  const descKey = `architecture.decisions.items.${pillar.translationKey}.description`;
  const guaranteesKey = `architecture.decisions.items.${pillar.translationKey}.guarantees`;

  const title = t(titleKey, pillar.defaultTitle);
  const badge = t(badgeKey, pillar.defaultBadge);
  const description = t(descKey, pillar.defaultDescription);
  const guaranteesRaw = t(guaranteesKey, { returnObjects: true });
  const guarantees = Array.isArray(guaranteesRaw)
    ? (guaranteesRaw as string[])
    : pillar.defaultGuarantees;

  return (
    <Card className="group flex flex-col rounded-2xl border border-muted/60 bg-background/50 backdrop-blur-xs shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-300">
      <CardHeader className="space-y-3 p-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div
            className={`flex size-10 items-center justify-center rounded-xl ${pillar.bgColor} ${pillar.color} transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon className="size-5" />
          </div>
          <Badge variant="secondary" className="text-[10px] font-medium font-mono">
            {badge}
          </Badge>
        </div>
        <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-snug">
          {title}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto p-5 pt-2">
        <div className="rounded-xl border border-muted/50 bg-muted/20 p-3.5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
            {t("architecture.decisions.guaranteesTitle", "Key Guarantees")}
          </p>
          <ul className="space-y-2">
            {guarantees.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground leading-snug"
              >
                <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
