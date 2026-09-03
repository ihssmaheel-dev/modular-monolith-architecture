import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { FRONTEND_ROUTES, ResetPasswordSchema, type ResetPasswordInput } from "@repo/contracts";
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
import { resetPasswordMutationOptions } from "@/features/auth/auth.mutations";
import { FieldError } from "@/features/auth/components/field-error";

export function ResetPasswordForm({ token }: { token: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [complete, setComplete] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token, password: "" },
  });
  const mutation = useMutation({ ...resetPasswordMutationOptions(), onSuccess: () => setComplete(true) });
  const submit = (data: ResetPasswordInput) => {
    if (data.password !== confirmation) {
      form.setError("password", { type: "validate", message: t("auth.passwordsDoNotMatch") });
      return;
    }
    mutation.mutate(data);
  };

  if (!token)
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.invalidToken")}</CardTitle>
          <CardDescription>{t("auth.resetFailed")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" render={<Link to={FRONTEND_ROUTES.forgotPassword} />}>
            {t("auth.sendResetLink")}
          </Button>
        </CardContent>
      </Card>
    );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 w-fit"
          render={<Link to={FRONTEND_ROUTES.auth} />}
        >
          <ArrowLeft className="size-4" />
          {t("auth.backToLogin")}
        </Button>
        <CardTitle>{t("auth.resetPasswordTitle")}</CardTitle>
        <CardDescription>{t("auth.resetPasswordDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {complete ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <p className="text-sm text-muted-foreground">{t("auth.passwordResetDescription")}</p>
            <Button className="w-full" onClick={() => navigate({ to: FRONTEND_ROUTES.auth })}>
              {t("auth.backToLogin")}
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">{t("auth.newPassword")}</Label>
              <Input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              <FieldError message={form.formState.errors.password?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password">{t("auth.confirmPassword")}</Label>
              <Input
                id="reset-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                aria-invalid={
                  confirmation.length > 0 && confirmation !== form.getValues("password")
                }
              />
            </div>
            {mutation.isError && (
              <p className="text-sm text-destructive">{t("auth.resetFailed")}</p>
            )}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? t("auth.resettingPassword") : t("auth.resetPassword")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
