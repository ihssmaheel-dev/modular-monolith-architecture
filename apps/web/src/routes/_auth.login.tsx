import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginInput } from "@repo/contracts";
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
    <Card variant="featured" className="p-2 sm:p-4">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto pb-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
          Authentication
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {t("auth.welcomeBack")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("auth.loginDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-foreground">
              {t("auth.email")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-foreground">
                {t("auth.password")}
              </Label>
              <Link to="/forgot-password" className="text-xs text-[#006acc] hover:underline">
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
              <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </form>
        <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border pt-4">
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            search={{ invitationToken }}
            className="text-foreground font-semibold hover:underline"
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
