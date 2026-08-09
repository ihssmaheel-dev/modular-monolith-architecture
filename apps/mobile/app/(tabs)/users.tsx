import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export default function UsersTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT }],
    queryFn: async () => {
      const result = await api.users.list({ query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT } });
      return result.body;
    },
    staleTime: 5 * 60 * 1000,
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
