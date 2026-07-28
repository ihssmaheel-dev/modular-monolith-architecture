import { View, Text } from "react-native";

export default function HomeTab() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Welcome</Text>
      <Text className="mt-2 text-muted-foreground">This is your home screen</Text>
    </View>
  );
}
