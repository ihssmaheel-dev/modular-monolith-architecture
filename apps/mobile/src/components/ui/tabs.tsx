import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/theme-provider";
import { mobileTokens } from "@/theme/tokens.generated";

interface TabsProps {
  tabs: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
}

export function Tabs({ tabs, value, onValueChange }: TabsProps) {
  const { resolvedTheme } = useTheme();
  const colors = mobileTokens[resolvedTheme];
  return (
    <View className="flex-row rounded-lg p-1 gap-1" style={{ backgroundColor: colors.muted }}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onValueChange(tab.value)}
            className="flex-1 items-center rounded-md px-3 py-2"
            style={{ backgroundColor: active ? colors.card : "transparent" }}
          >
            <Text className="text-sm font-medium" style={{ color: active ? colors.foreground : colors["muted-foreground"] }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
