import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoginSchema, RegisterSchema, type LoginInput, type RegisterInput } from "@repo/contracts";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useAuthStore } from "@/stores/auth.store";
import { getApiClient } from "@/lib/api";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const client = getApiClient();
      const res = await client.auth.login({ body: data });
      if (res.status !== 200) throw new Error("api.auth.loginFailed");
      return res.body;
    },
    onSuccess: (data) => {
      setAuth(data);
      navigate({ to: "/dashboard" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const client = getApiClient();
      const res = await client.auth.register({ body: data });
      if (res.status !== 201 && res.status !== 200) throw new Error("api.auth.registrationFailed");
      return res.body;
    },
    onSuccess: (data) => {
      setAuth(data);
      navigate({ to: "/dashboard" });
    },
  });

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{t("auth.welcomeBack")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.loginDescription")}</p>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
            <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>{t("auth.login")}</CardTitle>
                <CardDescription>{t("auth.loginDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t("auth.password")}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t("auth.passwordPlaceholder")}
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  {loginMutation.isError && (
                    <p className="text-sm text-destructive">{t("auth.loginFailed")}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
                  </Button>
                  <div className="text-center text-sm">
                    <Link
                      to="/"
                      className="text-muted-foreground underline-offset-4 hover:underline"
                    >
                      {t("common.back")}
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>{t("auth.createAccountTitle")}</CardTitle>
                <CardDescription>{t("auth.registerDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">{t("auth.name")}</Label>
                    <Input
                      id="reg-name"
                      placeholder={t("auth.namePlaceholder")}
                      {...registerForm.register("name")}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">{t("auth.email")}</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">{t("auth.password")}</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder={t("auth.createPasswordPlaceholder")}
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t("auth.termsNotice")}</p>
                  {registerMutation.isError && (
                    <p className="text-sm text-destructive">{t("auth.registrationFailed")}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {registerMutation.isPending
                      ? t("auth.creatingAccount")
                      : t("auth.createAccount")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
