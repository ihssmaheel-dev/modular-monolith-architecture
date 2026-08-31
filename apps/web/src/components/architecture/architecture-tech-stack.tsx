import { useTranslation } from "react-i18next";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { techItems } from "./tech-stack-data";

export function ArchitectureTechStack() {
  const { t } = useTranslation();

  return (
    <section id="techstack" className="scroll-mt-24 w-full space-y-6">
      <div className="flex flex-col items-center text-center space-y-2 max-w-3xl mx-auto">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary border-primary/30 bg-primary/5"
        >
          {t("architecture.techStack.tag")}
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("architecture.techStack.title")}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t("architecture.techStack.subtitle")}
        </p>
      </div>

      <TooltipProvider delay={50}>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-5xl mx-auto py-2">
          {techItems.map((item) => {
            const Logo = item.logo;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="group relative flex size-14 sm:size-16 items-center justify-center rounded-2xl border border-muted/70 bg-background/60 backdrop-blur-xs p-3 shadow-xs hover:shadow-md hover:border-primary/50 hover:bg-background/90 hover:scale-105 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={item.name}
                    />
                  }
                >
                  <Logo className="size-8 sm:size-9 transition-transform duration-200 group-hover:scale-110" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="flex flex-col items-center gap-0.5 p-2.5 text-center"
                >
                  <span className="font-bold text-xs">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground/80">{item.role}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </section>
  );
}
