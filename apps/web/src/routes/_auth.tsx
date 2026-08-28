import { createFileRoute, Navigate, Outlet, useSearch, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import type { InvitationSearch } from "@/lib/invitation-search";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Building2, Shield, Layers, Activity, CheckCircle2 } from "lucide-react";

function AuthLayout() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { invitationToken } = useSearch({ strict: false }) as InvitationSearch;
  if (isAuthenticated) {
    if (invitationToken) return <Navigate to="/accept-invitation" search={{ token: invitationToken }} replace />;
    return <Navigate to="/" replace />;
  }
  return (
    <div className="min-h-svh grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between border-r border-border bg-muted/20 p-10">
        <div>
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Building2 className="size-4" />
            </div>
            <span className="text-base tracking-tight">{t("common.appName")}</span>
            <span className="ml-2 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">B12</span>
          </Link>
          <div className="mt-16 space-y-8 max-w-sm">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight leading-tight">Build enterprise systems, not boilerplate.</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">Modular monolith — CQRS, multi-tenant, RBAC + FGA, 1-command reskin.</p>
            </div>
            <div className="space-y-3 pt-2">
              {[
                { icon: Shield, title: "Security first", desc: "Argon2 · JWT · RLS · audit immutable" },
                { icon: Layers, title: "Vertical slices", desc: "pnpm generate:feature → 7 layers wired" },
                { icon: Activity, title: "Observable", desc: "Grafana · Prometheus · Loki · Jaeger" },
              ].map((f) => (
                <div key={f.title} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border shadow-sm">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-medium">B12 Enterprise preset active — indigo primary, OKLCH</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Workspace • Modular Monolith • MIT</p>
      </div>
      <div className="flex flex-col">
        <div className="flex h-14 items-center justify-between border-b border-border px-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-sm tracking-tight">{t("common.appName")}</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="hidden lg:flex h-14 items-center justify-end px-6">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-[360px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({ component: AuthLayout });
