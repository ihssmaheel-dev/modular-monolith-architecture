import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useTranslation } from "react-i18next";

export default function UserDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const result = await api.users.getById({ params: { id: id! } });
      if (result.status !== 200) {
        throw new Error("users.getById failed");
      }
      return result.body;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-destructive">{t("auth.userNotFound")}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <View className="space-y-6">
        <View>
          <Text className="text-2xl font-bold text-foreground">{user.name}</Text>
          <Text className="text-muted-foreground">{user.email}</Text>
        </View>

        <View className="rounded-lg border border-border bg-card p-4">
          <Text className="text-sm font-medium text-muted-foreground">{t("users.userId")}</Text>
          <Text className="mt-1 font-mono text-foreground">{user.id}</Text>
        </View>
      </View>
    </View>
  );
}
