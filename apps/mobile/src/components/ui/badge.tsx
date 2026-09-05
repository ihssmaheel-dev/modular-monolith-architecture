import * as React from "react";
import { Text, View, type ViewProps } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: ViewProps & { variant?: BadgeVariant; className?: string; children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];

  const bg = React.useMemo(() => {
    switch (variant) {
      case "secondary":
        return colors.secondary;
      case "destructive":
        return colors.destructive;
      case "outline":
        return "transparent";
      default:
        return colors.primary;
    }
  }, [variant, colors]);

  const fg = React.useMemo(() => {
    switch (variant) {
      case "secondary":
        return colors["secondary-foreground"];
      case "destructive":
        return colors["destructive-foreground"];
      case "outline":
        return colors.foreground;
      default:
        return colors["primary-foreground"];
    }
  }, [variant, colors]);

  return (
    <View
      className={`self-start rounded-full px-2.5 py-0.5 ${className ?? ""}`}
      style={{
        backgroundColor: bg,
        borderWidth: variant === "outline" ? 1 : 0,
        borderColor: colors.border,
      }}
      {...props}
    >
      <Text className="text-xs font-medium" style={{ color: fg }}>
        {children}
      </Text>
    </View>
  );
}
