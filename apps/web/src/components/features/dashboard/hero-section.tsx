import { useTranslation } from "react-i18next";
import { Badge } from "@repo/ui";
import { useAuthStore } from "@/stores/auth.store";

export function DashboardHeroSection() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center gap-2">
        <span className="eyebrow">Enterprise Starter</span>
        <Badge variant="green" className="text-[10px]">
          Ready to Build
        </Badge>
      </div>
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1]">
        {t("dashboard.title")}
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-3xl font-normal leading-relaxed">
        {t("dashboard.welcome", { name: user?.name ?? user?.email ?? "Engineer" })}. A
        production-grade TypeScript modular monolith foundation built for ERP, Facility Management,
        or custom enterprise applications.
      </p>
    </section>
  );
}
