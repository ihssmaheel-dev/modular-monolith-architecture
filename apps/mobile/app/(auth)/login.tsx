import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/auth.store";
import { api } from "../../lib/api";
import { getResponseMessage } from "../../lib/api-response";

const PLACEHOLDER_COLOR = "#9CA3AF";

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("auth.requiredFields"));
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.login({ body: { email, password } });
      if (result.status !== 200) {
        Alert.alert(t("common.error"), getResponseMessage(result.body) ?? t("auth.loginFailed"));
        return;
      }

      login(result.body);
      router.replace("/(tabs)");
    } catch {
      Alert.alert(t("common.error"), t("errors.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-background p-6">
      <View className="space-y-8">
        <View className="space-y-2">
          <Text className="text-center text-3xl font-bold text-foreground">
            {t("auth.welcomeBack")}
          </Text>
          <Text className="text-center text-muted-foreground">{t("auth.loginDescription")}</Text>
        </View>

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">{t("auth.email")}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.emailPlaceholder")}
              placeholderTextColor={PLACEHOLDER_COLOR}
              keyboardType="email-address"
              autoCapitalize="none"
              className="rounded-lg border border-input bg-background px-4 py-3 text-foreground"
            />
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">{t("auth.password")}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.passwordPlaceholder")}
              placeholderTextColor={PLACEHOLDER_COLOR}
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
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")} <Text className="text-primary">{t("auth.register")}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
