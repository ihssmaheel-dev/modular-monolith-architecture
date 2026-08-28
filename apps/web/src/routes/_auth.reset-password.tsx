import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema, type ResetPasswordInput } from "@repo/contracts";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@repo/ui";
import { api } from "@/lib/api";
import { getResponseMessage } from "@/lib/api-response";

function ResetPage() {
  const { t } = useTranslation();
  const { token } = useSearch({ strict: false }) as { token?: string };
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Omit<ResetPasswordInput, "token">>({
    resolver: zodResolver(ResetPasswordSchema.omit({ token: true })),
    defaultValues: { password: "" },
  });
  const onSubmit = async (data: Omit<ResetPasswordInput, "token">) => {
    if (!token) {
      setError(t("auth.invalidToken"));
      return;
    }
    setError("");
    try {
      const r = await api.auth.resetPassword({ body: { token, password: data.password } });
      if (r.status !== 200) {
        setError(getResponseMessage(r.body) ?? t("auth.resetFailed"));
        return;
      }
      setDone(true);
    } catch {
      setError(t("errors.networkError"));
    }
  };
  if (done) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("auth.passwordReset")}</CardTitle>
          <CardDescription className="text-xs">{t("auth.passwordResetDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/login"><Button className="w-full h-9">Continue to login</Button></Link>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.resetPassword")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.resetDescription")}</p>
      </div>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Choose new password</CardTitle>
          <CardDescription className="text-xs">B12 • Argon2 • 8+ chars</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">{t("auth.newPassword")}</Label>
              <Input id="password" type="password" placeholder={t("auth.passwordPlaceholder")} className="h-9" required {...register("password")} />
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full h-9 font-medium shadow-sm" disabled={isSubmitting || !token}>{isSubmitting ? t("common.saving") : t("auth.resetPassword")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_auth/reset-password")({ component: ResetPage });
