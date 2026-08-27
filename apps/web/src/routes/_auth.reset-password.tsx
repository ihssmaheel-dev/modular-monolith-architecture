import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@repo/ui";
import { api } from "@/lib/api";
import { getResponseMessage } from "@/lib/api-response";

function ResetPasswordPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError(t("auth.invalidToken"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await api.auth.resetPassword({ body: { token, password } });
      if (result.status !== 200) {
        setError(getResponseMessage(result.body) ?? t("auth.invalidToken"));
        return;
      }
      setMessage(result.body.message);
    } catch {
      setError(t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{t("auth.resetPasswordTitle")}</CardTitle>
        <CardDescription>{t("auth.resetPasswordDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-md bg-primary/10 border border-primary/20 p-3 text-xs text-primary font-medium">
                {message}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="password">{t("auth.newPassword")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.createPasswordPlaceholder")}
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !token}>
              {loading ? t("auth.resettingPassword") : t("auth.resetPasswordTitle")}
            </Button>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <Link
              to="/login"
              className="text-foreground underline underline-offset-4 font-medium hover:text-primary"
            >
              {t("auth.backToLogin")}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/reset-password")({ component: ResetPasswordPage });
