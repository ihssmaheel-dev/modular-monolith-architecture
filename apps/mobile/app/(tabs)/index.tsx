import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { notesListQuery } from "@/features/notes/notes.queries";
import { useAuthStore } from "@/stores/auth.store";

export default function Dashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const notesQuery = useQuery({ ...notesListQuery(1, 5), enabled: !!user });

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View>
        <Text className="text-2xl font-bold text-slate-900">
          {t("dashboard.welcome", { name: user?.name ?? "" })}
        </Text>
        <Text className="mt-1 text-sm text-slate-500">{t("dashboard.subtitle")}</Text>
      </View>

      <View className="rounded-2xl bg-white p-5 shadow-sm">
        <Text className="text-xs font-medium text-slate-500">{t("notes.title")}</Text>
        {notesQuery.isLoading ? (
          <ActivityIndicator className="mt-3" />
        ) : (
          <Text className="mt-1 text-3xl font-bold text-slate-900">
            {notesQuery.data?.total ? String(notesQuery.data.total) : "0"}
          </Text>
        )}
        <Link href="/(tabs)/notes" className="mt-2 text-sm font-medium text-slate-900 underline">
          {t("notes.title")}
        </Link>
      </View>

      <View className="rounded-2xl bg-white p-5 shadow-sm">
        <Text className="mb-3 text-base font-bold text-slate-900">{t("dashboard.recentNotes")}</Text>
        {notesQuery.isLoading ? (
          <ActivityIndicator />
        ) : notesQuery.isError ? (
          <Text className="text-sm text-red-600">{t("errors.networkError")}</Text>
        ) : notesQuery.data?.items && notesQuery.data.items.length > 0 ? (
          <View className="gap-3">
            {notesQuery.data.items.map((note) => (
              <View key={note.id} className="border-b border-slate-100 pb-3">
                <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
                  {note.title}
                </Text>
                <Text className="text-xs text-slate-500" numberOfLines={1}>
                  {note.content}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center gap-2 py-4">
            <Text className="text-sm font-medium">{t("notes.noNotes")}</Text>
            <Link href="/notes/new" className="text-sm font-medium text-slate-900 underline">
              {t("notes.newNote")}
            </Link>
          </View>
        )}
      </View>

      <Pressable className="rounded-xl bg-slate-900 py-3">
        <Link href="/notes/new" className="text-center font-semibold text-white">
          {t("notes.newNote")}
        </Link>
      </Pressable>
    </ScrollView>
  );
}
