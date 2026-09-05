import * as React from "react";
import { Text as RNText, type TextProps } from "react-native";

type TextVariant = "default" | "muted" | "error" | "heading" | "small";

const variantStyles: Record<TextVariant, string> = {
  default: "text-sm text-foreground",
  muted: "text-sm text-muted-foreground",
  error: "text-xs text-destructive",
  heading: "text-2xl font-bold text-foreground",
  small: "text-xs text-muted-foreground",
};

export function Text({
  variant = "default",
  className,
  style,
  children,
  ...props
}: TextProps & { variant?: TextVariant; className?: string }) {
  // Use className for layout, style for color fallback via tokens
  return (
    <RNText className={`${variantStyles[variant]} ${className ?? ""}`} style={style} {...props}>
      {children}
    </RNText>
  );
}
