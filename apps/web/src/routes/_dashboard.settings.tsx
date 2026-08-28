import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@repo/ui";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { Palette, Shield, HardDrive, Info } from "lucide-react";

function SettingsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const tenant = useTenantStore((s) => s.activeTenantId);
  return (
    <PageShell>
      <PageHeader eyebrow={t("settings.eyebrow")} title={t("settings.title")} description={t("settings.description")} />
      <div className="grid gap-6">
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Palette className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">{t("settings.appearance")}</CardTitle>
            </div>
            <CardDescription className="text-xs">{t("settings.appearanceDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between border-t border-border bg-muted/20 p-4">
            <div>
              <p className="text-sm font-medium">{t("settings.colorMode")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.colorModeDescription")}</p>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple text-white shadow-sm">
                <Shield className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">{t("settings.accountSecurity")}</CardTitle>
            </div>
            <CardDescription className="text-xs">{t("settings.accountSecurityDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("users.userId")}</p>
              <p className="font-mono text-xs break-all bg-muted px-2 py-1 rounded-md border">{user?.id ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("settings.emailAddress")}</p>
              <p className="font-mono text-xs break-all bg-muted px-2 py-1 rounded-md border">{user?.email ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("settings.activeTenant")}</p>
              <p className="font-mono text-xs break-all bg-muted px-2 py-1 rounded-md border">{tenant ?? "Global • Single"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t("settings.authRole")}</p>
              <div><Badge variant="outline" className="font-mono text-xs">{user?.role ?? "member"}</Badge></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue text-white shadow-sm">
                <HardDrive className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">{t("settings.archConfig")}</CardTitle>
            </div>
            <CardDescription className="text-xs">{t("settings.archConfigDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border border-t border-border p-0">
            {[
              ["Backend", "NestJS 11 + Fastify 5", "Modular monolith"],
              ["Database", "Postgres 16 + Drizzle", "RLS + outbox"],
              ["Realtime", "Redis 7 + BullMQ", "Idempotency + streams"],
              ["UI", "Radix + Tailwind v4 • B12", "1-command reskin"],
            ].map(([k, v, sub]) => (
              <div key={k} className="flex items-center justify-between px-6 py-3.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 opacity-60" /> {k}
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-medium">{v}</p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export const Route = createFileRoute("/_dashboard/settings")({ component: SettingsPage });
