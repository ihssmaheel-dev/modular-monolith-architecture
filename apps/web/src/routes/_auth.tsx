import { createFileRoute, Navigate, Outlet, useSearch, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import type { InvitationSearch } from "@/lib/invitation-search";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Zap, Database, Layers } from "lucide-react";

function AuthLayout() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { invitationToken } = useSearch({ strict: false }) as InvitationSearch;

  if (isAuthenticated) {
    if (invitationToken) {
      return <Navigate to="/accept-invitation" search={{ token: invitationToken }} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* Left Column: Interactive Form */}
      <div className="flex flex-col justify-between p-6 sm:p-10 md:p-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs shadow-xs">
              MM
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              {t("common.appName")}
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm py-8">
          <Outlet />
        </div>

        <div className="text-center text-xs text-muted-foreground">
          {t("auth.termsNotice")}
        </div>
      </div>

      {/* Right Column: login-03 Showcase Visual Pane */}
      <div className="hidden lg:relative lg:flex flex-col justify-between border-l border-border bg-card/60 p-10 select-none overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />

        {/* Top badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Production Ready</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">v2.0.0</span>
        </div>

        {/* Center Feature Highlights */}
        <div className="relative z-10 space-y-6 max-w-md my-auto">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("auth.heroTagline")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("auth.heroDescription")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg border border-border bg-background/60 p-3.5 backdrop-blur-xs space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Database className="h-4 w-4 text-primary" />
                <span>Drizzle + Postgres</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Strict RLS multi-tenancy & connection pooling</p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-3.5 backdrop-blur-xs space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Zap className="h-4 w-4 text-primary" />
                <span>Distributed Cache</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Redis pub/sub invalidation & sub-ms flags</p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-3.5 backdrop-blur-xs space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Fine-Grained Auth</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Type-safe permissions & RBAC/FGA enforcement</p>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-3.5 backdrop-blur-xs space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                <Layers className="h-4 w-4 text-primary" />
                <span>End-to-End Types</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Shared contracts & unified Zod schemas</p>
            </div>
          </div>
        </div>

        {/* Bottom meta */}
        <div className="relative z-10 border-t border-border pt-4 text-xs text-muted-foreground flex items-center justify-between">
          <span>Enterprise Monorepo Standard</span>
          <span className="font-mono text-[11px]">Clean Architecture</span>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});
