import * as React from "react";
import { Text, View, type ViewProps } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

interface EmptyStateProps extends ViewProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon, className, ...props }: EmptyStateProps) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <View className={`items-center gap-2 py-8 ${className ?? ""}`} {...props}>
      {icon}
      <Text className="text-sm font-medium text-center" style={{ color: colors.foreground }}>
        {title}
      </Text>
      {description ? (
        <Text className="text-sm text-center" style={{ color: colors["muted-foreground"] }}>
          {description}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

export function InlineEmpty({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <View
      className="rounded-xl border border-dashed p-6 items-center"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <Text style={{ color: colors["muted-foreground"] }}>{children}</Text>
    </View>
  );
}
