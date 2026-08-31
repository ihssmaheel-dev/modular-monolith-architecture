import { useTranslation } from "react-i18next";
import { Terminal, Copy } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { toast } from "@repo/ui/components/ui/toast";

const COMMANDS = [
  { cmd: "pnpm bootstrap", key: "architecture.tooling.commands.bootstrap" },
  { cmd: "pnpm generate:feature", key: "architecture.tooling.commands.generateFeature" },
  { cmd: "pnpm generate:module", key: "architecture.tooling.commands.generateModule" },
  { cmd: "pnpm rules:check", key: "architecture.tooling.commands.rulesCheck" },
  { cmd: "pnpm test:unit", key: "architecture.tooling.commands.testUnit" },
  { cmd: "pnpm db:migrate", key: "architecture.tooling.commands.dbMigrate" },
  { cmd: "pnpm docker:up", key: "architecture.tooling.commands.dockerUp" },
  { cmd: "pnpm typecheck", key: "architecture.tooling.commands.typecheck" },
] as const;

export function ArchitectureDevExperience() {
  const { t } = useTranslation();

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    toast.add({ title: t("common.copied"), type: "success" } as never);
  };

  return (
    <section id="tooling" className="scroll-mt-24 w-full space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          {t("architecture.tooling.tag")}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t("architecture.tooling.title")}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          {t("architecture.tooling.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COMMANDS.map((c) => (
          <Card
            key={c.cmd}
            className="group border-muted/60 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden"
          >
            <CardHeader className="p-0">
              <div className="flex items-center justify-between bg-zinc-900 dark:bg-zinc-950 px-3.5 py-2.5">
                <CardTitle className="text-[11px] font-bold text-emerald-400 flex items-center gap-2 font-mono">
                  <Terminal className="size-3.5 text-zinc-500" />
                  <span className="text-zinc-400">$</span> {c.cmd}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 text-zinc-500 hover:text-zinc-300"
                  onClick={() => copyCommand(c.cmd)}
                  aria-label="Copy"
                >
                  <Copy className="size-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3.5 text-xs text-muted-foreground leading-relaxed">
              {t(c.key)}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
