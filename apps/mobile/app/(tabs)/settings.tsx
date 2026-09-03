import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, type Locale } from "@repo/i18n";
import { getApiClient } from "@/lib/api";
import { applyLocale } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useLocaleStore } from "@/stores/locale.store";

export default function Settings() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { locale, setLocale } = useLocaleStore();

  const changeLocale = (next: Locale) => {
    setLocale(next);
    applyLocale(next);
  };

  const signOut = async () => {
    try {
      await getApiClient().auth.logout();
    } finally {
      clearAuth();
      router.replace("/(auth)/login");
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View>
        <Text className="text-sm font-medium text-slate-900">{t("settings.eyebrow")}</Text>
        <Text className="mt-1 text-2xl font-bold text-slate-900">{t("settings.title")}</Text>
        <Text className="mt-1 text-sm text-slate-500">{t("settings.description")}</Text>
      </View>

      <View className="rounded-2xl bg-white p-5 shadow-sm">
        <Text className="text-base font-bold text-slate-900">{t("settings.profile")}</Text>
        <Text className="mt-1 text-xs text-slate-500">{t("settings.accountSecurityDescription")}</Text>
        <View className="mt-4 gap-3">
          <View>
            <Text className="text-xs text-slate-500">{t("common.name")}</Text>
            <Text className="font-medium text-slate-900">{user?.name}</Text>
          </View>
          <View>
            <Text className="text-xs text-slate-500">{t("settings.emailAddress")}</Text>
            <Text className="font-medium text-slate-900">{user?.email}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-slate-500">{t("settings.authRole")}</Text>
            <Text className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
              {user?.role}
            </Text>
          </View>
        </View>
      </View>

      <View className="rounded-2xl bg-white p-5 shadow-sm">
        <Text className="text-base font-bold text-slate-900">{t("settings.language")}</Text>
        <View className="mt-3 flex-row gap-2">
          {SUPPORTED_LOCALES.map((lng) => (
            <Pressable
              key={lng}
              onPress={() => changeLocale(lng)}
              className={`rounded-lg border px-4 py-2 ${locale === lng ? "border-slate-900 bg-slate-900" : "border-slate-200"}`}
            >
              <Text
                className={`text-sm font-medium ${locale === lng ? "text-white" : "text-slate-700"}`}
              >
                {lng.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable className="rounded-xl border border-red-200 py-3" onPress={signOut}>
        <Text className="text-center font-semibold text-red-600">{t("auth.logout")}</Text>
      </Pressable>
    </ScrollView>
  );
}
