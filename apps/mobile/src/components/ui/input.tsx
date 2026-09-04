import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

interface InputProps extends TextInputProps {
  invalid?: boolean;
}

export function Input({ invalid, style, ...props }: InputProps) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <TextInput
      className="rounded-lg px-3 py-2.5 text-base"
      placeholderTextColor={colors["muted-foreground"]}
      style={[
        {
          backgroundColor: colors.card,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: invalid ? colors.destructive : colors.border,
          borderRadius: 8,
        },
        style,
      ]}
      {...props}
    />
  );
}
