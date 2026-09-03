import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

export function AuthScreen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="w-full max-w-md self-center">
        <Text className="text-center text-3xl font-semibold text-slate-900">{title}</Text>
        <Text className="mt-2 text-center text-sm text-slate-500">{description}</Text>
        <View className="mt-5">{children}</View>
      </View>
    </ScrollView>
  );
}
