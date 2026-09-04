import * as React from "react";
import { Text, type TextProps } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

export function Label({ className, style, children, ...props }: TextProps & { className?: string }) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <Text className={`text-sm font-medium ${className ?? ""}`} style={[{ color: colors.foreground }, style]} {...props}>
      {children}
    </Text>
  );
}
