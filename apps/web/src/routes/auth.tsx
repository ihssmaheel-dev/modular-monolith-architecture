import { createFileRoute, redirect } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react";
import { FRONTEND_ROUTES } from "@repo/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { useAuthStore } from "@/stores/auth.store";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    inviteToken: typeof search.inviteToken === "string" ? search.inviteToken : undefined,
  }),
  beforeLoad: () => {
    if (useAuthStore.getState().status === "authenticated") {
      throw redirect({ to: FRONTEND_ROUTES.dashboard, replace: true });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const { inviteToken } = Route.useSearch();
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
            <LoginForm inviteToken={inviteToken} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm inviteToken={inviteToken} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
