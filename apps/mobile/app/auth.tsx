import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { router } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { getApiClient } from '@/lib/api'

export default function AuthScreen() {
  const { t } = useTranslation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    setLoading(true)
    try {
      const client = getApiClient()
      let res
      if (mode === 'login') {
        res = await client.auth.login({ body: { email, password } })
      } else {
        res = await client.auth.register({ body: { name, email, password } })
      }
      if (res.status === 200 || res.status === 201) {
        setAuth(res.body)
        router.replace('/(tabs)')
      } else {
        Alert.alert(t('errors.unexpected'), JSON.stringify(res.body))
      }
    } catch (e) {
      Alert.alert(t('errors.networkError'), String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
      <View className="gap-6 max-w-md w-full self-center">
        <View>
          <Text className="text-2xl font-bold text-foreground">{mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccountTitle')}</Text>
          <Text className="text-sm text-muted-foreground">{mode === 'login' ? t('auth.loginDescription') : t('auth.registerDescription')}</Text>
        </View>

        <View className="flex-row bg-muted rounded-lg p-1 gap-1">
          <Pressable onPress={() => setMode('login')} className={`flex-1 py-2 rounded-md items-center ${mode === 'login' ? 'bg-card shadow' : ''}`}>
            <Text className={`text-sm font-medium ${mode === 'login' ? 'text-foreground' : 'text-muted-foreground'}`}>{t('auth.login')}</Text>
          </Pressable>
          <Pressable onPress={() => setMode('register')} className={`flex-1 py-2 rounded-md items-center ${mode === 'register' ? 'bg-card shadow' : ''}`}>
            <Text className={`text-sm font-medium ${mode === 'register' ? 'text-foreground' : 'text-muted-foreground'}`}>{t('auth.register')}</Text>
          </Pressable>
        </View>

        <View className="gap-4">
          {mode === 'register' && (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">{t('auth.name')}</Text>
              <TextInput value={name} onChangeText={setName} placeholder={t('auth.namePlaceholder')} placeholderTextColor="#9ca3af" className="border border-input rounded-lg px-3 py-3 text-foreground bg-card" />
            </View>
          )}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">{t('auth.email')}</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder={t('auth.emailPlaceholder')} placeholderTextColor="#9ca3af" autoCapitalize="none" keyboardType="email-address" className="border border-input rounded-lg px-3 py-3 text-foreground bg-card" />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">{t('auth.password')}</Text>
            <TextInput value={password} onChangeText={setPassword} placeholder={t('auth.passwordPlaceholder')} placeholderTextColor="#9ca3af" secureTextEntry className="border border-input rounded-lg px-3 py-3 text-foreground bg-card" />
          </View>
        </View>

        <Pressable onPress={onSubmit} disabled={loading} className="bg-primary rounded-lg py-3 items-center">
          <Text className="text-primary-foreground font-semibold">{loading ? t('common.loading') : mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/')} className="items-center">
          <Text className="text-sm text-muted-foreground">{t('common.back')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
