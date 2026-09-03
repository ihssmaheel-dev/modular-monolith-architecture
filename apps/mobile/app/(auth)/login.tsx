import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoginSchema, type LoginInput } from "@repo/contracts";
import { loginMutationOptions } from "@/features/auth/auth.mutations";
import { useAuthStore } from "@/stores/auth.store";
import { AuthScreen } from "@/components/auth-screen";

export default function Login() {
  const { t } = useTranslation();
  const { inviteToken } = useLocalSearchParams<{ inviteToken?: string }>();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });
  const mutation = useMutation({
    ...loginMutationOptions(),
    onSuccess: (data) => {
      setAuth(data);
      router.replace(
        inviteToken ? { pathname: "/accept-invitation", params: { token: inviteToken } } : "/(tabs)",
      );
    },
  });

  return (
    <AuthScreen title={t("auth.login")} description={t("auth.loginDescription")}>
      <View className="gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <View className="gap-1.5">
          <Text className="text-sm font-medium text-slate-700">{t("auth.email")}</Text>
          <Controller
            control={form.control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-base text-slate-900"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {form.formState.errors.email && (
            <Text className="text-xs text-red-600">{form.formState.errors.email.message}</Text>
          )}
        </View>
        <View className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-slate-700">{t("auth.password")}</Text>
            <Link href="/(auth)/forgot-password" className="text-xs text-slate-900 underline">
              {t("auth.forgotPassword")}
            </Link>
          </View>
          <Controller
            control={form.control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="rounded-lg border border-slate-200 px-3 py-2.5 text-base text-slate-900"
                secureTextEntry={!showPassword}
                autoComplete="password"
                placeholder={t("auth.passwordPlaceholder")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {form.formState.errors.password && (
            <Text className="text-xs text-red-600">{form.formState.errors.password.message}</Text>
          )}
          <Pressable onPress={() => setShowPassword((v) => !v)}>
            <Text className="text-xs text-slate-500">
              {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            </Text>
          </Pressable>
        </View>
        {mutation.isError && (
          <Text className="text-sm text-red-600">{t(mutation.error.message)}</Text>
        )}
        <Pressable
          className="rounded-lg bg-slate-900 py-3 disabled:opacity-50"
          disabled={mutation.isPending}
          onPress={form.handleSubmit((data) => mutation.mutate(data))}
        >
          <Text className="text-center font-semibold text-white">
            {mutation.isPending ? t("auth.signingIn") : t("auth.signIn")}
          </Text>
        </Pressable>
        <Link href="/(auth)/register" className="text-center text-sm text-slate-500">
          {t("auth.noAccount")} {t("auth.register")}
        </Link>
      </View>
    </AuthScreen>
  );
}
