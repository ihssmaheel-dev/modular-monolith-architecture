import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/auth.store";
import { api } from "../../lib/api";
import { getResponseMessage } from "../../lib/api-response";

const PLACEHOLDER_COLOR = "#9CA3AF";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(t("common.error"), t("auth.requiredFields"));
      return;
    }

    setLoading(true);
    try {
      const result = await api.auth.register({ body: { name, email, password } });
      if (result.status !== 201) {
        Alert.alert(
          t("common.error"),
          getResponseMessage(result.body) ?? t("auth.registrationFailed"),
        );
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
            {t("auth.createAccountTitle")}
          </Text>
          <Text className="text-center text-muted-foreground">{t("auth.registerDescription")}</Text>
        </View>

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">{t("auth.name")}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t("auth.namePlaceholder")}
              placeholderTextColor={PLACEHOLDER_COLOR}
              autoCapitalize="words"
              className="rounded-lg border border-input bg-background px-4 py-3 text-foreground"
            />
          </View>

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
              placeholder={t("auth.createPasswordPlaceholder")}
              placeholderTextColor={PLACEHOLDER_COLOR}
              secureTextEntry
              className="rounded-lg border border-input bg-background px-4 py-3 text-foreground"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className="rounded-lg bg-primary py-3"
        >
          <Text className="text-center font-medium text-primary-foreground">
            {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text className="text-center text-sm text-muted-foreground">
            {t("auth.hasAccount")} <Text className="text-primary">{t("auth.signIn")}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
