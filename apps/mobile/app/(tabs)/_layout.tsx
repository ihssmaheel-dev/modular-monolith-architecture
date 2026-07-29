import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { useAuthStore } from "../../stores/auth.store";
import { colors } from "@repo/shared";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const tabIcons: Record<string, IoniconsName> = {
  index: "home",
  users: "people",
  settings: "settings",
};

const lightTheme = colors.light;
const darkTheme = colors.dark;

function getTabColors(theme: "light" | "dark") {
  const t = theme === "dark" ? darkTheme : lightTheme;
  return {
    active: `hsl(${t.primary})`,
    inactive: `hsl(${t["muted-foreground"]})`,
    background: `hsl(${t.card})`,
    border: `hsl(${t.border})`,
    headerBg: `hsl(${t.card})`,
    headerTint: `hsl(${t.foreground})`,
  };
}

export default function TabsLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const tabColors = getTabColors("light");

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
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={tabIcons.index} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={tabIcons.users} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={tabIcons.settings} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
