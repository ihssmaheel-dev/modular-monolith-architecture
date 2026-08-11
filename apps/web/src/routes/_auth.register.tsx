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

function RegisterPage() {
  const { t } = useTranslation();
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("auth.createAccountTitle")}</CardTitle>
        <CardDescription>{t("auth.registerDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">{t("auth.name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("auth.namePlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <Link to="/login" className="text-primary hover:underline">
            {t("auth.signIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute("/_auth/register")({ component: RegisterPage });
