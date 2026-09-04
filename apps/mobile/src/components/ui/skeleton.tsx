import * as React from "react";
import { View, type ViewProps } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

export function Skeleton({ className, style, ...props }: ViewProps & { className?: string }) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <View
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={[{ backgroundColor: colors.muted }, style as any]}
      {...props}
    />
  );
}
