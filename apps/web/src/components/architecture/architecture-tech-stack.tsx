import { useTranslation } from "react-i18next";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { techStackCategories } from "./tech-stack-data";

export function ArchitectureTechStack() {
  const { t } = useTranslation();

  return (
    <section id="techstack" className="scroll-mt-24 w-full space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          {t("architecture.techStack.tag")}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t("architecture.techStack.title")}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          {t("architecture.techStack.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {techStackCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card
              key={cat.titleKey}
              className="group border-muted/60 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
            >
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2.5">
                  <span className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    <Icon className="size-4" />
                  </span>
                  <span>{t(cat.titleKey)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-wrap gap-1.5">
                {cat.items.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="font-mono text-[11px] bg-muted/60 hover:bg-muted transition-colors"
                  >
                    {item}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
