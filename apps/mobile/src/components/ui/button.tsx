import * as React from "react";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
  default: "px-4 py-2.5",
  sm: "px-3 py-2",
  lg: "px-6 py-3",
  icon: "p-2.5 aspect-square",
};

export function Button({
  variant = "default",
  size = "default",
  loading,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];

  const variantStyle = React.useMemo(() => {
    switch (variant) {
      case "outline":
        return { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border };
      case "secondary":
        return { backgroundColor: colors.secondary };
      case "ghost":
        return { backgroundColor: "transparent" };
      case "destructive":
        return { backgroundColor: colors.destructive };
      case "link":
        return { backgroundColor: "transparent" };
      default:
        return { backgroundColor: colors.primary };
    }
  }, [variant, colors]);

  const textColor = React.useMemo(() => {
    if (variant === "destructive") return colors["destructive-foreground"] ?? "#fff";
    if (variant === "outline" || variant === "ghost" || variant === "link")
      return colors.foreground;
    if (variant === "secondary") return colors["secondary-foreground"];
    return colors["primary-foreground"];
  }, [variant, colors]);

  return (
    <Pressable
      disabled={disabled || loading}
      style={[
        { borderRadius: 8, opacity: disabled ? 0.5 : 1 },
        variantStyle,
        style as unknown as object,
      ]}
      className={`items-center justify-center rounded-lg ${sizeStyles[size]} ${disabled ? "opacity-50" : ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : typeof children === "string" ? (
        <Text style={{ color: textColor, fontWeight: "600", textAlign: "center" }}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
