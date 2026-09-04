import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

export function AuthScreen({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="w-full max-w-md self-center">
        <Text className="text-center text-3xl font-semibold" style={{ color: colors.foreground }}>
          {title}
        </Text>
        <Text className="mt-2 text-center text-sm" style={{ color: colors["muted-foreground"] }}>
          {description}
        </Text>
        <View className="mt-5">{children}</View>
      </View>
    </ScrollView>
  );
}
