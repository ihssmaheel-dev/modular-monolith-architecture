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
    <Card variant="featured" className="p-2 sm:p-4">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto pb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
          Security
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {t("auth.resetPasswordTitle")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("auth.resetPasswordDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-sm bg-[#00d722]/10 border border-[#00d722]/30 p-3 text-xs text-[#080808] font-medium">
              {message}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-foreground">
              {t("auth.newPassword")}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("auth.createPasswordPlaceholder")}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading || !token}>
            {loading ? t("auth.resettingPassword") : t("auth.resetPasswordTitle")}
          </Button>
        </form>
        <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border pt-4">
          <Link to="/login" className="text-foreground font-semibold hover:underline">
            {t("auth.backToLogin")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/reset-password")({ component: ResetPasswordPage });
