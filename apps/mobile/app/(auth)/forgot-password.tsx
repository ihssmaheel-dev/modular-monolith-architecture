import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@repo/contracts";
import { forgotPasswordMutationOptions } from "@/features/auth/auth.mutations";
import { AuthScreen } from "@/components/auth-screen";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const mutation = useMutation({
    ...forgotPasswordMutationOptions(),
    onSuccess: () => setSent(true),
  });

  return (
    <AuthScreen title={t("auth.forgotPassword")} description={t("auth.forgotDescription")}>
      <View style={{ backgroundColor: colors.card }} className="gap-4 rounded-2xl p-5 shadow-sm">
        {sent ? (
          <View className="items-center gap-3">
            <Text className="text-center text-sm text-muted-foreground">
              {t("auth.checkEmailDescription")}
            </Text>
            <Link href="/(auth)/login" className="text-sm font-medium text-foreground underline">
              {t("auth.backToLogin")}
            </Link>
          </View>
        ) : (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">{t("auth.email")}</Text>
              <Controller
                control={form.control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="rounded-lg border border-border px-3 py-2.5 text-base text-foreground"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {form.formState.errors.email && (
                <Text className="text-xs text-destructive">{form.formState.errors.email.message}</Text>
              )}
            </View>
            {mutation.isError && (
              <Text className="text-sm text-destructive">{t("auth.requestFailed")}</Text>
            )}
            <Pressable
              className="rounded-lg bg-primary py-3 disabled:opacity-50"
              disabled={mutation.isPending}
              onPress={form.handleSubmit((data) => mutation.mutate(data))}
            >
              <Text className="text-center font-semibold text-primary-foreground">
                {mutation.isPending ? t("auth.sending") : t("auth.sendResetLink")}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </AuthScreen>
  );
}
