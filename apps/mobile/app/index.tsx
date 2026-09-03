import { Text, View } from "react-native";
import { LoginSchema } from "@repo/contracts";
import { getMobileEnv } from "@/lib/env";

// Scaffold wiring proof: shared contracts resolve and validate on-device.
const contractCheck = LoginSchema.safeParse({
  email: "dev@example.com",
  password: "password123",
});

export default function Index() {
  const env = getMobileEnv();
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-xl font-bold text-slate-900">Modular Monolith</Text>
      <Text className="mt-2 text-sm text-slate-500">API: {env.EXPO_PUBLIC_API_URL}</Text>
      <Text className="mt-1 text-sm text-slate-500">
        Shared contracts: {contractCheck.success ? "ok" : "broken"}
      </Text>
    </View>
  );
}
