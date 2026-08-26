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

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const result = await api.auth.forgotPassword({ body: { email } });
      if (result.status !== 200) {
        setError(getResponseMessage(result.body) ?? t("common.error"));
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
          Recovery
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {t("auth.forgotPassword")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("auth.forgotDescription")}
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
            <Label htmlFor="email" className="text-xs font-medium text-foreground">
              {t("auth.email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? t("auth.sending") : t("auth.sendResetLink")}
          </Button>
        </form>
        <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border pt-4">
          {t("auth.rememberPassword")}{" "}
          <Link to="/login" className="text-foreground font-semibold hover:underline">
            {t("auth.signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/forgot-password")({ component: ForgotPasswordPage });
