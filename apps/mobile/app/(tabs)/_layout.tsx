import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useAuthStore } from "../../stores/auth.store";
import { useTranslation } from "react-i18next";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const tabIcons: Record<string, IoniconsName> = {
  index: "home",
  users: "people",
  settings: "settings",
};

const tabColors = {
  active: "#6366f1",
  inactive: "#94a3b8",
  background: "#ffffff",
  border: "#e2e8f0",
  headerBg: "#ffffff",
  headerTint: "#0f172a",
};

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabColors.active,
        tabBarInactiveTintColor: tabColors.inactive,
        tabBarStyle: {
          backgroundColor: tabColors.background,
          borderTopColor: tabColors.border,
        },
        headerStyle: {
          backgroundColor: tabColors.headerBg,
        },
        headerTintColor: tabColors.headerTint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={tabIcons.index} size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: t("users.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={tabIcons.users} size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings.title"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={tabIcons.settings} size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
