import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput } from "@repo/contracts";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@repo/ui";
import { api } from "@/lib/api";
import { getResponseMessage } from "@/lib/api-response";
import { useAuthStore } from "@/stores/auth.store";
import { validateInvitationSearch } from "@/lib/invitation-search";

function RegisterPage() {
  const { t } = useTranslation();
  const { invitationToken } = Route.useSearch();
  const [error, setError] = useState("");
  const login = useAuthStore((s) => s.login);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const onSubmit = async (data: RegisterInput) => {
    setError("");
    try {
      const r = await api.auth.register({ body: data });
      if (r.status !== 201) {
        setError(getResponseMessage(r.body) ?? t("auth.registerFailed"));
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
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.createAccount")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.registerDescription")}</p>
      </div>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Create workspace account</CardTitle>
          <CardDescription className="text-xs">B12 • CQRS + neverthrow • Zod</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium">{t("auth.name")}</Label>
              <Input id="name" placeholder={t("auth.namePlaceholder")} className="h-9" required {...register("name")} />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder={t("auth.emailPlaceholder")} className="h-9" required {...register("email")} />
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">{t("auth.password")}</Label>
              <Input id="password" type="password" placeholder={t("auth.passwordPlaceholder")} className="h-9" required {...register("password")} />
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full h-9 font-medium shadow-sm" disabled={isSubmitting}>{isSubmitting ? t("auth.creatingAccount") : t("auth.createAccount")}</Button>
            <p className="text-center text-xs text-muted-foreground">
              {t("auth.hasAccount")}{" "}
              <Link to="/login" search={{ invitationToken }} className="font-medium text-primary underline underline-offset-4">{t("auth.signIn")}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/_auth/register")({ validateSearch: validateInvitationSearch, component: RegisterPage });
