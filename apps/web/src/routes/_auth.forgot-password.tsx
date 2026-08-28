import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@repo/contracts";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@repo/ui";
import { api } from "@/lib/api";
import { getResponseMessage } from "@/lib/api-response";

function ForgotPage() {
  const { t } = useTranslation();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const onSubmit = async (data: ForgotPasswordInput) => {
    setError("");
    try {
      const r = await api.auth.forgotPassword({ body: data });
      if (r.status !== 200) {
        setError(getResponseMessage(r.body) ?? t("auth.requestFailed"));
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
          <CardTitle className="text-base">{t("auth.checkEmail")}</CardTitle>
          <CardDescription className="text-xs">{t("auth.checkEmailDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/login"><Button variant="outline" className="w-full h-9">{t("auth.backToLogin")}</Button></Link>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.forgotPassword")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.forgotDescription")}</p>
      </div>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Reset your password</CardTitle>
          <CardDescription className="text-xs">We’ll send a secure link • B12</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder={t("auth.emailPlaceholder")} className="h-9" required {...register("email")} />
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full h-9 font-medium shadow-sm" disabled={isSubmitting}>{isSubmitting ? t("common.sending") : t("auth.sendResetLink")}</Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/login" className="font-medium text-primary underline underline-offset-4">{t("auth.backToLogin")}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_auth/forgot-password")({ component: ForgotPage });
