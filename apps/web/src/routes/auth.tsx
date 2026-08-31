import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Layers } from "lucide-react";
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

export const Route = createFileRoute("/auth")({ component: AuthPage });

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null;
}

function PasswordInput({
  id,
  register,
  placeholder,
  invalid,
  showLabel,
  hideLabel,
}: {
  id: string;
  register: UseFormRegister<LoginInput | RegisterInput>;
  placeholder: string;
  invalid?: boolean;
  showLabel: string;
  hideLabel: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        aria-invalid={invalid}
        className="pe-10"
        {...register("password")}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute end-1 top-1/2 size-7 -translate-y-1/2"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? hideLabel : showLabel}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
}

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });
  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const loginMutation = useMutation({
    mutationFn: async (body: LoginInput) => {
      const response = await getApiClient().auth.login({ body });
      if (response.status !== 200)
        throw new Error(response.status === 401 ? "auth.invalidCredentials" : "auth.loginFailed");
      return response.body;
    },
    onSuccess: (data) => {
      setAuth(data);
      navigate({ to: "/dashboard" });
    },
  });
  const registerMutation = useMutation({
    mutationFn: async (body: RegisterInput) => {
      const response = await getApiClient().auth.register({ body });
      if (![200, 201].includes(response.status))
        throw new Error(response.status === 409 ? "auth.emailTaken" : "auth.registrationFailed");
      return response.body;
    },
    onSuccess: (data) => {
      setAuth(data);
      navigate({ to: "/dashboard" });
    },
  });
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Layers className="size-5" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("auth.welcomeBack")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.loginDescription")}</p>
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
                  onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t("auth.email")}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={Boolean(loginForm.formState.errors.email)}
                      {...loginForm.register("email")}
                    />
                    <FieldError message={loginForm.formState.errors.email?.message} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">{t("auth.password")}</Label>
                      <Link
                        to="/auth/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        {t("auth.forgotPassword")}
                      </Link>
                    </div>
                    <PasswordInput
                      id="login-password"
                      register={loginForm.register}
                      placeholder={t("auth.passwordPlaceholder")}
                      invalid={Boolean(loginForm.formState.errors.password)}
                      showLabel={t("auth.showPassword")}
                      hideLabel={t("auth.hidePassword")}
                    />
                    <FieldError message={loginForm.formState.errors.password?.message} />
                  </div>
                  {loginMutation.isError && (
                    <p className="text-sm text-destructive">{t(loginMutation.error.message)}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
                  </Button>
                  <Link
                    to="/"
                    className="block text-center text-sm text-muted-foreground hover:underline"
                  >
                    {t("common.back")}
                  </Link>
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
                  onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">{t("auth.name")}</Label>
                    <Input
                      id="reg-name"
                      autoComplete="name"
                      aria-invalid={Boolean(registerForm.formState.errors.name)}
                      {...registerForm.register("name")}
                    />
                    <FieldError message={registerForm.formState.errors.name?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">{t("auth.email")}</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={Boolean(registerForm.formState.errors.email)}
                      {...registerForm.register("email")}
                    />
                    <FieldError message={registerForm.formState.errors.email?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">{t("auth.password")}</Label>
                    <PasswordInput
                      id="reg-password"
                      register={registerForm.register}
                      placeholder={t("auth.createPasswordPlaceholder")}
                      invalid={Boolean(registerForm.formState.errors.password)}
                      showLabel={t("auth.showPassword")}
                      hideLabel={t("auth.hidePassword")}
                    />
                    <FieldError message={registerForm.formState.errors.password?.message} />
                  </div>
                  <p className="text-xs text-muted-foreground">{t("auth.termsNotice")}</p>
                  {registerMutation.isError && (
                    <p className="text-sm text-destructive">{t(registerMutation.error.message)}</p>
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
