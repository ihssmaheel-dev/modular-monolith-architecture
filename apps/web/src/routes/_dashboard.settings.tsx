import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("settings.title")}</h2>
        <p className="text-muted-foreground">{t("settings.description")}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-medium">{t("settings.appearance")}</h3>
        <p className="text-sm text-muted-foreground">{t("settings.appearanceDescription")}</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-medium">{t("settings.notifications")}</h3>
        <p className="text-sm text-muted-foreground">{t("settings.notificationsDescription")}</p>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/settings")({
  component: SettingsPage,
});
