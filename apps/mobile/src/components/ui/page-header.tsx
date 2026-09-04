import * as React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <View className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
          {title}
        </Text>
        {action}
      </View>
      {description ? (
        <Text className="text-sm" style={{ color: colors["muted-foreground"] }}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function SectionHeader({ title, description }: PageHeaderProps) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <View className="gap-1">
      <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
        {title}
      </Text>
      {description ? (
        <Text className="text-xs" style={{ color: colors["muted-foreground"] }}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}
