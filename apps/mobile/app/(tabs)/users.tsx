import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { usersListQuery } from "@/features/users/users.queries";
import { useAuthStore } from "@/stores/auth.store";

export default function Users() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.user?.role);
  const [page, setPage] = useState(1);
  const usersQuery = useQuery({ ...usersListQuery(page, 20), enabled: role === "admin" });

  if (role !== "admin") return <Redirect href="/(tabs)" />;

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={usersQuery.data?.users ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        onRefresh={() => usersQuery.refetch()}
        refreshing={usersQuery.isRefetching}
        ListHeaderComponent={
          <Text className="mb-2 text-lg font-bold text-slate-900">
            {t("users.title")} ({usersQuery.data?.total ?? "—"})
          </Text>
        }
        renderItem={({ item }) => (
          <View className="rounded-xl bg-white p-4 shadow-sm">
            <Text className="font-semibold text-slate-900">{item.name}</Text>
            <Text className="font-mono text-xs text-slate-500">{item.email}</Text>
            <Text className="mt-1 text-[10px] font-medium uppercase text-slate-500">
              {item.role}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          usersQuery.isLoading ? (
            <ActivityIndicator className="mt-10" />
          ) : usersQuery.isError ? (
            <View className="items-center gap-2 rounded-xl border border-red-200 p-6">
              <Text className="text-sm text-red-600">{t("errors.networkError")}</Text>
              <Pressable onPress={() => usersQuery.refetch()}>
                <Text className="text-sm font-medium underline">{t("common.retry")}</Text>
              </Pressable>
            </View>
          ) : (
            <Text className="mt-10 text-center text-sm text-slate-500">{t("users.noUsers")}</Text>
          )
        }
        ListFooterComponent={
          usersQuery.data && usersQuery.data.totalPages > 1 ? (
            <View className="flex-row items-center justify-between pt-2">
              <Pressable
                disabled={page <= 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-4 py-2 disabled:opacity-40"
              >
                <Text className="text-sm font-medium">{t("common.previous")}</Text>
              </Pressable>
              <Text className="text-xs text-slate-500">
                {t("common.pageOf", { page, totalPages: usersQuery.data.totalPages })}
              </Text>
              <Pressable
                disabled={page >= (usersQuery.data?.totalPages ?? 1)}
                onPress={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-4 py-2 disabled:opacity-40"
              >
                <Text className="text-sm font-medium">{t("common.next")}</Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}
