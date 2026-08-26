import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/auth.store";
import { useTranslation } from "react-i18next";
import { api } from "../../lib/api";
import { useTenantStore } from "../../stores/tenant.store";
import { TenantSettings } from "../../components/tenant-settings";
import { queryClient } from "../../lib/query-client";

export default function SettingsTab() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const clearTenant = useTenantStore((state) => state.clearTenant);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } finally {
      clearTenant();
      queryClient.clear();
      logout();
      router.replace("/(auth)/login");
    }
  };

  return (
    <View className="flex-1 bg-background p-4">
      <View className="space-y-6">
        <View>
          <Text className="text-2xl font-bold text-foreground">{t("settings.title")}</Text>
          <Text className="text-muted-foreground">{t("settings.manageAccount")}</Text>
        </View>

        <View className="rounded-lg border border-border bg-card p-4">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("settings.loggedInAs")}
          </Text>
          <Text className="mt-1 font-medium text-foreground">{user?.email}</Text>
        </View>

        <View className="rounded-lg border border-border bg-card p-4">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("settings.appearance")}
          </Text>
          <Text className="mt-1 text-foreground">{t("settings.systemDefault")}</Text>
        </View>

        <View className="rounded-lg border border-border bg-card p-4">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("settings.notifications")}
          </Text>
          <Text className="mt-1 text-foreground">{t("settings.enabled")}</Text>
        </View>

        <TenantSettings />

        <TouchableOpacity onPress={handleLogout} className="rounded-lg bg-destructive py-3">
          <Text className="text-center font-medium text-destructive-foreground">
            {t("auth.logout")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
