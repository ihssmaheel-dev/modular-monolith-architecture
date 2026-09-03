import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { RegisterSchema, type RegisterInput } from "@repo/contracts";
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
import { registerMutationOptions } from "@/features/auth/auth.mutations";
import { useAuthSuccess } from "@/features/auth/hooks/use-auth-success";
import { FieldError } from "@/features/auth/components/field-error";
import { PasswordInput } from "@/features/auth/components/password-input";

export function RegisterForm({ inviteToken }: { inviteToken?: string }) {
  const { t } = useTranslation();
  const onSuccess = useAuthSuccess(inviteToken);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const mutation = useMutation({ ...registerMutationOptions(), onSuccess });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.createAccountTitle")}</CardTitle>
        <CardDescription>{t("auth.registerDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name">{t("auth.name")}</Label>
            <Input
              id="reg-name"
              autoComplete="name"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name")}
            />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">{t("auth.email")}</Label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">{t("auth.password")}</Label>
            <PasswordInput<RegisterInput>
              id="reg-password"
              register={form.register}
              placeholder={t("auth.createPasswordPlaceholder")}
              invalid={Boolean(form.formState.errors.password)}
              showLabel={t("auth.showPassword")}
              hideLabel={t("auth.hidePassword")}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <p className="text-xs text-muted-foreground">{t("auth.termsNotice")}</p>
          {mutation.isError && (
            <p className="text-sm text-destructive">{t(mutation.error.message)}</p>
          )}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? t("auth.creatingAccount") : t("auth.createAccount")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
