import { View, Text, Pressable, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { router } from 'expo-router'
import { useAuthStore } from '@/stores/auth.store'
import { useLocaleStore } from '@/stores/locale.store'
import { getApiClient } from '@/lib/api'
import type { Locale } from '@repo/i18n'

export default function SettingsTab() {
  const { t, i18n } = useTranslation()
  const { clearAuth, user } = useAuthStore()
  const { locale, setLocale } = useLocaleStore()

  const changeLocale = (next: Locale) => {
    setLocale(next)
    i18n.changeLanguage(next)
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text className="text-2xl font-bold text-foreground">{t('settings.title')}</Text>

      <View className="rounded-xl border border-border p-4 bg-card gap-3">
        <Text className="font-semibold text-foreground">{t('settings.language')}</Text>
        <View className="flex-row gap-2">
          {(['en', 'es', 'fr'] as Locale[]).map((l) => (
            <Pressable
              key={l}
              onPress={() => changeLocale(l)}
              className={`px-4 py-2 rounded-lg border ${locale === l ? 'bg-primary border-primary' : 'bg-background border-border'}`}
            >
              <Text className={locale === l ? 'text-primary-foreground font-medium' : 'text-foreground'}>{l.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {user && (
        <View className="rounded-xl border border-border p-4 bg-card gap-2">
          <Text className="text-sm text-muted-foreground">{t('settings.loggedInAs')}</Text>
          <Text className="font-medium text-foreground">{user.email}</Text>
          <Pressable
            onPress={async () => {
              const client = getApiClient()
              await client.auth.logout().catch(() => null)
              clearAuth()
              router.replace('/auth')
            }}
            className="bg-destructive/10 border border-destructive/20 rounded-lg py-3 items-center mt-2"
          >
            <Text className="text-destructive font-semibold">{t('auth.logout')}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  )
}
