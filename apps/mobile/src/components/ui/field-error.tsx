import * as React from "react";
import { Text } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

export function FieldError({ message }: { message?: string }) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  if (!message) return null;
  return (
    <Text className="text-xs" style={{ color: colors.destructive }}>
      {message}
    </Text>
  );
}
