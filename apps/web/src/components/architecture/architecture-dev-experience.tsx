import { useTranslation } from "react-i18next";
import { Terminal, Copy } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { toast } from "@repo/ui/components/ui/toast";

export function ArchitectureDevExperience() {
  const { t } = useTranslation();
  const commands = [
    {
      cmd: "pnpm bootstrap",
      desc: "Automated verification of node, pnpm, and local environment files.",
    },
    {
      cmd: "pnpm generate:feature",
      desc: "Interactive CLI generator scaffolding full 4-layer CQRS vertical slices.",
    },
    {
      cmd: "pnpm rules:check",
      desc: "Verifies 0 layer violations and enforces the 150-line rule across files.",
    },
    {
      cmd: "pnpm test:unit",
      desc: "Runs all 262+ unit tests with 100% deterministic neverthrow isolation.",
    },
    {
      cmd: "pnpm db:migrate",
      desc: "Applies Drizzle ORM migrations to the local PostgreSQL database.",
    },
  ];

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    toast.add({ title: "Command copied to clipboard", type: "success" } as never);
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {commands.map((c) => (
          <Card
            key={c.cmd}
            className="border-muted/80 bg-background/60 backdrop-blur-xs font-mono text-xs shadow-xs hover:border-primary/40 transition-colors"
          >
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-primary flex items-center gap-2">
                <Terminal className="size-3.5" />
                {c.cmd}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => copyCommand(c.cmd)}
                aria-label="Copy Command"
              >
                <Copy className="size-3 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-1 font-sans text-xs text-muted-foreground leading-relaxed">
              {c.desc}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
