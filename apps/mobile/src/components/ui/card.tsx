import * as React from "react";
import { Text, View, type ViewProps } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

export function Card({ className, style, children, ...props }: ViewProps & { className?: string }) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <View
      className={`rounded-2xl p-5 shadow-sm ${className ?? ""}`}
      style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: resolvedTheme === "dark" ? 1 : 0 }, style as unknown as object]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View className={`gap-1.5 ${className ?? ""}`} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ className, children, ...props }: { className?: string; children: React.ReactNode } & React.ComponentProps<typeof Text>) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <Text className={`text-base font-semibold ${className ?? ""}`} style={{ color: colors["card-foreground"] }} {...props}>
      {children}
    </Text>
  );
}

export function CardDescription({ className, children, ...props }: { className?: string; children: React.ReactNode } & React.ComponentProps<typeof Text>) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <Text className={`text-sm ${className ?? ""}`} style={{ color: colors["muted-foreground"] }} {...props}>
      {children}
    </Text>
  );
}

export function CardContent({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View className={`${className ?? ""}`} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View className={`flex-row items-center ${className ?? ""}`} {...props}>
      {children}
    </View>
  );
}
