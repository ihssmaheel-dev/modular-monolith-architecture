import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, MailCheck } from "lucide-react";
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@repo/contracts";
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
import { getApiClient } from "@/lib/api";

export const Route = createFileRoute("/auth/forgot-password")({ component: ForgotPasswordPage });

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const mutation = useMutation({
    mutationFn: async (body: ForgotPasswordInput) => {
      const response = await getApiClient().auth.forgotPassword({ body });
      if (response.status !== 200) throw new Error("auth.requestFailed");
      return response.body;
    },
    onSuccess: () => setSent(true),
  });
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button variant="ghost" size="sm" className="mb-3 w-fit" render={<Link to="/auth" />}>
            <ArrowLeft className="size-4" />
            {t("auth.backToLogin")}
          </Button>
          <CardTitle>{t("auth.forgotPassword")}</CardTitle>
          <CardDescription>{t("auth.forgotDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <MailCheck className="mx-auto size-10 text-primary" />
              <p className="text-sm text-muted-foreground">{t("auth.checkEmailDescription")}</p>
              <Button className="w-full" render={<Link to="/auth" />}>
                {t("auth.backToLogin")}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{t("auth.email")}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              {mutation.isError && (
                <p className="text-sm text-destructive">{t("auth.requestFailed")}</p>
              )}
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? t("auth.sending") : t("auth.sendResetLink")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
