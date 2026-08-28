import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@repo/contracts";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Separator } from "@repo/ui";
import { api } from "@/lib/api";
import { getResponseMessage } from "@/lib/api-response";
import { useAuthStore } from "@/stores/auth.store";
import { validateInvitationSearch } from "@/lib/invitation-search";
import { ShieldCheck } from "lucide-react";

function LoginPage() {
  const { t } = useTranslation();
  const { invitationToken } = Route.useSearch();
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      const r = await api.auth.login({ body: data });
      if (r.status !== 200) {
        setError(getResponseMessage(r.body) ?? t("auth.loginFailed"));
        return;
      }
      login({ user: r.body.user });
    } catch {
      setError(t("errors.networkError"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.welcomeBack")}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("auth.loginDescription")}</p>
      </div>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base">Sign in to your workspace</CardTitle>
          <CardDescription className="text-xs">B12 Enterprise • Enter email and password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder={t("auth.emailPlaceholder")} autoComplete="email" className="h-9 bg-background border-input focus-visible:border-primary/30 focus-visible:ring-primary/20" required {...register("email")} />
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">{t("auth.password")}</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4">{t("auth.forgotPassword")}</Link>
              </div>
              <Input id="password" type="password" placeholder={t("auth.passwordPlaceholder")} autoComplete="current-password" className="h-9 bg-background border-input focus-visible:border-primary/30 focus-visible:ring-primary/20" required {...register("password")} />
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full h-9 font-medium shadow-sm" disabled={isSubmitting}>{isSubmitting ? t("auth.signingIn") : t("auth.signIn")}</Button>
            <div className="flex items-center gap-3 py-1">
              <Separator className="flex-1" />
              <span className="text-[11px] text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>
            <div className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secured by Argon2 • JWT • RLS
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <Link to="/register" search={{ invitationToken }} className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">{t("auth.register")}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-[11px] text-muted-foreground">By signing in you agree to terms • B12 audit immutable</p>
    </div>
  );
}

export const Route = createFileRoute("/_auth/login")({ validateSearch: validateInvitationSearch, component: LoginPage });
