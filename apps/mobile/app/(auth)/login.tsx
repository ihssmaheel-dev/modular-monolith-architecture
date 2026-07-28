import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/auth.store";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message ?? "Login failed");
        return;
      }

      login(data.token, data.user);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-background p-6">
      <View className="space-y-8">
        <View className="space-y-2">
          <Text className="text-center text-3xl font-bold text-foreground">Welcome back</Text>
          <Text className="text-center text-muted-foreground">
            Enter your credentials to sign in
          </Text>
        </View>

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-lg border border-input bg-background px-4 py-3 text-foreground"
            />
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              className="rounded-lg border border-input bg-background px-4 py-3 text-foreground"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="rounded-lg bg-primary py-3"
        >
          <Text className="text-center font-medium text-primary-foreground">
            {loading ? "Signing in..." : "Sign in"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Text className="text-primary">Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
