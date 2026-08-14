import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@repo/shared";
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
import { useAuthStore } from "@/stores/auth.store";
import { validateInvitationSearch } from "@/lib/invitation-search";

function LoginPage() {
  const { t } = useTranslation();
  const { invitationToken } = Route.useSearch();
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      const result = await api.auth.login({ body: data });
      if (result.status !== 200) {
        setError(getResponseMessage(result.body) ?? t("auth.loginFailed"));
        return;
      }
      login({ user: result.body.user });
    } catch {
      setError(t("errors.networkError"));
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("auth.welcomeBack")}</CardTitle>
        <CardDescription>{t("auth.loginDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Link to="/forgot-password" className="text-sm font-medium hover:underline">
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            search={{ invitationToken }}
            className="text-primary hover:underline"
          >
            {t("auth.register")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/login")({
  validateSearch: validateInvitationSearch,
  component: LoginPage,
});
