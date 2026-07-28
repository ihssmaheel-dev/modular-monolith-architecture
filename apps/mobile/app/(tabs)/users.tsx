import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";

export default function UsersTab() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await api.users.list({ query: { page: 1, limit: 10 } });
      return result.body;
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-destructive">Failed to load users</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={data?.users ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        renderItem={({ item }) => (
          <View className="mb-3 rounded-lg border border-border bg-card p-4">
            <Text className="font-medium text-foreground">{item.name}</Text>
            <Text className="text-sm text-muted-foreground">{item.email}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-muted-foreground">No users found</Text>
          </View>
        }
      />
    </View>
  );
}
