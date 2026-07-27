import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function UsersScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await api.users.list({ query: { page: 1, limit: 10 } });
      return result.body;
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error loading users</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={data?.users ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200">
            <Text className="font-bold">{item.name}</Text>
            <Text className="text-gray-500">{item.email}</Text>
          </View>
        )}
      />
    </View>
  );
}
