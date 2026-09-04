import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ResetPasswordSchema, type ResetPasswordInput } from "@repo/contracts";
import { resetPasswordMutationOptions } from "@/features/auth/auth.mutations";
import { AuthScreen } from "@/components/auth-screen";

export default function ResetPassword() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [complete, setComplete] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token: token ?? "", password: "" },
  });
  const mutation = useMutation({
    ...resetPasswordMutationOptions(),
    onSuccess: () => setComplete(true),
  });
  const submit = (data: ResetPasswordInput) => {
    if (data.password !== confirmation) {
      form.setError("password", { type: "validate", message: t("auth.passwordsDoNotMatch") });
      return;
    }
    mutation.mutate(data);
  };

  if (!token) {
    return (
      <AuthScreen title={t("auth.invalidToken")} description={t("auth.resetFailed")}>
        <View className="rounded-2xl bg-card p-5 shadow-sm">
          <Link href="/(auth)/forgot-password" className="text-center text-sm font-medium underline">
            {t("auth.sendResetLink")}
          </Link>
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title={t("auth.resetPasswordTitle")} description={t("auth.resetPasswordDescription")}>
      <View className="gap-4 rounded-2xl bg-card p-5 shadow-sm">
        {complete ? (
          <View className="items-center gap-3">
            <Text className="text-center text-sm text-muted-foreground">
              {t("auth.passwordResetDescription")}
            </Text>
            <Pressable
              className="w-full rounded-lg bg-primary py-3"
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text className="text-center font-semibold text-primary-foreground">{t("auth.backToLogin")}</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">{t("auth.newPassword")}</Text>
              <Controller
                control={form.control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="rounded-lg border border-border px-3 py-2.5 text-base text-foreground"
                    secureTextEntry
                    autoComplete="password-new"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {form.formState.errors.password && (
                <Text className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </Text>
              )}
            </View>
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">{t("auth.confirmPassword")}</Text>
              <TextInput
                className="rounded-lg border border-border px-3 py-2.5 text-base text-foreground"
                secureTextEntry
                autoComplete="password-new"
                value={confirmation}
                onChangeText={setConfirmation}
              />
            </View>
            {mutation.isError && (
              <Text className="text-sm text-destructive">{t("auth.resetFailed")}</Text>
            )}
            <Pressable
              className="rounded-lg bg-primary py-3 disabled:opacity-50"
              disabled={mutation.isPending}
              onPress={form.handleSubmit(submit)}
            >
              <Text className="text-center font-semibold text-primary-foreground">
                {mutation.isPending ? t("auth.resettingPassword") : t("auth.resetPassword")}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </AuthScreen>
  );
}
