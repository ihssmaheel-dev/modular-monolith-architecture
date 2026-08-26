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
import { useAuthStore } from "@/stores/auth.store";
import { validateInvitationSearch } from "@/lib/invitation-search";

function RegisterPage() {
  const { t } = useTranslation();
  const { invitationToken } = Route.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.auth.register({ body: { name, email, password } });
      if (result.status !== 201) {
        setError(getResponseMessage(result.body) ?? t("auth.registrationFailed"));
        return;
      }
      login({ user: result.body.user });
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
          Onboarding
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {t("auth.createAccountTitle")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("auth.registerDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-sm bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-foreground">
              {t("auth.name")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("auth.namePlaceholder")}
              required
            />
          </div>
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
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-foreground">
              {t("auth.password")}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("auth.createPasswordPlaceholder")}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
          </Button>
        </form>
        <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border pt-4">
          {t("auth.hasAccount")}{" "}
          <Link to="/login" search={{ invitationToken }} className="text-foreground font-semibold hover:underline">
            {t("auth.signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/register")({
  validateSearch: validateInvitationSearch,
  component: RegisterPage,
});
