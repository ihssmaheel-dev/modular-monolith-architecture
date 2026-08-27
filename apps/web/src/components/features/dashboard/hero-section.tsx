import { useTranslation } from "react-i18next";
import { Badge } from "@repo/ui";
import { useAuthStore } from "@/stores/auth.store";

export function DashboardHeroSection() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  return (
    <section className="space-y-4 py-2">
      <div className="flex items-center gap-2.5">
        <span className="eyebrow">Enterprise Starter</span>
        <Badge variant="green" className="text-[10px] font-medium tracking-widest uppercase px-2 py-0.5">
          Ready to Build
        </Badge>
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight text-foreground leading-[1.05] max-w-4xl">
        {t("dashboard.title")}
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-3xl font-normal leading-relaxed">
        {t("dashboard.welcome", { name: user?.name ?? user?.email ?? "Engineer" })} — a
        production-grade TypeScript modular monolith foundation for ERP, facility management
        and custom enterprise applications.
      </p>
    </section>
  );
}
