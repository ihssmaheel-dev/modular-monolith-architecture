import { View, Text } from "react-native";

interface HeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}

export function Header({ title, rightAction }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-border bg-card px-4 py-3">
      <Text className="text-lg font-semibold text-foreground">{title}</Text>
      {rightAction}
    </View>
  );
}
