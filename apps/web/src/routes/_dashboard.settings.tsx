import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@repo/ui";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { Palette, Shield, HardDrive } from "lucide-react";

function SettingsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="border-b border-border pb-6 space-y-1">
        <span className="eyebrow">Preferences & System</span>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("settings.description")}</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Card */}
        <Card variant="featured">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <Palette className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">{t("settings.appearance")}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {t("settings.appearanceDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Color Mode</p>
              <p className="text-xs text-muted-foreground">Toggle between light canvas and dark mode</p>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* Security & Account Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Account & Security</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Authenticated user details & security profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">User ID</span>
                <p className="font-mono text-xs text-foreground">{user?.id ?? "--"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Email Address</span>
                <p className="font-mono text-xs text-foreground">{user?.email ?? "--"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Active Tenant / Organization</span>
                <p className="font-mono text-xs text-foreground">
                  {activeTenantId ? activeTenantId : "Global / Single-Tenant"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Authorization Role</span>
                <div>
                  <Badge variant="outline" className="text-[11px] font-mono">
                    {user?.role ?? "member"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure & Architecture Info */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <HardDrive className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Architecture Configuration</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Core runtime stack and infrastructure drivers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 border-t border-border text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Backend Runtime</span>
              <span className="font-mono text-foreground">NestJS 11 + Fastify 5</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-border">
              <span className="text-muted-foreground">Database & ORM</span>
              <span className="font-mono text-foreground">PostgreSQL 16 + Drizzle ORM</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-border">
              <span className="text-muted-foreground">Async & Queues</span>
              <span className="font-mono text-foreground">Redis 7 + BullMQ + Piscina 5</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-border">
              <span className="text-muted-foreground">UI Design System</span>
              <span className="font-mono text-foreground">Radix UI + Tailwind CSS v4</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/settings")({
  component: SettingsPage,
});
