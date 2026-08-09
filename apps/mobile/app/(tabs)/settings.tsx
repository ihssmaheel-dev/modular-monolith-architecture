import { View, Text } from "react-native";
import { useAuthStore } from "../../stores/auth.store";

export default function SettingsTab() {
  const { user } = useAuthStore();

  return (
    <View className="flex-1 bg-background p-4">
      <View className="space-y-6">
        <View>
          <Text className="text-2xl font-bold text-foreground">Settings</Text>
          <Text className="text-muted-foreground">Manage your account</Text>
        </View>

        <View className="rounded-lg border border-border bg-card p-4">
          <Text className="text-sm font-medium text-muted-foreground">Logged in as</Text>
          <Text className="mt-1 font-medium text-foreground">{user?.email}</Text>
        </View>

        <View className="rounded-lg border border-border bg-card p-4">
          <Text className="text-sm font-medium text-muted-foreground">Appearance</Text>
          <Text className="mt-1 text-foreground">System default</Text>
        </View>

        <View className="rounded-lg border border-border bg-card p-4">
          <Text className="text-sm font-medium text-muted-foreground">Notifications</Text>
          <Text className="mt-1 text-foreground">Enabled</Text>
        </View>
      </View>
    </View>
  );
}
