import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Layers3, Moon, Sun, ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuthStore } from "@/stores/auth.store";
import { NavLanguageDropdown } from "./nav-language-dropdown";

export function ArchitectureNav() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const signedIn = Boolean(useAuthStore((state) => state.user));

  const cycleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Layers3 className="size-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight">{t("common.appName")}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
              Modular Monolith
            </span>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex ms-1 text-[11px] font-medium">
            NestJS 11 · Fastify 5 · React 19
          </Badge>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium me-2">
            <a
              href="#decisions"
              className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs font-semibold"
            >
              Decisions
            </a>
            <a
              href="#layers"
              className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs font-semibold"
            >
              Layers
            </a>
            <a
              href="#lifecycle"
              className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs font-semibold"
            >
              Request Flow
            </a>
            <a
              href="#services"
              className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs font-semibold"
            >
              Services
            </a>
            <a
              href="#structure"
              className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs font-semibold"
            >
              Code Map
            </a>
            <a
              href="#tooling"
              className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs font-semibold"
            >
              Tooling
            </a>
          </nav>

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex gap-1.5 text-xs h-8"
            render={<a href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer" />}
          >
            <BookOpen className="size-3.5 text-primary" />
            <span>Scalar Docs</span>
          </Button>

          <NavLanguageDropdown />

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={cycleTheme}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 font-medium shadow-sm"
            render={<Link to={signedIn ? "/dashboard" : "/auth"} />}
          >
            <span>{signedIn ? t("dashboard.title") : t("home.proceed")}</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
