import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const titleKey = `architecture.layers.items.${layer.key}.title`;
  const badgeKey = `architecture.layers.items.${layer.key}.badge`;
  const descKey = `architecture.layers.items.${layer.key}.description`;
  const respKey = `architecture.layers.items.${layer.key}.responsibilities`;

  const title = t(titleKey, layer.defaultTitle);
  const badge = t(badgeKey, layer.defaultBadge);
  const description = t(descKey, layer.defaultDescription);
  const respRaw = t(respKey, { returnObjects: true });
  const responsibilities = Array.isArray(respRaw)
    ? (respRaw as string[])
    : layer.defaultResponsibilities;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1.3fr] items-stretch">
      <Card className="rounded-2xl border border-muted/60 bg-background/50 backdrop-blur-xs shadow-xs flex flex-col justify-between p-1">
        <CardHeader className="space-y-3 p-5 pb-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {badge}
            </Badge>
            <span className="text-[10px] font-mono text-muted-foreground truncate">
              {layer.path}
            </span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-5 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
            {t("architecture.layers.responsibilities", "Key Responsibilities")}:
          </p>
          <div className="space-y-2">
            {responsibilities.map((resp, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 text-xs text-muted-foreground leading-snug"
              >
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{resp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 font-mono text-xs shadow-sm flex flex-col">
        <CardHeader className="py-2.5 px-4 border-b border-zinc-800/80 bg-zinc-900/90 flex flex-row items-center justify-between">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Code className="size-3.5 text-emerald-400" />
            {t("architecture.layers.blueprint", "Implementation Blueprint")}
          </span>
          <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
            TypeScript
          </Badge>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto flex-1">
          <pre className="text-xs leading-relaxed text-zinc-300">
            <code>{layer.codeSnippet}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
