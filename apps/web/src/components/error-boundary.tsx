import { useTranslation } from "react-i18next";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

export function RouteErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">{t("errors.unexpected")}</CardTitle>
          <CardDescription>{error.message || t("errors.serverError")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={reset}>
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
